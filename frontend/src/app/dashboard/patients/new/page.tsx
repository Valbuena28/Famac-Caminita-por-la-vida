'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, User, Activity, Home, Users, PlusCircle, Trash2 } from 'lucide-react';
import api from '@/lib/axios';

export default function NewPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fileNumber: '',
    ci: '',
    dateOfBirth: '',
    age: '',
    gender: 'Femenino',
    civilStatus: 'Soltero/a',
    birthPlace: '',
    occupation: '',
    address: '',
    municipality: '',
    state: 'Zulia',
    phoneNumber: '',
    email: '',
    emergencyContact: '',
    familyHistory: '',
    isDeceased: false,
    
    // Medical
    diagnosis: '',
    treatingDoctor: '',
    surgeryDate: '',
    surgeryType: '',
    indicatedTreatment: '',
    observations: '',
    
    // Chemo 
    chemoQuantity: '',
    chemoStartDate: '',
    chemoEndDate: '',
    chemoStatus: 'No Iniciado',
    chemoApplicationPlace: '',
    chemoSuppliedBy: '',
    chemoRequestDetails: '',
    
    // Social
    housingType: '',
    housingCondition: '',
    socioEconomicAspect: '',
  });

  const [approvedAids, setApprovedAids] = useState([{ date: '', description: '', amountBs: ''}]);
  const [familyMembers, setFamilyMembers] = useState([{ fullName: '', relationship: '', age: '', occupation: ''}]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    let updates: any = { [name]: value };

    if (name === 'dateOfBirth' && value) {
      const dob = new Date(value);
      const today = new Date();
      let calculatedAge = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        calculatedAge--;
      }
      updates.age = calculatedAge > 0 ? calculatedAge.toString() : '0';
    }

    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleAidChange = (index: number, field: string, value: string) => {
    const fresh = [...approvedAids];
    fresh[index] = { ...fresh[index], [field]: value };
    setApprovedAids(fresh);
  };
  const handleFamChange = (index: number, field: string, value: string) => {
    const fresh = [...familyMembers];
    fresh[index] = { ...fresh[index], [field]: value };
    setFamilyMembers(fresh);
  };

  const addAid = () => setApprovedAids([...approvedAids, { date: '', description: '', amountBs: ''}]);
  const addFam = () => setFamilyMembers([...familyMembers, { fullName: '', relationship: '', age: '', occupation: ''}]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if(!formData.firstName || !formData.lastName || !formData.ci || !formData.dateOfBirth) {
        alert("Faltan datos personales obligatorios.");
        setLoading(false);
        return;
      }
      
      const genderMapped = formData.gender === 'Femenino' ? 'FEMALE' : (formData.gender === 'Masculino' ? 'MALE' : 'OTHER');

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        ...(formData.fileNumber?.trim() && { fileNumber: formData.fileNumber.trim() }),
        ci: formData.ci,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        age: parseInt(formData.age) || null,
        gender: genderMapped,
        civilStatus: formData.civilStatus,
        birthPlace: formData.birthPlace,
        occupation: formData.occupation,
        address: formData.address,
        municipality: formData.municipality,
        state: formData.state,
        phoneNumber: formData.phoneNumber,
        ...(formData.email?.trim() && { email: formData.email.trim() }),
        emergencyContact: formData.emergencyContact,
        familyHistory: formData.familyHistory,
        isDeceased: formData.isDeceased,
        
        medicalRecord: formData.diagnosis ? {
          diagnosis: formData.diagnosis,
          treatingDoctor: formData.treatingDoctor,
          ...(formData.surgeryDate && { surgeryDate: new Date(formData.surgeryDate).toISOString() }),
          surgeryType: formData.surgeryType,
          indicatedTreatment: formData.indicatedTreatment,
          observations: formData.observations,
          chemotherapies: formData.chemoQuantity ? [{
            quantity: parseInt(formData.chemoQuantity),
            startDate: new Date(formData.chemoStartDate || new Date()).toISOString(),
            ...(formData.chemoEndDate && { endDate: new Date(formData.chemoEndDate).toISOString() }),
            status: formData.chemoStatus,
            applicationPlace: formData.chemoApplicationPlace,
            suppliedBy: formData.chemoSuppliedBy,
            requestDetails: formData.chemoRequestDetails
          }] : []
        } : undefined,

        familyBackgrounds: approvedAids.filter(a => a.date && a.description).map(a => ({
          date: new Date(a.date).toISOString(),
          description: a.description,
          amountBs: parseFloat(a.amountBs) || null
        })),

        socialReport: formData.housingType ? {
          housingType: formData.housingType,
          housingCondition: formData.housingCondition,
          socioEconomicAspect: formData.socioEconomicAspect
        } : undefined,

        familyMembers: familyMembers.filter(f => f.fullName).map(f => ({
          fullName: f.fullName,
          relationship: f.relationship,
          age: parseInt(f.age) || 0,
          occupation: f.occupation,
          works: !!(f.occupation && f.occupation.length > 0)
        }))
      };

      await api.post('/patients', payload);
      router.push('/dashboard/patients');
    } catch (error: any) {
      console.error(error);
      alert('Error guardando el registro del paciente. Verifica los formatos de las fechas.' + (error.response?.data?.message ? ` (${JSON.stringify(error.response.data.message)})` : ''));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none";
  const labelClass = "text-text-secondary font-bold text-xs uppercase tracking-wider mb-2 block";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/patients" className="p-2 bg-surface hover:bg-background border border-border rounded-lg text-text-secondary transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Nuevo Expediente FAMAC</h1>
            <p className="text-text-secondary font-medium text-sm mt-1">Ingreso de paciente oncológico al sistema central.</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl text-sm font-bold tracking-wide transition-all shadow-xl shadow-primary/30 active:scale-95 disabled:opacity-50"
        >
          <Save size={20} strokeWidth={2.5}/>
          {loading ? 'Guardando...' : 'Guardar Expediente'}
        </button>
      </div>

      <form className="space-y-6">
        
        {/* PERSONAL INFO */}
        <section className="bg-surface rounded-3xl border border-border p-8 shadow-sm">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2 mb-6 border-b border-border pb-4">
            <User className="text-primary" size={24}/> 1. Información Personal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><label className={labelClass}>Nombres *</label><input required name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Apellidos *</label><input required name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>N° Expediente</label><input name="fileNumber" value={formData.fileNumber} onChange={handleChange} className={inputClass} placeholder="Ej: A1, 102..." /></div>
            <div><label className={labelClass}>Cédula *</label><input required name="ci" value={formData.ci} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Fecha Nacimiento *</label><input required type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Edad</label><input name="age" type="number" value={formData.age} readOnly className={`${inputClass} bg-surface cursor-not-allowed opacity-70`} placeholder="Auto" /></div>
            <div>
              <label className={labelClass}>Sexo</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Estado Civil</label>
              <select name="civilStatus" value={formData.civilStatus} onChange={handleChange} className={inputClass}>
                <option value="Soltero/a">Soltero/a</option>
                <option value="Casado/a">Casado/a</option>
                <option value="Divorciado/a">Divorciado/a</option>
                <option value="Viudo/a">Viudo/a</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Estatus Vital</label>
              <select name="isDeceased" value={formData.isDeceased ? 'true' : 'false'} onChange={(e) => setFormData(p => ({...p, isDeceased: e.target.value === 'true'}))} className={inputClass}>
                <option value="false">Activo (Vivo)</option>
                <option value="true">Fallecido</option>
              </select>
            </div>
            <div><label className={labelClass}>Profesión/Oficio</label><input name="occupation" value={formData.occupation} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Teléfono</label><input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Correo Electrónico</label><input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="opcional@correo.com" /></div>
            <div className="md:col-span-3"><label className={labelClass}>Dirección Completa</label><input name="address" value={formData.address} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Municipio</label><input name="municipality" value={formData.municipality} onChange={handleChange} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Estado</label>
              <select name="state" value={formData.state} onChange={handleChange} className={inputClass}>
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
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div><label className={labelClass}>Contacto Emergencia (Persona y Tlf)</label><input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className={inputClass} /></div>
            <div className="md:col-span-3 mt-4"><label className={labelClass}>Antecedentes Familiares (Resumen de afecciones genéticas/previas)</label><textarea name="familyHistory" value={formData.familyHistory} onChange={handleChange} rows={2} className={inputClass} placeholder="Ej: Abuela materna con Cáncer de Mama" /></div>
          </div>
        </section>

        {/* MEDICAL INFO */}
        <section className="bg-surface rounded-3xl border border-border p-8 shadow-sm">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2 mb-6 border-b border-border pb-4">
            <Activity className="text-primary" size={24}/> 2. Informe Médico y Tratamiento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2"><label className={labelClass}>Diagnóstico Principal (Patología)</label><input name="diagnosis" value={formData.diagnosis} onChange={handleChange} className={inputClass} placeholder="Ej: Carcinoma Ductal Infiltrante" /></div>
            <div><label className={labelClass}>Médico Tratante</label><input name="treatingDoctor" value={formData.treatingDoctor} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Tratamiento Indicado</label><input name="indicatedTreatment" value={formData.indicatedTreatment} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Tipo Cirugía Realizada</label><input name="surgeryType" value={formData.surgeryType} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Fecha de Alta Quirúrgica</label><input type="date" name="surgeryDate" value={formData.surgeryDate} onChange={handleChange} className={inputClass} /></div>
            
            {/* Quimios Sub-Bloque */}
            <div className="md:col-span-2 mt-4 p-6 bg-background rounded-2xl border border-primary/20">
               <h3 className="font-bold text-primary mb-4">Información de Quimioterapias</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className={labelClass}>Cant. Sesiones Indicadas</label><input name="chemoQuantity" type="number" value={formData.chemoQuantity} onChange={handleChange} className={inputClass} /></div>
                  <div><label className={labelClass}>Fecha de Inicio</label><input name="chemoStartDate" type="date" value={formData.chemoStartDate} onChange={handleChange} className={inputClass} /></div>
                  
                  <div>
                    <label className={labelClass}>Estado del Ciclo</label>
                    <select name="chemoStatus" value={formData.chemoStatus} onChange={handleChange} className={inputClass}>
                      <option value="No Iniciado">No Iniciado</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Finalizada">Finalizada</option>
                    </select>
                  </div>

                  {formData.chemoStatus === 'Finalizada' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className={labelClass}>Fecha de Conclusión (Fin)</label>
                      <input name="chemoEndDate" type="date" value={formData.chemoEndDate} onChange={handleChange} className={inputClass} />
                    </div>
                  )}

                  <div><label className={labelClass}>Centro de Aplicación</label><input name="chemoApplicationPlace" value={formData.chemoApplicationPlace} onChange={handleChange} className={inputClass} /></div>
                  <div className="md:col-span-2"><label className={labelClass}>Detalles Donación/Suministro</label><input name="chemoSuppliedBy" value={formData.chemoSuppliedBy} onChange={handleChange} className={inputClass} placeholder="Ej: Entregado por FAMAC ciclo 1 a 4" /></div>
               </div>
            </div>

            <div className="md:col-span-2"><label className={labelClass}>Notas y Observaciones (General)</label><textarea name="observations" value={formData.observations} onChange={handleChange} rows={3} className={inputClass}></textarea></div>
          </div>
        </section>

        {/* SOCIAL & FAMILY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <section className="bg-surface rounded-3xl border border-border p-8 shadow-sm">
             <h2 className="text-xl font-black text-foreground flex items-center gap-2 mb-6 border-b border-border pb-4">
               <Home className="text-primary" size={24}/> 3. Estudio Social
             </h2>
             <div className="space-y-5">
               <div><label className={labelClass}>Tipo Vivienda</label><input name="housingType" value={formData.housingType} onChange={handleChange} className={inputClass} placeholder="Ej: Casa, Apartamento, Rancho"/></div>
               <div><label className={labelClass}>Condición Inmueble</label><input name="housingCondition" value={formData.housingCondition} onChange={handleChange} className={inputClass} placeholder="Ej: Propia, Alquilada, Al Cuido"/></div>
               <div><label className={labelClass}>Resumen Socioeconómico</label><textarea name="socioEconomicAspect" value={formData.socioEconomicAspect} onChange={handleChange} rows={4} className={inputClass} placeholder="Evaluación general de recursos e ingresos..."></textarea></div>
             </div>

             <div className="mt-8">
                <h3 className="text-sm font-black text-foreground mb-3 border-b-2 border-border pb-2 flex justify-between items-center">
                  Registro de Ayudas Aprobadas
                  <button type="button" onClick={addAid} className="text-primary hover:text-primary-hover font-bold text-xs flex items-center gap-1"><PlusCircle size={14}/> Añadir fila</button>
                </h3>
                <div className="space-y-4">
                  {approvedAids.map((aid, idx) => (
                    <div key={idx} className="p-4 bg-background border border-border rounded-xl space-y-3 relative group">
                      <button type="button" onClick={() => setApprovedAids(approvedAids.filter((_, i) => i !== idx))} className="absolute top-3 right-3 text-rose-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                      
                      <div className="flex gap-4">
                        <div className="w-1/3">
                           <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Fecha</label>
                           <input type="date" value={aid.date} onChange={e => handleAidChange(idx, 'date', e.target.value)} className={inputClass} />
                        </div>
                        <div className="w-2/3">
                           <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Monto Total (Bs.)</label>
                           <input type="number" placeholder="Ej: 1500" value={aid.amountBs} onChange={e => handleAidChange(idx, 'amountBs', e.target.value)} className={inputClass} />
                        </div>
                      </div>
                      
                      <div>
                         <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Descripción Completa y Observaciones</label>
                         <textarea rows={2} placeholder="Suministros médicos, prótesis, exámenes..." value={aid.description} onChange={e => handleAidChange(idx, 'description', e.target.value)} className={inputClass}></textarea>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
           </section>

           <section className="bg-surface rounded-3xl border border-border p-8 shadow-sm">
             <h2 className="text-xl font-black text-foreground flex items-center gap-2 mb-6 border-b border-border pb-4">
               <Users className="text-primary" size={24}/> 4. Grupo Familiar
             </h2>
             
             <div className="flex justify-between items-center mb-3">
               <span className="text-xs text-text-secondary font-bold">Declare los integrantes que conviven o asisten al paciente.</span>
               <button type="button" onClick={addFam} className="text-primary hover:text-primary-hover font-bold text-xs flex items-center gap-1"><PlusCircle size={14}/> Agregado Familiar</button>
             </div>

             <div className="space-y-4">
               {familyMembers.map((fam, idx) => (
                 <div key={idx} className="p-4 border border-border rounded-xl bg-background space-y-3 relative group">
                   <button type="button" onClick={() => setFamilyMembers(familyMembers.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-rose-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                   <div><label className={labelClass}>Nombre Familiar/Acompañante</label><input value={fam.fullName} onChange={e => handleFamChange(idx, 'fullName', e.target.value)} className={`${inputClass} py-2!`} placeholder="Nombre Completo" /></div>
                   <div className="grid grid-cols-2 gap-3">
                     <div><label className={labelClass}>Parentesco</label><input value={fam.relationship} onChange={e => handleFamChange(idx, 'relationship', e.target.value)} className={`${inputClass} py-2!`} placeholder="Padre, Hija..."/></div>
                     <div><label className={labelClass}>Edad</label><input type="number" value={fam.age} onChange={e => handleFamChange(idx, 'age', e.target.value)} className={`${inputClass} py-2!`}/></div>
                     <div className="col-span-2"><label className={labelClass}>Ocupación / Trabajo</label><input value={fam.occupation} onChange={e => handleFamChange(idx, 'occupation', e.target.value)} className={`${inputClass} py-2!`}/></div>
                   </div>
                 </div>
               ))}
             </div>
           </section>
        </div>

      </form>
    </div>
  );
}
