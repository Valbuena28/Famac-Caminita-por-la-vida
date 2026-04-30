'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Store, Plus, MapPin, Phone, User, ArrowLeft, Trash2 } from 'lucide-react';
import api from '@/lib/axios';

interface POS {
  id: string;
  name: string;
  location: string;
  contactName?: string;
  contactPhone?: string;
  isActive: boolean;
  _count: { sales: number; stock: number };
}

export default function POSPage() {
  const [posList, setPosList] = useState<POS[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', contactName: '', contactPhone: '' });

  useEffect(() => { fetchPOS(); }, []);

  async function fetchPOS() {
    try {
      const { data } = await api.get('/point-of-sale');
      setPosList(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/point-of-sale', form);
      setShowModal(false);
      setForm({ name: '', location: '', contactName: '', contactPhone: '' });
      fetchPOS();
    } catch (err: any) { alert(err?.response?.data?.message || 'Error'); }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este punto de venta?')) return;
    try { await api.delete(`/point-of-sale/${id}`); fetchPOS(); }
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
              <Store className="text-primary" size={24} /> Puntos de Venta
            </h1>
            <p className="text-text-secondary text-sm mt-1">Gestiona los &quot;Puntos Rosas&quot; de distribución.</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-sm hover:bg-primary-hover transition-all flex items-center gap-2">
          <Plus size={16} /> Nuevo Punto
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-surface p-6 rounded-2xl shadow-xl w-full max-w-md border border-border">
            <h2 className="text-xl font-bold mb-4">Nuevo Punto de Venta</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-text-secondary">Nombre</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: C.C. Sambil Maracaibo"
                  className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-sm font-bold text-text-secondary">Ubicación</label>
                <input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="Av. La Limpia, Maracaibo"
                  className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-text-secondary">Responsable</label>
                  <input value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })}
                    placeholder="María López"
                    className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm font-bold text-text-secondary">Teléfono</label>
                  <input value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                    placeholder="0414-1234567"
                    className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                </div>
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
      ) : posList.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center border-2 border-dashed border-border rounded-2xl">
          <Store className="text-text-secondary mb-3 opacity-20" size={48} />
          <p className="text-sm font-medium text-text-secondary">No hay puntos de venta registrados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posList.map((pos, i) => (
            <motion.div key={pos.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-surface border border-border rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><Store size={20} /></div>
                <button onClick={() => handleDelete(pos.id)}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="text-base font-bold text-foreground">{pos.name}</h3>
              <div className="mt-2 space-y-1.5 text-xs text-text-secondary font-medium">
                <p className="flex items-center gap-1.5"><MapPin size={12} /> {pos.location}</p>
                {pos.contactName && <p className="flex items-center gap-1.5"><User size={12} /> {pos.contactName}</p>}
                {pos.contactPhone && <p className="flex items-center gap-1.5"><Phone size={12} /> {pos.contactPhone}</p>}
              </div>
              <div className="flex gap-4 mt-4 pt-3 border-t border-border">
                <span className="text-xs font-bold text-foreground">{pos._count.stock} productos</span>
                <span className="text-xs font-bold text-primary">{pos._count.sales} ventas</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
