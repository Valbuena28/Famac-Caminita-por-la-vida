'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, Plus, ArrowLeft, Wallet, Activity, Stethoscope, Users } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '@/lib/axios';
import ThermometerChart from '@/components/walk/ThermometerChart';

const COLORS = ['#e04bd6', '#a78bfa', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

interface Allocation {
  id: string; concept: string; amount: string; quantity?: number; notes?: string; createdAt: string;
  patient?: { firstName: string; lastName: string; ci: string };
}

export default function TraceabilityPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [allocForm, setAllocForm] = useState({ concept: '', amount: '', quantity: 0, notes: '' });
  const [expenseForm, setExpenseForm] = useState({ concept: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });

  useEffect(() => {
    api.get('/walk-events').then(r => {
      setEvents(r.data);
      const active = r.data.find((e: any) => e.status === 'ACTIVE') || r.data[0];
      if (active) { setSelectedEvent(active.id); loadEventData(active.id); }
      else setLoading(false);
    });
  }, []);

  async function loadEventData(eventId: string) {
    setLoading(true);
    try {
      const [statsRes, allocRes, heatRes, expRes] = await Promise.all([
        api.get(`/walk-dashboard/${eventId}`),
        api.get(`/walk-dashboard/${eventId}/allocations`),
        api.get(`/walk-dashboard/${eventId}/heatmap`),
        api.get(`/walk-dashboard/${eventId}/expenses`),
      ]);
      setStats(statsRes.data);
      setAllocations(allocRes.data);
      setHeatmap(heatRes.data);
      setExpenses(expRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function handleEventChange(id: string) {
    setSelectedEvent(id);
    if (id) loadEventData(id);
  }

  async function handleCreateAllocation(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post(`/walk-dashboard/${selectedEvent}/allocations`, { ...allocForm, quantity: Number(allocForm.quantity) || undefined });
      setShowAllocModal(false);
      setAllocForm({ concept: '', amount: '', quantity: 0, notes: '' });
      loadEventData(selectedEvent);
    } catch (err: any) { alert(err?.response?.data?.message || 'Error'); }
  }

  async function handleCreateExpense(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post(`/walk-dashboard/${selectedEvent}/expenses`, { ...expenseForm, date: new Date(expenseForm.date).toISOString() });
      setShowExpenseModal(false);
      setExpenseForm({ concept: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
      loadEventData(selectedEvent);
    } catch (err: any) { alert(err?.response?.data?.message || 'Error'); }
  }

  const pieData = allocations.map(a => ({ name: a.concept, value: Number(a.amount) }));
  const heatmapData = heatmap.map((h: any) => ({
    name: h.pointOfSale?.name || 'Desconocido',
    ventas: h.totalSales,
    recaudado: Number(h.totalRevenue),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/walk" className="p-2 rounded-xl hover:bg-surface transition-colors">
            <ArrowLeft size={20} className="text-text-secondary" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Heart className="text-primary" size={24} /> Trazabilidad & Dashboard
            </h1>
            <p className="text-text-secondary text-sm mt-1">Dinero recaudado → Tratamientos financiados.</p>
          </div>
        </div>
        <select value={selectedEvent} onChange={e => handleEventChange(e.target.value)}
          className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold outline-none focus:border-primary">
          {events.map(e => <option key={e.id} value={e.id}>{e.name} ({e.year})</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-text-secondary">Cargando datos...</div>
      ) : !stats ? (
        <div className="text-center py-20 text-text-secondary">Selecciona un evento para ver las estadísticas.</div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Ingreso Bruto', value: `Bs ${Number(stats.revenue.totalRevenue).toLocaleString('es-VE')}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-100' },
              { label: 'Gastos Operativos', value: `Bs ${Number(stats.revenue.totalExpenses).toLocaleString('es-VE')}`, icon: Activity, color: 'text-red-500', bg: 'bg-red-100' },
              { label: 'Ayuda Neta', value: `Bs ${Number(stats.revenue.netIncome).toLocaleString('es-VE')}`, icon: Heart, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Tratamientos', value: stats.impact.totalTreatments, icon: Stethoscope, color: 'text-violet-600', bg: 'bg-violet-100' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="p-4 bg-surface border border-border rounded-2xl shadow-sm">
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} w-fit mb-2`}><stat.icon size={18} /></div>
                <h3 className="text-xl font-black text-foreground">{stat.value}</h3>
                <p className="text-[11px] font-semibold text-text-secondary">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Thermometer */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="bg-surface border border-border rounded-2xl shadow-sm p-6">
              <h2 className="text-sm font-bold text-foreground mb-2">Progreso hacia la Meta</h2>
              <ThermometerChart
                current={Number(stats.revenue.totalRevenue) + Number(stats.revenue.totalSponsorships)}
                goal={Number(stats.event.goalAmount)}
              />
            </motion.div>

            {/* Heatmap Bar Chart */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="bg-surface border border-border rounded-2xl shadow-sm p-6">
              <h2 className="text-sm font-bold text-foreground mb-4">Ventas por Punto Rosa</h2>
              {heatmapData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={heatmapData} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => `Bs ${Number(v).toLocaleString('es-VE')}`} />
                    <Bar dataKey="recaudado" fill="#e04bd6" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-text-secondary text-center py-16">Sin datos de ventas</p>
              )}
            </motion.div>

            {/* Allocation Pie */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="bg-surface border border-border rounded-2xl shadow-sm p-6">
              <h2 className="text-sm font-bold text-foreground mb-4">Distribución de Fondos</h2>
              {pieData.length > 0 ? (
                <div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                        dataKey="value" label={false}>
                        {pieData.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => `Bs ${Number(v).toLocaleString('es-VE')}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 space-y-1.5">
                    {pieData.map((item, idx) => {
                      const total = pieData.reduce((s, d) => s + d.value, 0);
                      const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
                      return (
                        <div key={idx} className="flex items-center justify-between text-xs px-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[idx % COLORS.length] }} />
                            <span className="font-semibold text-foreground truncate">{item.name}</span>
                          </div>
                          <span className="font-bold text-text-secondary ml-2 flex-shrink-0">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-text-secondary text-center py-16">Sin asignaciones de fondos</p>
              )}
            </motion.div>
          </div>

          {/* Allocations + Expenses tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fund Allocations */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="bg-surface border border-border rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Heart size={16} className="text-primary" /> Destino de Fondos
                </h2>
                <button onClick={() => setShowAllocModal(true)}
                  className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1">
                  <Plus size={12} /> Asignar
                </button>
              </div>
              {allocations.length === 0 ? (
                <p className="text-xs text-text-secondary text-center py-8">Sin asignaciones registradas.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allocations.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50">
                      <div>
                        <p className="text-sm font-bold text-foreground">{a.concept}</p>
                        <p className="text-[10px] text-text-secondary">
                          {a.quantity ? `${a.quantity} tratamientos` : ''} {a.patient ? `• ${a.patient.firstName} ${a.patient.lastName}` : ''}
                        </p>
                      </div>
                      <p className="text-sm font-black text-primary">Bs {Number(a.amount).toLocaleString('es-VE')}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Expenses */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              className="bg-surface border border-border rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Wallet size={16} className="text-red-500" /> Gastos Operativos
                </h2>
                <button onClick={() => setShowExpenseModal(true)}
                  className="px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1">
                  <Plus size={12} /> Gasto
                </button>
              </div>
              {expenses.length === 0 ? (
                <p className="text-xs text-text-secondary text-center py-8">Sin gastos registrados.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {expenses.map((exp: any) => (
                    <div key={exp.id} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50">
                      <div>
                        <p className="text-sm font-bold text-foreground">{exp.concept}</p>
                        <p className="text-[10px] text-text-secondary">{new Date(exp.date).toLocaleDateString('es-VE')}</p>
                      </div>
                      <p className="text-sm font-black text-red-500">- Bs {Number(exp.amount).toLocaleString('es-VE')}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Allocation Modal */}
          {showAllocModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-surface p-6 rounded-2xl shadow-xl w-full max-w-md border border-border">
                <h2 className="text-xl font-bold mb-4">Asignar Fondos a Tratamientos</h2>
                <form onSubmit={handleCreateAllocation} className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-text-secondary">Concepto</label>
                    <input required value={allocForm.concept} onChange={e => setAllocForm({ ...allocForm, concept: e.target.value })}
                      placeholder="Ej: Mamografías, Quimioterapias"
                      className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-bold text-text-secondary">Monto (Bs)</label>
                      <input required value={allocForm.amount} onChange={e => setAllocForm({ ...allocForm, amount: e.target.value })}
                        placeholder="10000.00"
                        className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-text-secondary">Cantidad</label>
                      <input type="number" value={allocForm.quantity} onChange={e => setAllocForm({ ...allocForm, quantity: +e.target.value })}
                        placeholder="500"
                        className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setShowAllocModal(false)}
                      className="flex-1 p-3 font-bold text-text-secondary bg-background rounded-xl hover:bg-border transition-colors">Cancelar</button>
                    <button type="submit"
                      className="flex-1 p-3 font-bold text-white bg-primary rounded-xl hover:bg-primary-hover transition-colors">Asignar</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* Expense Modal */}
          {showExpenseModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-surface p-6 rounded-2xl shadow-xl w-full max-w-md border border-border">
                <h2 className="text-xl font-bold mb-4">Registrar Gasto Operativo</h2>
                <form onSubmit={handleCreateExpense} className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-text-secondary">Concepto</label>
                    <input required value={expenseForm.concept} onChange={e => setExpenseForm({ ...expenseForm, concept: e.target.value })}
                      placeholder="Ej: Logística, Tarima, Hidratación"
                      className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-bold text-text-secondary">Monto (Bs)</label>
                      <input required value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                        placeholder="2500.00"
                        className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-text-secondary">Fecha</label>
                      <input required type="date" value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                        className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setShowExpenseModal(false)}
                      className="flex-1 p-3 font-bold text-text-secondary bg-background rounded-xl hover:bg-border transition-colors">Cancelar</button>
                    <button type="submit"
                      className="flex-1 p-3 font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">Registrar Gasto</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
