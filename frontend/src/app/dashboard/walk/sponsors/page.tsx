'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, Plus, ArrowLeft, Trash2, Building2 } from 'lucide-react';
import api from '@/lib/axios';
import SponsorBadge from '@/components/walk/SponsorBadge';

interface Sponsor {
  id: string; companyName: string; contactName?: string; email?: string; phone?: string;
  tier: string; amountBs?: string; logoUrl?: string; benefits?: string;
  walkEvent: { name: string; year: number };
}

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    companyName: '', contactName: '', email: '', phone: '',
    tier: 'GOLD', amountBs: '', benefits: '', walkEventId: '',
  });

  useEffect(() => {
    Promise.all([
      api.get('/sponsors').then(r => setSponsors(r.data)),
      api.get('/walk-events').then(r => setEvents(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/sponsors', form);
      setShowModal(false);
      const { data } = await api.get('/sponsors');
      setSponsors(data);
    } catch (err: any) { alert(err?.response?.data?.message || 'Error'); }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este patrocinante?')) return;
    try { await api.delete(`/sponsors/${id}`); setSponsors(sponsors.filter(s => s.id !== id)); }
    catch (err: any) { alert(err?.response?.data?.message || 'Error'); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/walk" className="p-2 rounded-xl hover:bg-surface transition-colors">
            <ArrowLeft size={20} className="text-text-secondary" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="text-primary" size={24} /> Patrocinantes
            </h1>
            <p className="text-text-secondary text-sm mt-1">Empresas que apoyan la caminata.</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-sm hover:bg-primary-hover transition-all flex items-center gap-2">
          <Plus size={16} /> Nuevo Sponsor
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-surface p-6 rounded-2xl shadow-xl w-full max-w-md border border-border my-8">
            <h2 className="text-xl font-bold mb-4">Nuevo Patrocinante</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-text-secondary">Evento</label>
                <select required value={form.walkEventId} onChange={e => setForm({ ...form, walkEventId: e.target.value })}
                  className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary">
                  <option value="">Seleccionar...</option>
                  {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-text-secondary">Empresa</label>
                <input required value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })}
                  placeholder="Empresas Polar"
                  className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-text-secondary">Contacto</label>
                  <input value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })}
                    className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm font-bold text-text-secondary">Nivel</label>
                  <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })}
                    className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary">
                    <option value="DIAMOND">💎 Diamante</option>
                    <option value="PLATINUM">🏆 Platino</option>
                    <option value="GOLD">🥇 Oro</option>
                    <option value="SILVER">🥈 Plata</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-text-secondary">Monto del Patrocinio (Bs)</label>
                <input value={form.amountBs} onChange={e => setForm({ ...form, amountBs: e.target.value })} placeholder="5000.00"
                  className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-sm font-bold text-text-secondary">Beneficios</label>
                <textarea value={form.benefits} onChange={e => setForm({ ...form, benefits: e.target.value })}
                  placeholder="Logo en camisas, mención en redes..."
                  className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 p-3 font-bold text-text-secondary bg-background rounded-xl hover:bg-border transition-colors">Cancelar</button>
                <button type="submit"
                  className="flex-1 p-3 font-bold text-white bg-primary rounded-xl hover:bg-primary-hover transition-colors">Crear</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-text-secondary">Cargando...</div>
      ) : sponsors.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center border-2 border-dashed border-border rounded-2xl">
          <Building2 className="text-text-secondary mb-3 opacity-20" size={48} />
          <p className="text-sm font-medium text-text-secondary">No hay patrocinantes registrados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sponsors.map((sponsor, i) => (
            <motion.div key={sponsor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-surface border border-border rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center">
                    <Building2 size={24} className="text-text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{sponsor.companyName}</h3>
                    <SponsorBadge tier={sponsor.tier} />
                  </div>
                </div>
                <button onClick={() => handleDelete(sponsor.id)}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
              {sponsor.amountBs && (
                <p className="text-lg font-black text-foreground mb-2">Bs {Number(sponsor.amountBs).toLocaleString('es-VE')}</p>
              )}
              {sponsor.contactName && <p className="text-xs text-text-secondary">Contacto: {sponsor.contactName}</p>}
              {sponsor.benefits && <p className="text-xs text-text-secondary mt-1 italic">{sponsor.benefits}</p>}
              <p className="text-[10px] text-text-secondary mt-2 pt-2 border-t border-border">{sponsor.walkEvent.name} ({sponsor.walkEvent.year})</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
