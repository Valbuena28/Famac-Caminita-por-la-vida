'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Ribbon, Heart, Wallet, ShoppingCart, Users, Store, Package,
  Stethoscope, Activity, TrendingUp, Award, Building2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
const COLORS = ['#e04bd6', '#c43abc', '#b35791', '#7d1e60', '#f472b6'];

const tierConfig: Record<string, { label: string; icon: string; color: string }> = {
  DIAMOND: { label: 'Diamante', icon: '💎', color: 'text-[#e04bd6]' },
  PLATINUM: { label: 'Platino', icon: '🏆', color: 'text-[#7d1e60]' },
  GOLD: { label: 'Oro', icon: '🥇', color: 'text-amber-500' },
  SILVER: { label: 'Plata', icon: '🥈', color: 'text-[#b35791]' },
};

export default function WalkPreviewPage() {
  const [event, setEvent] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: ev } = await axios.get(`${API}/walk-public/active-event`);
      if (!ev) { setLoading(false); return; }
      setEvent(ev);
      const [statsR, heatR, allocR, expR, salesR, sponsR, invR] = await Promise.all([
        axios.get(`${API}/walk-public/${ev.id}/stats`),
        axios.get(`${API}/walk-public/${ev.id}/heatmap`),
        axios.get(`${API}/walk-public/${ev.id}/allocations`),
        axios.get(`${API}/walk-public/${ev.id}/expenses`),
        axios.get(`${API}/walk-public/${ev.id}/sales`),
        axios.get(`${API}/walk-public/${ev.id}/sponsors`),
        axios.get(`${API}/walk-public/${ev.id}/inventory`),
      ]);
      setStats(statsR.data);
      setHeatmap(heatR.data);
      setAllocations(allocR.data);
      setExpenses(expR.data);
      setSales(salesR.data);
      setSponsors(sponsR.data);
      setInventory(invR.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'sales', label: 'Ventas', icon: ShoppingCart },
    { id: 'sponsors', label: 'Patrocinantes', icon: Award },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'traceability', label: 'Trazabilidad', icon: Heart },
  ];

  const progress = stats ? ((Number(stats.revenue.totalRevenue) + Number(stats.revenue.totalSponsorships)) / Number(stats.event.goalAmount) * 100) : 0;
  const heatmapData = heatmap.map((h: any) => ({ name: h.pointOfSale?.name || '?', recaudado: Number(h.totalRevenue) }));
  const pieData = allocations.map((a: any) => ({ name: a.concept, value: Number(a.amount) }));

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-10 h-10 border-3 border-[#e04bd6] border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-[#7d1e60]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Hero Header */}
      <header className="relative overflow-hidden border-b border-[#ffdaf2]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#fff2f9] via-white to-[#fff2f9]" />
        <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-[#e04bd6]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-50%] right-[-10%] w-80 h-80 bg-[#c43abc]/5 rounded-full blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e04bd6] to-[#c43abc] flex items-center justify-center shadow-xl shadow-[#e04bd6]/20">
              <Ribbon size={30} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[#7d1e60]">{event?.name || 'Caminata Rosa FAMAC'}</h1>
              <p className="text-[#b35791] text-sm font-medium">Sistema de Gestión y Recaudación — Vista Pública</p>
            </div>
          </div>

          {/* Progress Bar */}
          {stats && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-[#e04bd6]">Bs {(Number(stats.revenue.totalRevenue) + Number(stats.revenue.totalSponsorships)).toLocaleString('es-VE')}</span>
                <span className="text-[#b35791] font-bold">Meta: Bs {Number(stats.event.goalAmount).toLocaleString('es-VE')}</span>
              </div>
              <div className="h-3 bg-[#ffdaf2] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[#e04bd6] to-[#c43abc] rounded-full shadow-lg shadow-[#e04bd6]/30" />
              </div>
              <p className="text-right text-xs font-black text-[#e04bd6] mt-1">{progress.toFixed(1)}% alcanzado</p>
            </div>
          )}
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#ffdaf2]">
        <div className="max-w-6xl mx-auto px-6 flex gap-1 overflow-x-auto py-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#e04bd6]/10 text-[#e04bd6] shadow-sm'
                  : 'text-[#b35791] hover:text-[#7d1e60] hover:bg-[#fff2f9]'
              }`}>
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Ingreso Total', value: `Bs ${(Number(stats.revenue.totalRevenue) + Number(stats.revenue.totalSponsorships)).toLocaleString('es-VE')}`, icon: Wallet, gradient: 'from-emerald-400 to-emerald-600' },
                { label: 'Ventas Realizadas', value: stats.revenue.totalSales, icon: ShoppingCart, gradient: 'from-[#e04bd6] to-[#c43abc]' },
                { label: 'Patrocinantes', value: stats.impact.totalSponsors, icon: Users, gradient: 'from-violet-400 to-violet-600' },
                { label: 'Tratamientos', value: stats.impact.totalTreatments, icon: Stethoscope, gradient: 'from-[#7d1e60] to-[#b35791]' },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-5 rounded-2xl bg-[#fff2f9] border border-[#ffdaf2] shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                    <stat.icon size={18} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-[#7d1e60]">{stat.value}</h3>
                  <p className="text-xs font-semibold text-[#b35791] mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-[#fff2f9] border border-[#ffdaf2]">
                <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-[#7d1e60]"><Store size={16} className="text-[#e04bd6]" /> Ventas por Punto Rosa</h2>
                {heatmapData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={heatmapData} layout="vertical" margin={{ left: 10 }}>
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#b35791' }} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: '#b35791' }} />
                      <Tooltip formatter={(v: any) => `Bs ${Number(v).toLocaleString('es-VE')}`}
                        contentStyle={{ background: '#fff2f9', border: '1px solid #ffdaf2', borderRadius: '12px', color: '#7d1e60' }} />
                      <Bar dataKey="recaudado" fill="#e04bd6" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-[#b35791] text-center py-16 text-sm">Sin datos</p>}
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl bg-[#fff2f9] border border-[#ffdaf2]">
                <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-[#7d1e60]"><Heart size={16} className="text-[#e04bd6]" /> Destino de Fondos</h2>
                {pieData.length > 0 ? (
                  <div>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                          dataKey="value" label={false}>
                          {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => `Bs ${Number(v).toLocaleString('es-VE')}`}
                          contentStyle={{ background: '#fff2f9', border: '1px solid #ffdaf2', borderRadius: '12px', color: '#7d1e60' }} />
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
                              <span className="font-semibold text-[#7d1e60] truncate">{item.name}</span>
                            </div>
                            <span className="font-bold text-[#b35791] ml-2 flex-shrink-0">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : <p className="text-[#b35791] text-center py-16 text-sm">Sin datos</p>}
              </motion.div>
            </div>

            {/* Financials summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="text-xs font-bold text-emerald-600 mb-1">Ventas</p>
                <p className="text-xl font-black text-emerald-700">Bs {Number(stats.revenue.totalRevenue).toLocaleString('es-VE')}</p>
              </div>
              <div className="p-5 rounded-2xl bg-violet-50 border border-violet-200">
                <p className="text-xs font-bold text-violet-600 mb-1">Patrocinios</p>
                <p className="text-xl font-black text-violet-700">Bs {Number(stats.revenue.totalSponsorships).toLocaleString('es-VE')}</p>
              </div>
              <div className="p-5 rounded-2xl bg-red-50 border border-red-200">
                <p className="text-xs font-bold text-red-500 mb-1">Gastos Operativos</p>
                <p className="text-xl font-black text-red-600">Bs {Number(stats.revenue.totalExpenses).toLocaleString('es-VE')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold mb-4 text-[#7d1e60]">Últimas Ventas</h2>
            {sales.map((sale: any, i: number) => (
              <motion.div key={sale.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-4 rounded-2xl bg-[#fff2f9] border border-[#ffdaf2] flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="font-bold text-sm text-[#7d1e60]">{sale.customerName}</p>
                  <p className="text-xs text-[#b35791]">{sale.pointOfSale?.name} • {sale.customerCi || 'Sin CI'}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {sale.items?.map((si: any, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-[#e04bd6]/10 border border-[#e04bd6]/20 text-[10px] font-bold text-[#e04bd6]">
                        {si.quantity}x {si.inventoryItem?.name}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-lg font-black text-[#e04bd6]">Bs {Number(sale.total).toLocaleString('es-VE')}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Sponsors Tab */}
        {activeTab === 'sponsors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h2 className="text-lg font-bold mb-2 col-span-full text-[#7d1e60]">Empresas Patrocinadoras</h2>
            {sponsors.map((sp: any, i: number) => {
              const tier = tierConfig[sp.tier] || tierConfig.SILVER;
              return (
                <motion.div key={sp.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="p-5 rounded-2xl bg-[#fff2f9] border border-[#ffdaf2] hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[#e04bd6]/10 border border-[#ffdaf2] flex items-center justify-center">
                      <Building2 size={24} className="text-[#e04bd6]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#7d1e60]">{sp.companyName}</h3>
                      <span className={`text-xs font-black ${tier.color}`}>{tier.icon} {tier.label}</span>
                    </div>
                  </div>
                  {sp.amountBs && <p className="text-xl font-black text-[#e04bd6] mb-2">Bs {Number(sp.amountBs).toLocaleString('es-VE')}</p>}
                  {sp.benefits && <p className="text-xs text-[#b35791] italic">{sp.benefits}</p>}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold mb-4 text-[#7d1e60]">Inventario de Productos</h2>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#ffdaf2]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#ffdaf2] bg-[#fff2f9] text-[#b35791]">
                    <th className="text-left py-3 px-4 font-bold">Producto</th>
                    <th className="text-center py-3 px-4 font-bold">Total</th>
                    <th className="text-center py-3 px-4 font-bold">Asignado</th>
                    <th className="text-center py-3 px-4 font-bold">Vendido</th>
                    <th className="text-right py-3 px-4 font-bold">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item: any) => {
                    const assigned = item.stock?.reduce((a: number, s: any) => a + s.assignedQty, 0) || 0;
                    const sold = item.stock?.reduce((a: number, s: any) => a + s.soldQty, 0) || 0;
                    return (
                      <tr key={item.id} className="border-b border-[#ffdaf2]/50 hover:bg-[#fff2f9] transition-colors">
                        <td className="py-3 px-4 font-bold text-[#7d1e60]">{item.name}</td>
                        <td className="py-3 px-4 text-center text-[#b35791]">{item.totalQty}</td>
                        <td className="py-3 px-4 text-center text-[#b35791]">{assigned}</td>
                        <td className="py-3 px-4 text-center font-bold text-[#e04bd6]">{sold}</td>
                        <td className="py-3 px-4 text-right font-bold text-[#7d1e60]">Bs {Number(item.unitPrice).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {inventory.map((item: any) => {
                const assigned = item.stock?.reduce((a: number, s: any) => a + s.assignedQty, 0) || 0;
                const sold = item.stock?.reduce((a: number, s: any) => a + s.soldQty, 0) || 0;
                return (
                  <div key={item.id} className="p-4 rounded-2xl bg-[#fff2f9] border border-[#ffdaf2]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-[#7d1e60]">{item.name}</h3>
                      <span className="text-sm font-black text-[#e04bd6]">Bs {Number(item.unitPrice).toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-white border border-[#ffdaf2]">
                        <p className="text-lg font-black text-[#7d1e60]">{item.totalQty}</p>
                        <p className="text-[10px] font-bold text-[#b35791]">Total</p>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#ffdaf2]">
                        <p className="text-lg font-black text-[#b35791]">{assigned}</p>
                        <p className="text-[10px] font-bold text-[#b35791]">Asignado</p>
                      </div>
                      <div className="p-2 rounded-xl bg-[#e04bd6]/10 border border-[#e04bd6]/20">
                        <p className="text-lg font-black text-[#e04bd6]">{sold}</p>
                        <p className="text-[10px] font-bold text-[#e04bd6]">Vendido</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Traceability Tab */}
        {activeTab === 'traceability' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#7d1e60]"><Heart size={18} className="text-[#e04bd6]" /> Destino de los Fondos</h2>
              <div className="space-y-3">
                {allocations.map((a: any, i: number) => (
                  <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-2xl bg-[#fff2f9] border border-[#ffdaf2] flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                      <p className="font-bold text-sm text-[#7d1e60]">{a.concept}</p>
                      <p className="text-xs text-[#b35791] mt-1">{a.quantity ? `${a.quantity} tratamientos` : ''} {a.notes || ''}</p>
                    </div>
                    <p className="text-lg font-black text-[#e04bd6]">Bs {Number(a.amount).toLocaleString('es-VE')}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#7d1e60]"><Activity size={18} className="text-red-500" /> Gastos Operativos</h2>
              <div className="space-y-3">
                {expenses.map((e: any, i: number) => (
                  <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                      <p className="font-bold text-sm text-red-700">{e.concept}</p>
                      <p className="text-xs text-red-400">{new Date(e.date).toLocaleDateString('es-VE')}</p>
                    </div>
                    <p className="text-lg font-black text-red-500">- Bs {Number(e.amount).toLocaleString('es-VE')}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#ffdaf2] mt-12 bg-[#fff2f9]">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center">
          <p className="text-xs text-[#b35791] font-medium">
            FAMAC — Fundación de Apoyo al Paciente con Cáncer de Mama • SGP-FAMAC v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
