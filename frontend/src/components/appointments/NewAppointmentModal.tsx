'use client';
import { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';

export default function NewAppointmentModal({ onClose, onSuccess, appointment }: any) {
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isManual, setIsManual] = useState(false);
  
  const [formData, setFormData] = useState({
    patientId: '',
    manualPatientName: '',
    userId: '', 
    date: '',
    time: '',
    reason: 'Consulta de Rutina',
    notes: ''
  });

  useEffect(() => {
    api.get('/patients').then(res => setPatients(res.data));
    api.get('/users?role=DOCTOR').then(res => setDoctors(res.data)).catch(() => setDoctors([]));

    if (appointment) {
      const d = new Date(appointment.date);
      setFormData({
        patientId: appointment.patientId || '',
        manualPatientName: appointment.manualPatientName || '',
        userId: appointment.doctorId || '',
        date: d.toISOString().split('T')[0],
        time: d.toTimeString().split(' ')[0].substring(0, 5),
        reason: appointment.reason || '',
        notes: appointment.notes || ''
      });
      if (appointment.manualPatientName) setIsManual(true);
    }
  }, [appointment]);

  const handleChange = (e: any) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!isManual && !formData.patientId) {
      alert("Selecciona un paciente registrado o cámbiate a ingreso manual.");
      return;
    }
    if(isManual && !formData.manualPatientName) {
      alert("Escribe el nombre del paciente.");
      return;
    }
    if(!formData.date || !formData.time) {
      alert("Selecciona fecha y hora.");
      return;
    }
    setLoading(true);
    try {
      const datetime = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      const payload: any = {
        date: datetime,
        reason: formData.reason,
        notes: formData.notes,
        status: appointment?.status || 'PENDING',
        manualPatientName: isManual ? formData.manualPatientName : null,
        patientId: isManual ? null : formData.patientId,
        doctorId: formData.userId || null
      };

      if (appointment) {
        await api.patch(`/appointments/${appointment.id}`, payload);
      } else {
        await api.post('/appointments', payload);
      }
      onSuccess();
    } catch(err) {
      console.error(err);
      alert("Error guardando cita. Revisa los datos e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold text-foreground focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none";
  const labelClass = "text-text-secondary font-bold text-xs uppercase tracking-wider mb-2 block";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-[#3a0a2b]/80 backdrop-blur-md" onClick={onClose} />
        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="relative bg-background w-full max-w-lg rounded-3xl shadow-2xl p-6 border border-border/50">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                <CalendarIcon className="text-primary"/> 
                {appointment ? 'Editar Cita' : 'Agendar Nueva Cita'}
              </h2>
              <button onClick={onClose} className="p-2 text-text-secondary hover:text-primary bg-surface rounded-xl transition-colors"><X size={20}/></button>
           </div>
           
           <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                 <div className="flex justify-between items-center mb-2">
                   <label className="text-text-secondary font-bold text-xs uppercase tracking-wider">Paciente *</label>
                   <button 
                     type="button" 
                     onClick={() => setIsManual(!isManual)}
                     className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-1 rounded-md hover:bg-primary hover:text-white transition-all shadow-sm"
                   >
                     {isManual ? 'Seleccionar Registrado' : 'Ingreso Manual'}
                   </button>
                 </div>
                 
                 {isManual ? (
                   <input 
                     type="text" 
                     name="manualPatientName" 
                     placeholder="Escribe nombre completo..." 
                     value={formData.manualPatientName} 
                     onChange={handleChange} 
                     className={inputClass} 
                     required 
                   />
                 ) : (
                   <select name="patientId" value={formData.patientId} onChange={handleChange} className={inputClass} required={!isManual}>
                     <option value="">Seleccione un paciente registrado...</option>
                     {patients.map(p => <option key={p.id} value={p.id}>{p.ci} - {p.lastName} {p.firstName}</option>)}
                   </select>
                 )}
              </div>

              <div>
                <label className={labelClass}>Médico (Opcional)</label>
                <select name="userId" value={formData.userId} onChange={handleChange} className={inputClass}>
                  <option value="">Asignar médico luego...</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Fecha *</label><input type="date" name="date" required value={formData.date} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>Hora *</label><input type="time" name="time" required value={formData.time} onChange={handleChange} className={inputClass} /></div>
              </div>

              <div><label className={labelClass}>Motivo/Servicio</label><input type="text" name="reason" value={formData.reason} onChange={handleChange} className={inputClass} /></div>
              
              <div className="pt-4">
                <button type="submit" disabled={loading} className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-black tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                  <Save size={20}/> {loading ? 'Guardando...' : appointment ? 'Guardar Cambios' : 'Confirmar Cita'}
                </button>
              </div>
           </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
