'use client';
import { Users, Calendar as CalendarIcon, Activity, ArrowUpRight, ArrowDownRight, FileEdit, UserPlus, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { name: 'Pacientes Totales', value: '...', change: '0%', bg: 'bg-primary/10', color: 'text-primary', icon: Users },
    { name: 'Citas Hoy', value: '...', change: '0%', bg: 'bg-emerald-100', color: 'text-emerald-600', icon: CalendarIcon },
    { name: 'En Tratamiento', value: '...', change: '0%', bg: 'bg-amber-100', color: 'text-amber-600', icon: Activity },
  ]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState({ action: '', target: '' });

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats([
          { name: 'Pacientes Totales', value: data.totalPatients.value.toString(), change: data.totalPatients.change, bg: 'bg-primary/10', color: 'text-primary', icon: Users },
          { name: 'Citas Hoy', value: data.appointmentsToday.value.toString(), change: data.appointmentsToday.change, bg: 'bg-emerald-100', color: 'text-emerald-600', icon: CalendarIcon },
          { name: 'En Tratamiento', value: data.activeTreatments.value.toString(), change: data.activeTreatments.change, bg: 'bg-amber-100', color: 'text-amber-600', icon: Activity },
        ]);
        
        // Unify appointments and dailyLogs into a sorted timeline
        const events: any[] = [];
        if (data.nextAppointments) {
           data.nextAppointments.forEach((a: any) => events.push({ type: 'appointment', data: a, time: new Date(a.date) }));
        }
        if (data.dailyLogs) {
           data.dailyLogs.forEach((l: any) => events.push({ type: 'log', data: l, time: new Date(l.createdAt) }));
        }
        events.sort((a, b) => b.time.getTime() - a.time.getTime());
        setTimeline(events);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }
    fetchStats();
  }, []);

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/dashboard/log', { ...logForm, severity: 'info' });
      setShowLogModal(false);
      setLogForm({ action: '', target: '' });
      // reload implicitly by simulating
      window.location.reload();
    } catch {
      alert("Error al registrar novedad");
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Panel de Control SGP-FAMAC</h1>
          <p className="text-text-secondary text-sm mt-1">Bienvenido de vuelta. Aquí está el resumen del día.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowLogModal(true)} className="px-4 py-2 bg-primary border border-primary text-white rounded-xl text-sm font-bold shadow-sm hover:bg-primary-hover transition-all">
            + Añadir Novedad
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-surface border border-border text-foreground rounded-xl text-sm font-bold shadow-sm hover:bg-background transition-all">
            Descargar Reporte
          </button>
        </div>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-surface p-6 rounded-2xl shadow-xl w-full max-w-md border border-border">
              <h2 className="text-xl font-bold mb-4">Registro Manual de Bitácora</h2>
              <form onSubmit={handleCreateLog} className="space-y-4">
                <div>
                   <label className="text-sm font-bold text-text-secondary">Acción / Tipo de Evento</label>
                   <input required value={logForm.action} onChange={e => setLogForm({...logForm, action: e.target.value})} placeholder="Ej: Visita de Mantenimiento, Reunión..." className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                </div>
                <div>
                   <label className="text-sm font-bold text-text-secondary">Detalles adicionales</label>
                   <textarea value={logForm.target} onChange={e => setLogForm({...logForm, target: e.target.value})} placeholder="Ej: Reparación del aire acondicionado de sala B." className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                </div>
                <div className="flex gap-3 mt-6">
                   <button type="button" onClick={() => setShowLogModal(false)} className="flex-1 p-3 font-bold text-text-secondary bg-background rounded-xl hover:bg-border transition-colors">Cancelar</button>
                   <button type="submit" className="flex-1 p-3 font-bold text-white bg-primary rounded-xl hover:bg-primary-hover transition-colors">Registrar</button>
                </div>
              </form>
           </motion.div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.name} 
            className="p-6 bg-surface border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-sm font-bold flex items-center ${stat.change.startsWith('+') ? 'text-primary' : 'text-text-secondary'}`}>
                {stat.change}
                {stat.change.startsWith('+') ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-foreground">{stat.value}</h3>
              <p className="text-sm font-semibold text-text-secondary mt-1">{stat.name}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Appointments & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Appointments List */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-surface border border-border rounded-2xl shadow-sm p-6 flex flex-col h-[600px]"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Control del Día</h2>
              <p className="text-xs text-text-secondary font-medium">Bitácora unificada de citas y novedades.</p>
            </div>
            <button className="text-sm text-primary hover:text-primary-hover font-bold px-3 py-1 bg-primary/10 rounded-lg transition-colors">
              Ver calendario completo
            </button>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2">
            {timeline.length > 0 ? timeline.map((evt, idx) => {
              if (evt.type === 'appointment') {
                const appointment = evt.data;
                const patientName = appointment.patient 
                  ? `${appointment.patient.firstName} ${appointment.patient.lastName}` 
                  : appointment.manualPatientName || 'Cita Externa';
                
                const initials = appointment.patient
                  ? `${appointment.patient.firstName[0]}${appointment.patient.lastName[0]}`
                  : patientName.split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase();

                return (
                  <div key={`app-${appointment.id}`} className="flex items-center justify-between p-4 rounded-xl border-l-4 border-emerald-500 bg-background hover:bg-surface transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-black text-emerald-600 shadow-sm uppercase text-xs">
                        {initials}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          {patientName}
                        </h4>
                        <p className="text-xs text-text-secondary font-medium flex items-center gap-1 mt-0.5">
                          Agendado: {appointment.reason || 'Sin motivo especificado'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="text-sm font-bold text-emerald-600">
                        {evt.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">Cita Médica</span>
                    </div>
                  </div>
                );
              } else {
                const log = evt.data;
                const isSystem = log.action.includes('Nuevo') || log.action.includes('Ayuda');
                return (
                  <div key={`log-${log.id}`} className={`flex items-center justify-between p-4 rounded-xl border-l-4 bg-background hover:bg-surface transition-all ${isSystem ? 'border-primary' : 'border-amber-400'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black shadow-sm uppercase text-xs ${isSystem ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-600'}`}>
                        {isSystem ? 'SYS' : 'MAN'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          {log.action}
                        </h4>
                        <p className="text-xs text-text-secondary font-medium flex items-center gap-1 mt-0.5">
                          {log.user}: {log.target}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className={`text-sm font-bold ${isSystem ? 'text-primary' : 'text-amber-500'}`}>
                        {evt.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md bg-slate-100 text-text-secondary">Registro Interno</span>
                    </div>
                  </div>
                );
              }
            }) : (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl">
                <CalendarIcon className="text-text-secondary mb-3 opacity-20" size={40} />
                <p className="text-sm font-medium text-text-secondary">Aún no hay actividad registrada en la bitácora hoy.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface border border-border rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-lg font-bold text-foreground mb-6">Acciones Rápidas</h2>
          <div className="space-y-3">
             <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary hover:shadow-md hover:shadow-primary/10 transition-all text-left group bg-background">
               <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                 <UserPlus size={20} />
               </div>
               <div>
                 <p className="font-bold text-sm text-foreground">Registrar Paciente</p>
                 <p className="text-xs font-medium text-text-secondary mt-0.5">Añadir nuevo expediente</p>
               </div>
             </button>

             <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/10 transition-all text-left group bg-background">
               <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                 <FileEdit size={20} />
               </div>
               <div>
                 <p className="font-bold text-sm text-foreground">Actualizar Historial</p>
                 <p className="text-xs font-medium text-text-secondary mt-0.5">Escribir notas de rutina</p>
               </div>
             </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
