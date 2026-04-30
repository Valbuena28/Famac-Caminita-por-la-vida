'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, FileSpreadsheet, UploadCloud, Link as LinkIcon, DollarSign, Briefcase, Activity, HeartHandshake, Building, Users, Landmark, Calculator, Receipt, CheckCircle2, Download, X } from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';

export default function FinancePage() {
  const [userRole, setUserRole] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('http://localhost:5678/webhook/52a4dfed-41a9-4ceb-ad4b-11e20eda59dc');
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [financeData, setFinanceData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('Resumen_Totales');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || '');
    
    const savedUrl = localStorage.getItem('n8n_webhook_url');
    if (savedUrl) setWebhookUrl(savedUrl);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      setErrorMsg('');
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpload = async () => {
    if (!webhookUrl) return setErrorMsg('Falta la URL del Webhook.');
    if (files.length === 0) return setErrorMsg('Selecciona al menos un archivo Excel.');

    localStorage.setItem('n8n_webhook_url', webhookUrl);
    setIsUploading(true);
    setErrorMsg('');
    
    try {
      const formData = new FormData();
      files.forEach((file, idx) => {
         // Se agrupan bajo "document" o como array, soporta iteraciones de n8n
         formData.append(`document`, file);
      });

      const response = await axios.post('/api/finance', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'x-webhook-url': webhookUrl
        }
      });

      setFinanceData(response.data);
      setActiveTab('Resumen_Totales'); 
    } catch (err: any) {
      console.error('Error enviando a n8n:', err);
      setErrorMsg('Error de conexión con n8n. Verifique que el servidor devuelva el JSON estipulado.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadExcel = () => {
    if (!financeData || !financeData.resumenMensual || !financeData.detalleOperaciones) {
      alert("No hay datos formateados de n8n para exportar.");
      return;
    }
    try {
      const { detalleOperaciones, resumenMensual: totales } = financeData;
      const libroExcel = XLSX.utils.book_new();

      const catPresentes = Array.from(new Set(detalleOperaciones.map((i: any) => String(i.Categoria || i.categoria).toLowerCase().trim())));
      const valid = (m: string) => catPresentes.some((c: any) => c.includes(m));

      let dataResumenRaw = [
        { Categoría: "Ayudas", "Total Gastado": totales.ayudas || 0, match: 'ayuda' },
        { Categoría: "Administrativo", "Total Gastado": totales.administrativo || 0, match: 'administrativo' },
        { Categoría: "Gastos de Actividad", "Total Gastado": totales.gastosActividad || 0, match: 'actividad' },
        { Categoría: "Voluntariado", "Total Gastado": totales.voluntariado || 0, match: 'voluntariado' },
        { Categoría: "Alquileres", "Total Gastado": totales.alquileres || 0, match: 'alquilere' },
        { Categoría: "Nómina y Contaduría", "Total Gastado": totales.nominaContaduria || 0, match: 'nómina' },
        { Categoría: "Pago Impuestos", "Total Gastado": totales.pagoImpuestos || 0, match: 'impuesto' },
        { Categoría: "Otros Gastos", "Total Gastado": totales.otrosGastos || totales.otros || 0, match: 'otro' }
      ];

      let dataResumen = dataResumenRaw
        .filter(r => Number(r["Total Gastado"]) > 0 && valid(r.match))
        .map(r => ({ Categoría: r.Categoría, "Total Gastado": r["Total Gastado"] }));

      dataResumen.push({ Categoría: "TOTAL DEL MES", "Total Gastado": totales.gastoTotalMes || 0 });
      
      const applyColumnWidths = (sheet: XLSX.WorkSheet, data: any[]) => {
        if (!data || data.length === 0) return;
        const keys = Object.keys(data[0]);
        const colsWidth = keys.map(key => {
          let maxLen = key.length;
          data.forEach(row => {
            const val = row[key];
            if (val !== undefined && val !== null) {
              maxLen = Math.max(maxLen, val.toString().length);
            }
          });
          return { wch: maxLen + 3 }; 
        });
        sheet['!cols'] = colsWidth;
      };

      const hojaResumen = XLSX.utils.json_to_sheet(dataResumen);
      applyColumnWidths(hojaResumen, dataResumen);
      XLSX.utils.book_append_sheet(libroExcel, hojaResumen, "Resumen_Totales");

      const listaCategorias = Array.from(new Set(detalleOperaciones.map((item: any) => item.Categoria || item.categoria))).filter(Boolean) as string[];

      listaCategorias.forEach(categoria => {
        const gastosDeEstaCategoria = detalleOperaciones.filter((item: any) => item.Categoria === categoria || item.categoria === categoria);
        const hoja = XLSX.utils.json_to_sheet(gastosDeEstaCategoria);
        applyColumnWidths(hoja, gastosDeEstaCategoria);
        let safeName = categoria.substring(0, 30).replace(/[\\/*?:[\]]/g, '');
        XLSX.utils.book_append_sheet(libroExcel, hoja, safeName || "Data"); 
      });

      XLSX.writeFile(libroExcel, "Contabilidad_FAMAC_Ordenada.xlsx");
      alert("¡Proceso exitoso! Tu Excel con las pestañas separadas se está descargando.");
    } catch (error) {
      console.error('Error en Excel:', error);
      alert("Error crítico construyendo el archivo Excel.");
    }
  };

  if (userRole && userRole !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center shadow-inner">
          <Lock size={48} strokeWidth={2.5}/>
        </div>
        <h2 className="text-3xl font-black text-foreground">Acceso Denegado</h2>
        <p className="text-text-secondary font-medium max-w-lg">Este módulo de Contabilidad y Finanzas es exclusivo para los Administradores.</p>
      </div>
    );
  }

  // Filtrado Estricto de Tarjetas Visibles (Solo si verdaderamente existen en los registros detallados)
  const categoriasPresentes = financeData?.detalleOperaciones 
    ? Array.from(new Set(financeData.detalleOperaciones.map((i: any) => String(i.Categoria || i.categoria).toLowerCase().trim())))
    : [];
  const isValidCat = (matchStr: string) => categoriasPresentes.some((real: any) => real.includes(matchStr));
  
  const totales = financeData?.resumenMensual || {};
  const metricCards = [
    { title: 'Ayudas a Pacientes', key: 'ayudas', match: 'ayuda', icon: HeartHandshake, color: 'text-rose-500', bg: 'bg-rose-100' },
    { title: 'Gastos Administrativos', key: 'administrativo', match: 'administrativo', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-100' },
    { title: 'Gastos de Actividad', key: 'gastosActividad', match: 'actividad', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { title: 'Voluntariado', key: 'voluntariado', match: 'voluntariado', icon: Users, color: 'text-amber-500', bg: 'bg-amber-100' },
    { title: 'Alquileres Operativos', key: 'alquileres', match: 'alquilere', icon: Building, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    { title: 'Nómina y Contaduría', key: 'nominaContaduria', match: 'nómina', icon: Receipt, color: 'text-fuchsia-500', bg: 'bg-fuchsia-100' },
    { title: 'Pago de Impuestos', key: 'pagoImpuestos', match: 'impuesto', icon: Landmark, color: 'text-slate-500', bg: 'bg-slate-200' },
    { title: 'Otros Gastos', key: 'otrosGastos', match: 'otro', icon: Landmark, color: 'text-slate-500', bg: 'bg-slate-200' },
  ].filter(m => Number(totales[m.key]) > 0 && isValidCat(m.match));

  let tabs = ['Resumen_Totales'];
  if (financeData?.detalleOperaciones) {
     const cats = Array.from(new Set(financeData.detalleOperaciones.map((i: any) => i.Categoria || i.categoria))).filter(Boolean) as string[];
     tabs = [...tabs, ...cats];
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Finanzas y Contabilidad</h1>
          <p className="text-text-secondary font-medium text-sm mt-1">Inteligencia Contable Automatizada (Pipeline n8n).</p>
        </div>
        
        {financeData && (
          <button 
            onClick={handleDownloadExcel}
            className="flex items-center gap-2 py-2.5 px-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
             <Download size={18}/> Descargar Reporte (Excel Múltiple)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-soft">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
                   <LinkIcon size={20} strokeWidth={2.5}/>
                </div>
                <div>
                   <h3 className="font-black text-foreground">Webhook Local n8n</h3>
                </div>
             </div>
             <input 
               type="text" 
               value={webhookUrl}
               onChange={(e) => setWebhookUrl(e.target.value)}
               placeholder="http://localhost:5678/webhook/..."
               className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none text-foreground"
             />
          </div>

          <div className="bg-surface border border-border rounded-3xl p-6 shadow-soft text-center group transition-all relative overflow-hidden">
             <div className="relative z-10">
               <div className="w-16 h-16 bg-primary/10 text-primary rounded-full mx-auto flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <FileSpreadsheet size={28} strokeWidth={2}/>
               </div>
               <h3 className="font-black text-foreground text-lg mb-1">Cargar Datos</h3>
               <p className="text-sm text-text-secondary font-medium mb-6 px-2">
                 Arrastra o busca múltiples archivos que desees sumar y procesar simultáneamente a través del n8n.
               </p>
               
               <input type="file" id="file-upload" className="hidden" accept=".xlsx, .xls, .csv" multiple onChange={handleFileChange} />
               <label htmlFor="file-upload" className="inline-block w-full py-3 px-4 bg-background border-2 border-dashed border-border rounded-xl font-bold cursor-pointer hover:bg-surface transition-colors text-text-secondary hover:text-primary truncate">
                 Examinar Múltiples...
               </label>

               {/* LISTA DE ARCHIVOS SELECCIONADOS */}
               {files.length > 0 && (
                 <div className="mt-4 space-y-2 text-left">
                   {files.map((f, i) => (
                     <div key={i} className="flex justify-between items-center bg-background border border-border p-2 px-3 rounded-lg shadow-xs">
                       <span className="text-xs font-semibold text-foreground truncate">{f.name}</span>
                       <button onClick={() => removeFile(i)} className="text-rose-500 hover:bg-rose-100 p-1.5 rounded-md transition-colors" title="Quitar Archivo">
                          <X size={14} strokeWidth={3}/>
                       </button>
                     </div>
                   ))}
                 </div>
               )}

               {errorMsg && <p className="mt-4 text-xs font-bold text-rose-500 bg-rose-50 p-2 rounded-lg border border-rose-100">{errorMsg}</p>}

               <button 
                 onClick={handleUpload}
                 disabled={isUploading}
                 className={`w-full mt-6 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-white shadow-lg transition-all ${isUploading ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover active:scale-95 shadow-primary/30 hover:-translate-y-1'}`}
               >
                 {isUploading ? "Ejecutando Flujo n8n..." : <><UploadCloud size={20}/> Procesar Libro(s)</>}
               </button>
             </div>
          </div>
        </div>

        <div className="xl:col-span-3">
          {financeData ? (
             <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border border-border rounded-3xl shadow-soft min-h-[500px] flex flex-col overflow-hidden">
                
                <div className="flex border-b border-border bg-background overflow-x-auto w-full custom-scrollbar">
                  {tabs.map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap px-6 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === tab ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-secondary hover:text-foreground hover:bg-surface'}`}
                    >
                      {tab.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div className="p-6 md:p-8 flex-1 bg-surface overflow-auto">
                    <AnimatePresence mode='wait'>
                       {activeTab === 'Resumen_Totales' ? (
                          <motion.div key="resumen" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-border">
                                <div>
                                  <h2 className="text-2xl font-black text-foreground flex items-center gap-2">Libro Contable Procesado <CheckCircle2 className="text-emerald-500" size={24}/></h2>
                                  <p className="text-text-secondary font-medium mt-1">Sumatorias precisas extraídas directamente de las transacciones reales devueltas.</p>
                                </div>
                                <div className="mt-4 sm:mt-0 bg-primary/10 px-5 py-3 rounded-2xl border border-primary/20 text-right shrink-0">
                                   <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Gasto Total</p>
                                   <p className="text-3xl font-black text-foreground">{totales.gastoTotalMes !== undefined ? `Ref ${Number(totales.gastoTotalMes).toLocaleString('es-VE')}` : '---'}</p>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                               {metricCards.length > 0 ? metricCards.map((metric) => (
                                  <div key={metric.key} className="p-5 rounded-2xl border border-border bg-background flex items-center gap-4 hover:shadow-md hover:border-primary/30 transition-all">
                                     <div className={`w-12 h-12 rounded-full ${metric.bg} ${metric.color} flex items-center justify-center shrink-0`}><metric.icon size={24} strokeWidth={2.5}/></div>
                                     <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">{metric.title}</p>
                                        <p className="font-black text-xl text-foreground mt-0.5">{totales[metric.key] !== undefined ? `Ref ${Number(totales[metric.key]).toLocaleString('es-VE')}` : '0'}</p>
                                     </div>
                                  </div>
                               )) : (
                                  <div className="col-span-full p-8 text-center text-text-secondary font-medium border border-dashed rounded-xl">
                                     No hay categorías detectadas con montos mayores a cero en los archivos subidos.
                                  </div>
                               )}
                             </div>
                          </motion.div>
                       ) : (
                          <motion.div key="data-table" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                              <div className="overflow-x-auto rounded-xl border border-border bg-background">
                                <table className="w-full text-left border-collapse">
                                   <thead>
                                      <tr className="bg-surface border-b border-border">
                                         {Object.keys(financeData.detalleOperaciones.filter((i: any) => i.Categoria === activeTab || i.categoria === activeTab)[0] || {}).map(k => (
                                           <th key={k} className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-text-secondary">{k}</th>
                                         ))}
                                      </tr>
                                   </thead>
                                   <tbody className="divide-y divide-border">
                                      {financeData.detalleOperaciones.filter((i: any) => i.Categoria === activeTab || i.categoria === activeTab).map((row: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-surface/50 transition-colors">
                                           {Object.values(row).map((val: any, jdx: number) => (
                                             <td key={jdx} className="px-5 py-4 text-sm font-medium text-foreground whitespace-nowrap">{val}</td>
                                           ))}
                                        </tr>
                                      ))}
                                      {financeData.detalleOperaciones.filter((i: any) => i.Categoria === activeTab || i.categoria === activeTab).length === 0 && (
                                        <tr><td colSpan={10} className="px-5 py-6 text-center text-text-secondary font-medium">No hay registros transaccionales para esta pestaña.</td></tr>
                                      )}
                                   </tbody>
                                </table>
                              </div>
                          </motion.div>
                       )}
                    </AnimatePresence>
                </div>
             </motion.div>
          ) : (
             <div className="h-full min-h-[500px] border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-surface/50">
                <div className="w-24 h-24 bg-background border border-border rounded-full flex items-center justify-center text-border mb-6">
                   <Calculator size={48} strokeWidth={1}/>
                </div>
                <h2 className="text-2xl font-black text-foreground mb-2">Panel Contable Inactivo</h2>
                <p className="text-text-secondary font-medium max-w-sm">
                  Arrastra tu archivo Excel o añade múltiples documentos para que n8n los clasifique y sume la información vital.
                </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
