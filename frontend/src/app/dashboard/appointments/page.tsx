'use client';
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, Plus, Search, FileText, Trash2, Edit, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import NewAppointmentModal from '@/components/appointments/NewAppointmentModal';

export default function AppointmentsPage() {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta cita?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la cita");
    }
  };

  const handleEdit = (app: any) => {
    setSelectedAppointment(app);
    setIsModalOpen(true);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayApps = appointments.filter(a => a.date.startsWith(todayStr));
  
  const stats = {
    total: todayApps.length,
    pending: todayApps.filter(a => a.status === 'PENDING').length,
    confirmed: todayApps.filter(a => a.status === 'CONFIRMED' || a.status === 'En Espera').length,
    completed: todayApps.filter(a => a.status === 'COMPLETED' || a.status === 'Atendido').length,
  };

  const currentMonth = new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const dayName = new Date().toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agenda Médica</h1>
          <p className="text-text-secondary text-sm mt-1">Control de citas, revisiones y tratamientos de especialistas.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-primary/20 active:scale-95">
          <Plus size={18} />
          Agendar Cita
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Col: Calendar Widget */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-foreground capitalize">{currentMonth}</h3>
                 <div className="flex gap-1">
                   <button className="p-1 hover:bg-background rounded-lg text-text-secondary transition-colors"><ChevronLeft size={18}/></button>
                   <button className="p-1 hover:bg-background rounded-lg text-text-secondary transition-colors"><ChevronRight size={18}/></button>
                 </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium mb-2 text-text-secondary">
                {['Do','Lu','Ma','Mi','Ju','Vi','Sa'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-sm">
                {Array.from({length: 31}).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === new Date().getDate(); 
                  const hasAppointments = appointments.some(a => new Date(a.date).getDate() === day && new Date(a.date).getMonth() === new Date().getMonth());
                  
                  return (
                    <button 
                      key={day}
                      className={`h-8 flex flex-col items-center justify-center rounded-lg transition-colors relative
                        ${isToday ? 'bg-primary text-white font-bold shadow-sm shadow-primary/30' : 'text-foreground hover:bg-background'}
                      `}
                    >
                      <span>{day}</span>
                      {hasAppointments && !isToday && <span className="w-1 h-1 bg-primary rounded-full absolute bottom-1"></span>}
                    </button>
                  );
                })}
              </div>
           </div>

           {/* Stats Widget */}
           <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 text-primary">
              <h3 className="font-bold text-sm mb-1">Citas Hoy ({new Date().getDate()} {new Date().toLocaleString('es-ES', {month: 'short'})})</h3>
              <p className="text-3xl font-black">{stats.total}</p>
              <div className="mt-3 text-xs font-semibold flex flex-col gap-1 text-primary/80">
                <span className="flex justify-between">Pendientes <span>{stats.pending}</span></span>
                <span className="flex justify-between">Confirmadas <span>{stats.confirmed}</span></span>
                <span className="flex justify-between">Completadas <span>{stats.completed}</span></span>
              </div>
           </div>
        </div>

        {/* Right Col: Daily Schedule List */}
        <div className="lg:col-span-3 bg-surface border border-border rounded-xl shadow-sm flex flex-col h-[70vh]">
          <div className="p-5 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-background rounded-t-xl">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary rounded-xl">
                 <CalendarIcon size={20} />
               </div>
               <div>
                 <h2 className="font-bold text-foreground">Agenda del Día</h2>
                 <p className="text-xs text-text-secondary capitalize">{dayName}</p>
               </div>
             </div>
             
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar doctor o paciente..." 
                  className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-surface">
            {appointments.map((app, i) => {
              const appDate = new Date(app.date);
              const timeString = appDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const ampm = timeString.split(' ')[1] || '';
              const hour = timeString.split(' ')[0] || '';
              
              return (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                key={app.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-background border border-border rounded-xl hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                  <div className="w-12 h-12 rounded-full bg-surface border border-border flex flex-col items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                    <span className="text-[11px] font-black leading-none">{hour}</span>
                    <span className="text-[9px] font-bold uppercase">{ampm}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-base tracking-tight">
                      {app.patient ? `${app.patient.firstName} ${app.patient.lastName}` : app.manualPatientName || 'Paciente Externo'}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-text-secondary font-medium mt-1">
                      <span className="flex items-center gap-1"><User size={12}/> {app.doctor?.name || 'Por asignar'}</span>
                      <span className="flex items-center gap-1"><FileText size={12}/> {app.reason || 'Sin motivo'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pl-16 sm:pl-0">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                    ${app.status === 'CONFIRMED' || app.status === 'En Espera' ? 'bg-primary/10 text-primary border border-primary/20' : 
                      app.status === 'COMPLETED' || app.status === 'Atendido' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}
                  >
                    {app.status}
                  </span>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(app)}
                      className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      title="Editar cita"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(app.id)}
                      className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-all"
                      title="Eliminar cita"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )})}
            
            {appointments.length === 0 && (
              <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                 className="p-8 text-center border-2 border-dashed border-border rounded-xl bg-background"
              >
                 <p className="text-text-secondary font-medium text-sm">No hay citas agendadas para hoy.</p>
                 <button onClick={() => setIsModalOpen(true)} className="mt-3 text-primary text-sm font-bold hover:underline">Agendar paciente ahora</button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <NewAppointmentModal 
          appointment={selectedAppointment}
          onClose={() => { setIsModalOpen(false); setSelectedAppointment(null); }} 
          onSuccess={() => { setIsModalOpen(false); setSelectedAppointment(null); fetchAppointments(); }} 
        />
      )}
    </div>
  );
}
