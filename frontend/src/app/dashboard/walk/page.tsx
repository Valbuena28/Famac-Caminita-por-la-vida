'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Footprints, Store, Package, ShoppingCart, Users, BarChart3,
  TrendingUp, ArrowRight, Plus, Target, Wallet, Heart
} from 'lucide-react';
import api from '@/lib/axios';
import ThermometerChart from '@/components/walk/ThermometerChart';

interface WalkEvent {
  id: string;
  name: string;
  year: number;
  goalAmount: string;
  status: string;
  _count: { sales: number; sponsors: number; items: number };
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PLANNING: { label: 'Planeación', color: 'text-amber-600', bg: 'bg-amber-100' },
  ACTIVE: { label: 'Activo', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  FINISHED: { label: 'Finalizado', color: 'text-slate-600', bg: 'bg-slate-100' },
};

const quickLinks = [
  { name: 'Puntos de Venta', href: '/dashboard/walk/pos', icon: Store, desc: 'Gestionar Puntos Rosas' },
  { name: 'Inventario', href: '/dashboard/walk/inventory', icon: Package, desc: 'Stock de productos' },
  { name: 'Ventas', href: '/dashboard/walk/sales', icon: ShoppingCart, desc: 'Registrar y ver ventas' },
  { name: 'Patrocinantes', href: '/dashboard/walk/sponsors', icon: Users, desc: 'Gestionar sponsors' },
  { name: 'Trazabilidad', href: '/dashboard/walk/traceability', icon: Heart, desc: 'Dinero → Tratamientos' },
];

export default function WalkDashboardPage() {
  const [events, setEvents] = useState<WalkEvent[]>([]);
  const [activeStats, setActiveStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', year: new Date().getFullYear(), goalAmount: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const { data } = await api.get('/walk-events');
      setEvents(data);
      // Fetch stats for the active or most recent event
      const active = data.find((e: WalkEvent) => e.status === 'ACTIVE') || data[0];
      if (active) {
        const { data: stats } = await api.get(`/walk-dashboard/${active.id}`);
        setActiveStats(stats);
      }
    } catch (err) {
      console.error('Error fetching walk events:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/walk-events', {
        name: form.name,
        year: form.year,
        goalAmount: form.goalAmount,
      });
      setShowCreateModal(false);
      setForm({ name: '', year: new Date().getFullYear(), goalAmount: '' });
      fetchEvents();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error al crear evento');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Footprints className="text-primary" size={28} />
            Caminata FAMAC
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Gestión integral de la caminata rosa: inventario, ventas, patrocinantes y trazabilidad.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-sm hover:bg-primary-hover transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Nuevo Evento
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-surface p-6 rounded-2xl shadow-xl w-full max-w-md border border-border">
            <h2 className="text-xl font-bold mb-4">Crear Evento de Caminata</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-text-secondary">Nombre del Evento</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Caminata Rosa 2026"
                  className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-text-secondary">Año</label>
                  <input required type="number" value={form.year} onChange={e => setForm({ ...form, year: +e.target.value })}
                    className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm font-bold text-text-secondary">Meta (Bs)</label>
                  <input required value={form.goalAmount} onChange={e => setForm({ ...form, goalAmount: e.target.value })}
                    placeholder="50000.00"
                    className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 p-3 font-bold text-text-secondary bg-background rounded-xl hover:bg-border transition-colors">Cancelar</button>
                <button type="submit"
                  className="flex-1 p-3 font-bold text-white bg-primary rounded-xl hover:bg-primary-hover transition-colors">Crear Evento</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Active Event Stats */}
      {activeStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { label: 'Recaudado', value: `Bs ${Number(activeStats.revenue.totalRevenue).toLocaleString('es-VE')}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            { label: 'Ventas', value: activeStats.revenue.totalSales, icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Patrocinantes', value: activeStats.impact.totalSponsors, icon: Users, color: 'text-violet-600', bg: 'bg-violet-100' },
            { label: 'Tratamientos', value: activeStats.impact.totalTreatments, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-100' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 bg-surface border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon size={20} /></div>
              </div>
              <h3 className="text-2xl font-black text-foreground">{stat.value}</h3>
              <p className="text-xs font-semibold text-text-secondary mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Main Grid: Thermometer + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thermometer */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          className="bg-surface border border-border rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">Termómetro de Recaudación</h2>
          </div>
          <p className="text-xs text-text-secondary font-medium mb-4">
            {activeStats?.event?.name || 'Sin evento activo'}
          </p>
          {activeStats ? (
            <ThermometerChart
              current={Number(activeStats.revenue.totalRevenue) + Number(activeStats.revenue.totalSponsorships)}
              goal={Number(activeStats.event.goalAmount)}
            />
          ) : (
            <div className="flex items-center justify-center py-16 text-text-secondary text-sm">
              Crea un evento para ver el progreso
            </div>
          )}
        </motion.div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-surface border border-border rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">Módulos de Gestión</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickLinks.map((link, i) => (
              <motion.div key={link.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}>
                <Link href={link.href}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary hover:shadow-md hover:shadow-primary/10 transition-all group bg-background">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <link.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-foreground">{link.name}</p>
                    <p className="text-xs font-medium text-text-secondary mt-0.5">{link.desc}</p>
                  </div>
                  <ArrowRight size={16} className="text-text-secondary group-hover:text-primary transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Events Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-surface border border-border rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">Historial de Eventos</h2>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12 text-text-secondary text-sm">Cargando...</div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center border-2 border-dashed border-border rounded-xl">
            <Footprints className="text-text-secondary mb-3 opacity-20" size={40} />
            <p className="text-sm font-medium text-text-secondary">No hay eventos de caminata registrados.</p>
            <button onClick={() => setShowCreateModal(true)}
              className="mt-3 px-4 py-2 text-sm font-bold text-primary hover:underline">+ Crear el primero</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-secondary">
                  <th className="text-left py-3 px-4 font-bold">Evento</th>
                  <th className="text-left py-3 px-4 font-bold">Año</th>
                  <th className="text-left py-3 px-4 font-bold">Meta</th>
                  <th className="text-left py-3 px-4 font-bold">Estado</th>
                  <th className="text-center py-3 px-4 font-bold">Ventas</th>
                  <th className="text-center py-3 px-4 font-bold">Sponsors</th>
                  <th className="text-center py-3 px-4 font-bold">Productos</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => {
                  const status = statusConfig[evt.status] || statusConfig.PLANNING;
                  return (
                    <tr key={evt.id} className="border-b border-border/50 hover:bg-background transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground">{evt.name}</td>
                      <td className="py-3 px-4 text-text-secondary font-medium">{evt.year}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">Bs {Number(evt.goalAmount).toLocaleString('es-VE')}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${status.color} ${status.bg}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">{evt._count.sales}</td>
                      <td className="py-3 px-4 text-center font-bold">{evt._count.sponsors}</td>
                      <td className="py-3 px-4 text-center font-bold">{evt._count.items}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
