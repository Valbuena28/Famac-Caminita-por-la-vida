'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, Edit2, FileText, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';
import PatientDetailModal from '@/components/patients/PatientDetailModal';
import api from '@/lib/axios';

function mapPatientData(apiPatient: any) {
  const medRecord = apiPatient.medicalRecords?.[0] || {};
  const chemoNode = medRecord.chemotherapies?.[0] || {};
  
  return {
    ...apiPatient,
    fileNumber: apiPatient.fileNumber || '',
    familyHistory: apiPatient.familyHistory || 'Sin antecedentes familiares registrados.',
    dateOfBirth: new Date(apiPatient.dateOfBirth).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    diagnosis: medRecord.diagnosis || 'Sin registro',
    treatingDoctor: medRecord.treatingDoctor || 'No asignado',
    surgeryDate: medRecord.surgeryDate ? new Date(medRecord.surgeryDate).toLocaleDateString('es-ES') : 'N/A',
    surgeryType: medRecord.surgeryType || 'Ninguna',
    indicatedTreatment: medRecord.indicatedTreatment || 'Ninguno',
    observations: medRecord.observations || 'Sin notas disponibles.',
    chemo: {
      quantity: chemoNode.quantity || 0,
      startDate: chemoNode.startDate ? new Date(chemoNode.startDate).toLocaleDateString() : 'N/A',
      endDate: chemoNode.endDate ? new Date(chemoNode.endDate).toLocaleDateString() : null,
      status: chemoNode.status || 'No Iniciado',
      applicationPlace: chemoNode.applicationPlace || 'N/A',
      suppliedBy: chemoNode.suppliedBy || 'N/A',
      requestDetails: chemoNode.requestDetails || '...'
    },
    approvedAids: apiPatient.familyBackground?.map((fb: any) => ({
      date: new Date(fb.date).toLocaleDateString(),
      description: fb.description,
      amountBs: fb.amountBs || 0
    })) || [],
    social: apiPatient.socialReport || {
      housingType: 'N/A',
      housingCondition: 'N/A',
      socioEconomicAspect: 'Sin reporte socio-económico cargado en base de datos.'
    },
    familyMembers: apiPatient.familyMembers || []
  };
}

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [userRole, setUserRole] = useState('');

  // Estados de Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filterState, setFilterState] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterChemo, setFilterChemo] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || '');
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await api.get('/patients', { params: { search: searchTerm } });
        setPatients(data.map(mapPatientData));
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };
    
    const timeoutId = setTimeout(fetchPatients, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const filteredPatients = patients.filter(p => {
    if (filterState && p.state !== filterState) return false;
    if (filterStatus && (p.status || 'Activo') !== filterStatus) return false;
    if (filterChemo && p.chemo.status !== filterChemo) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
           aside, nav, header, .no-print { display: none !important; }
           main { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
           .bg-surface { box-shadow: none !important; border: 1px solid #ddd !important; }
        }
      `}} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Directorio FAMAC</h1>
          <p className="text-text-secondary font-medium text-sm mt-1">
            Gestiona el historial médico detallado y reportes sociales de los pacientes.
          </p>
        </div>
        <Link href="/dashboard/patients/new" className="flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl text-sm font-bold tracking-wide transition-all shadow-xl shadow-primary/30 active:scale-95 hover:-translate-y-1">
          <Plus size={20} strokeWidth={3}/>
          Nuevo Registro 
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-surface border-2 border-border rounded-3xl shadow-sm p-4 md:p-5 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="no-print relative w-full md:w-[450px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={20} strokeWidth={2.5}/>
          <input 
            type="text" 
            placeholder="Buscar paciente por C.I, Nombre o Diagnóstico..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => window.print()} className="no-print flex items-center justify-center gap-2 px-5 py-3.5 bg-surface border border-border text-foreground hover:bg-background rounded-2xl text-sm font-bold transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Imprimir
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`no-print flex items-center justify-center gap-2 px-5 py-3.5 flex-1 md:flex-none border text-foreground rounded-2xl text-sm font-bold transition-all shadow-sm hover:-translate-y-0.5 ${showFilters ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border hover:bg-surface'}`}
          >
            <Filter size={18} strokeWidth={2.5}/>
            Filtros
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="no-print bg-surface border border-border rounded-2xl shadow-sm p-5 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Estado Geográfico</label>
            <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none">
              <option value="">Todos los Estados</option>
              <option value="Zulia">Zulia</option>
              <option value="Falcón">Falcón</option>
              <option value="Trujillo">Trujillo</option>
              <option value="Lara">Lara</option>
              <option value="Mérida">Mérida</option>
              <option value="Táchira">Táchira</option>
              <option value="Caracas">Caracas</option>
              <option value="Miranda">Miranda</option>
              <option value="Carabobo">Carabobo</option>
              <option value="Aragua">Aragua</option>
              <option value="Anzoátegui">Anzoátegui</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Estatus Vital</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none">
              <option value="">Todos los Registros</option>
              <option value="Activo">Activo</option>
              <option value="Fallecido">Fallecido</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Ciclo de Quimioterapia</label>
            <select value={filterChemo} onChange={(e) => setFilterChemo(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none">
              <option value="">Cualquier Ciclo</option>
              <option value="No Iniciado">No Iniciado</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </div>
        </motion.div>
      )}

      {/* Data Table */}
      <div className="bg-surface border-2 border-border rounded-3xl shadow-md overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background border-b-2 border-border text-text-secondary">
              <tr>
                <th className="px-6 py-5 font-black uppercase tracking-wider text-xs">Información del Paciente</th>
                <th className="px-6 py-5 font-black uppercase tracking-wider text-xs">Diagnóstico / Tratar</th>
                <th className="px-6 py-5 font-black uppercase tracking-wider text-xs">Contacto Rápido</th>
                <th className="px-6 py-5 font-black uppercase tracking-wider text-xs">Estado</th>
                <th className="px-6 py-5 font-black uppercase tracking-wider text-xs text-right no-print">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPatients.map((patient, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={patient.id} 
                  onClick={() => setSelectedPatient(patient)}
                  className="hover:bg-background transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-sm uppercase shadow-sm">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </div>
                      <div>
                        {/* Formato solicitado: "Ana Isabel (A1)" */}
                        <p className="font-black text-primary text-[15px] group-hover:text-primary-hover transition-colors">{patient.lastName} {patient.firstName} {patient.fileNumber ? `(${patient.fileNumber})` : ''}</p>
                        <p className="text-xs font-bold text-text-secondary mt-0.5 tracking-wider">C.I: {patient.ci}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <p className="font-extrabold text-foreground">{patient.diagnosis}</p>
                     <p className="font-semibold text-xs text-text-secondary mt-1 uppercase tracking-wide">{patient.treatingDoctor}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-foreground">{patient.phoneNumber || 'N/A'}</p>
                    <p className="text-[11px] font-bold text-text-secondary mt-1 tracking-wider uppercase">{patient.municipality || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide border
                      ${!patient.status || patient.status === 'Activo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        patient.status === 'Fallecido' ? 'bg-surface text-text-secondary border-border opacity-60' : 
                        'bg-amber-50 text-amber-700 border-amber-200'}`}
                    >
                      {patient.status || 'Activo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right no-print">
                    <div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-colors tooltip-trigger" onClick={() => setSelectedPatient(patient)} title="Ver Historial Completo">
                        <FileText size={20} strokeWidth={2.5}/>
                      </button>
                      
                      {['ADMIN', 'RECEPTIONIST'].includes(userRole) && (
                        <Link href={`/dashboard/patients/${patient.id}/edit`} className="p-2 text-text-secondary hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Editar Expediente">
                          <Edit2 size={20} strokeWidth={2.5}/>
                        </Link>
                      )}

                      {['ADMIN', 'DOCTOR'].includes(userRole) && (
                        <button className={`p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ${patient.status === 'Fallecido' ? 'opacity-30 cursor-not-allowed' : ''}`} title="Marcar deceso">
                          <HeartPulse size={20} strokeWidth={2.5}/>
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                   <td colSpan={5} className="py-20 text-center text-text-secondary font-bold text-lg">No se encontraron pacientes con estos filtros de búsqueda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPatient && (
        <PatientDetailModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
      )}
    </div>
  );
}
