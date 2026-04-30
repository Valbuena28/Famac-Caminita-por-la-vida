import { X, User, Home, Activity, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PatientDetailModal({ patient, onClose }: { patient: any, onClose: () => void }) {
  if (!patient) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#3a0a2b]/80 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-surface w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] border border-border/50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-background">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl uppercase border border-primary/20 shadow-inner">
                {patient.lastName[0]}{patient.firstName[0]}
              </div>
              <div>
                <h2 className="text-3xl font-black text-foreground tracking-tight">
                  {patient.lastName} {patient.firstName} {patient.fileNumber ? `(${patient.fileNumber})` : ''}
                </h2>
                <p className="text-primary font-bold text-sm tracking-wide mt-1">
                  C.I: {patient.ci} • {patient.age} años • Año de Expediente: {patient.historyYear || '2026'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  onClose();
                  window.location.href = `/dashboard/patients/${patient.id}/edit`;
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl transition-colors font-bold text-sm tracking-wide"
              >
                Editar Historial
              </button>
              <button onClick={onClose} className="p-3 bg-surface text-text-secondary hover:bg-rose-500/10 hover:text-rose-500 border border-border rounded-xl transition-all shadow-sm active:scale-95">
                <X size={24} strokeWidth={3}/>
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-surface space-y-8">
            
            {/* 1. Datos del Paciente */}
            <section className="bg-background rounded-3xl border border-border p-7 shadow-sm">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2 mb-6 border-b border-border pb-3">
                <User className="text-primary" size={24} strokeWidth={2.5} /> Información Personal
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div><span className="text-text-secondary block font-bold mb-1">Sexo</span><span className="font-extrabold text-foreground">{patient.gender}</span></div>
                <div><span className="text-text-secondary block font-bold mb-1">Edo. Civil</span><span className="font-extrabold text-foreground">{patient.civilStatus}</span></div>
                <div><span className="text-text-secondary block font-bold mb-1">F. Nacimiento</span><span className="font-extrabold text-foreground">{patient.dateOfBirth}</span></div>
                <div><span className="text-text-secondary block font-bold mb-1">Teléfono Central</span><span className="font-extrabold text-foreground">{patient.phoneNumber}</span></div>
                <div className="col-span-2"><span className="text-text-secondary block font-bold mb-1">Oficio</span><span className="font-extrabold text-foreground">{patient.occupation}</span></div>
                <div className="col-span-1"><span className="text-text-secondary block font-bold mb-1">Lugar Nacimiento</span><span className="font-extrabold text-foreground">{patient.birthPlace || 'N/A'}</span></div>
                <div className="col-span-1"><span className="text-text-secondary block font-bold mb-1">Correo Electrónico</span><span className="font-extrabold text-foreground truncate block bg-surface px-2 rounded-md">{patient.email || 'No registrado'}</span></div>
                <div className="col-span-2 md:col-span-4"><span className="text-text-secondary block font-bold mb-1">Dirección de Vivienda Activa</span><span className="font-extrabold text-foreground block bg-surface p-3 rounded-xl border border-border mt-1">{patient.address}, Mun. {patient.municipality}, Edo. {patient.state}</span></div>
                <div className="col-span-2 md:col-span-4"><span className="text-text-secondary block font-bold mb-1">Persona a Contactar (Emergencia)</span><span className="font-black text-white bg-primary px-4 py-2 inline-block rounded-lg shadow-sm">{patient.emergencyContact}</span></div>
                <div className="col-span-2 md:col-span-4 mt-2"><span className="text-text-secondary block font-bold mb-1">Antecedentes Familiares Críticos</span><span className="font-bold text-foreground block bg-primary/5 p-4 rounded-xl border border-primary/10 mt-1">{patient.familyHistory}</span></div>
              </div>
            </section>

            {/* 2. Informe Médico */}
            <section className="bg-background rounded-3xl border border-border p-7 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              <h3 className="text-lg font-black text-foreground flex items-center gap-2 mb-6 border-b border-border pb-3">
                <Activity className="text-primary" size={24} strokeWidth={2.5}/> Diagnóstico y Parte Oncológico
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div><span className="text-text-secondary block text-[11px] uppercase tracking-widest font-black mb-1">Diagnóstico Oficial</span><span className="font-black text-primary text-xl leading-snug block">{patient.diagnosis}</span></div>
                <div><span className="text-text-secondary block text-[11px] uppercase tracking-widest font-black mb-1">Médico Tratante</span><span className="font-black text-foreground text-xl leading-snug block">{patient.treatingDoctor}</span></div>
                <div><span className="text-text-secondary block font-bold mb-1">Tipo Cirugía Realizada</span><span className="font-bold text-foreground text-base bg-surface p-2 px-3 rounded-lg border border-border inline-block">{patient.surgeryType}</span></div>
                <div><span className="text-text-secondary block font-bold mb-1">Fecha de Cirugía Mencionada</span><span className="font-bold text-foreground text-base bg-surface p-2 px-3 rounded-lg border border-border inline-block">{patient.surgeryDate}</span></div>
                <div className="col-span-1 md:col-span-2"><span className="text-text-secondary block font-bold mb-1">Tratamiento Indicado Principal</span><span className="font-bold bg-primary/10 text-primary px-5 py-3 border border-primary/20 rounded-xl block mt-1 leading-relaxed text-base">{patient.indicatedTreatment}</span></div>
              </div>

              {/* Quimioterapias */}
              <div className="mt-10 border-2 border-primary/20 bg-surface rounded-2xl p-6 shadow-inner">
                 <h4 className="font-black text-primary text-lg flex items-center gap-2 mb-6">Sesiones de Quimioterapia</h4>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div><span className="text-text-secondary block font-bold mb-1">Total de Sesiones</span><span className="font-black text-4xl text-primary block leading-none">{patient.chemo.quantity}</span></div>
                    <div><span className="text-text-secondary block font-bold mb-1">Fecha de Inicio</span><span className="font-bold text-foreground text-base mt-2 block">{patient.chemo.startDate}</span></div>
                    <div>
                      <span className="text-text-secondary block font-bold mb-1">Estado de Progreso</span>
                      <span className={`inline-block mt-1 px-4 py-1.5 font-black rounded-lg text-xs uppercase tracking-wider
                        ${patient.chemo.status === 'En Proceso' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                        {patient.chemo.status}
                      </span>
                    </div>
                    {patient.chemo.endDate && (
                      <div><span className="text-text-secondary block font-bold mb-1">Fecha Finalizada</span><span className="font-black text-emerald-700 text-base mt-2 block">{patient.chemo.endDate}</span></div>
                    )}
                    <div><span className="text-text-secondary block font-bold mb-1">Centro Especializado</span><span className="font-bold text-foreground text-base mt-2 block">{patient.chemo.applicationPlace}</span></div>
                    <div className="col-span-2 md:col-span-4"><span className="text-text-secondary block font-bold mb-2">Detalles del Donante / Suministro</span><span className="font-bold text-foreground block bg-background p-3 rounded-xl border border-border shadow-sm">{patient.chemo.suppliedBy} / {patient.chemo.requestDetails}</span></div>
                 </div>
              </div>

              {/* Observaciones */}
              <div className="mt-10">
                <span className="text-text-secondary font-black mb-3 flex items-center gap-2 px-2">Notas y Observaciones de Enfermería</span>
                <p className="text-[15px] font-bold p-5 bg-surface rounded-2xl border border-border text-foreground leading-relaxed shadow-sm">{patient.observations}</p>
              </div>
            </section>

            {/* 3. Social y Familiar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Ayudas Aprobadas */}
              <section className="bg-background rounded-3xl border border-border p-7 shadow-sm col-span-1 lg:col-span-2">
                <h3 className="text-lg font-black text-foreground flex items-center gap-2 mb-6 border-b border-border pb-3">
                  <Heart className="text-primary" size={24} strokeWidth={2.5}/> Registro de Ayudas Aprobadas
                </h3>
                {patient.approvedAids?.length > 0 ? (
                  <div className="overflow-x-auto border-t border-border mt-2">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-surface text-text-secondary text-xs font-black uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-4">Fecha Emitida</th>
                          <th className="px-4 py-4 w-full">Descripción de la Ayuda Específica</th>
                          <th className="px-4 py-4 text-right">Monto Bs.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {patient.approvedAids.map((aid: any, i: number) => (
                          <tr key={i} className="hover:bg-surface transition-colors border-b border-border/50">
                            <td className="px-4 py-4 font-semibold text-foreground">{aid.date}</td>
                            <td className="px-4 py-4 text-text-secondary font-medium">{aid.description}</td>
                            <td className="px-4 py-4 text-right font-black text-rose-500">
                              {aid.amountBs > 0 ? `${aid.amountBs.toLocaleString()} Bs.` : 'Donación Inst.'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary italic">No se han registrado ayudas en el sistema para este paciente.</p>
                )}
              </section>

              {/* Vivienda e Informe Social */}
              <section className="bg-background rounded-3xl border border-border p-7 shadow-sm">
                <h3 className="text-lg font-black text-foreground flex items-center gap-2 mb-6 border-b border-border pb-3">
                  <Home className="text-primary" size={24} strokeWidth={2.5}/> Reporte Socio-Económico
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-3 bg-surface border border-border rounded-xl px-4">
                    <span className="text-text-secondary font-bold">Tipo de Vivienda</span>
                    <span className="font-black text-foreground uppercase tracking-wide">{patient.social.housingType}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-surface border border-border rounded-xl px-4">
                    <span className="text-text-secondary font-bold">Condición Inmueble</span>
                    <span className="font-black text-foreground uppercase tracking-wide">{patient.social.housingCondition}</span>
                  </div>
                  <div className="pt-4">
                    <span className="text-text-secondary block font-bold mb-3">Síntesis Analítica Socio-Económica</span>
                    <p className="font-bold bg-surface p-4 rounded-xl border border-border text-foreground leading-relaxed">{patient.social.socioEconomicAspect}</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Grupo Familiar Table */}
            <section className="bg-background rounded-3xl border border-border p-7 shadow-sm overflow-hidden">
               <h3 className="text-lg font-black text-foreground flex items-center gap-2 mb-6 border-b border-border pb-3">
                  <User className="text-primary" size={24} strokeWidth={2.5}/> Familiares y Convivientes
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface text-foreground border-b-2 border-border">
                      <tr>
                        <th className="px-6 py-4 font-black tracking-wide text-xs uppercase">Paciente Relacionado</th>
                        <th className="px-6 py-4 font-black tracking-wide text-xs uppercase">C.I / ID</th>
                        <th className="px-6 py-4 font-black tracking-wide text-xs uppercase">Años</th>
                        <th className="px-6 py-4 font-black tracking-wide text-xs uppercase">Rol/Parentesco</th>
                        <th className="px-6 py-4 font-black tracking-wide text-xs uppercase">Estatus Ocupacional</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background">
                      {patient.familyMembers?.map((member: any, i: number) => (
                        <tr key={i} className="hover:bg-surface transition-colors">
                           <td className="px-6 py-4 font-bold text-foreground">{member.fullName}</td>
                           <td className="px-6 py-4 font-bold text-text-secondary">{member.ci}</td>
                           <td className="px-6 py-4 font-bold text-text-secondary">{member.age}</td>
                           <td className="px-6 py-4 font-black text-primary uppercase text-xs">{member.relationship}</td>
                           <td className="px-6 py-4 text-foreground flex items-center gap-2">
                             <span className="font-bold">{member.occupation}</span>
                             {member.works && <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-primary/10 text-primary border border-primary/20 tracking-wider">TRABAJA</span>}
                           </td>
                        </tr>
                      ))}
                      {!patient.familyMembers?.length && (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-text-secondary font-bold">La lista de parentesco no posee registros guardados en sistema.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
            </section>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
