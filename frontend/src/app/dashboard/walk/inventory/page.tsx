'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Package, Plus, ArrowLeft, Shirt, Hash, HardHat, Box, Trash2 } from 'lucide-react';
import api from '@/lib/axios';

const typeIcons: Record<string, any> = { SHIRT: Shirt, CAP: HardHat, NUMBER: Hash, OTHER: Box };
const typeLabels: Record<string, string> = { SHIRT: 'Camisa', CAP: 'Gorra', NUMBER: 'Número', OTHER: 'Otro' };

interface Item {
  id: string; name: string; type: string; size?: string;
  unitPrice: string; totalQty: number;
  walkEvent: { name: string; year: number };
  _count: { stock: number; saleItems: number };
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'SHIRT', size: '', unitPrice: '', totalQty: 0, walkEventId: '' });

  useEffect(() => {
    Promise.all([
      api.get('/inventory').then(r => setItems(r.data)),
      api.get('/walk-events').then(r => setEvents(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/inventory', { ...form, totalQty: Number(form.totalQty) });
      setShowModal(false);
      const { data } = await api.get('/inventory');
      setItems(data);
    } catch (err: any) { alert(err?.response?.data?.message || 'Error'); }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este producto?')) return;
    try { await api.delete(`/inventory/${id}`); setItems(items.filter(i => i.id !== id)); }
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
              <Package className="text-primary" size={24} /> Inventario
            </h1>
            <p className="text-text-secondary text-sm mt-1">Productos disponibles para la caminata.</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-sm hover:bg-primary-hover transition-all flex items-center gap-2">
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-surface p-6 rounded-2xl shadow-xl w-full max-w-md border border-border">
            <h2 className="text-xl font-bold mb-4">Nuevo Producto</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-text-secondary">Evento de Caminata</label>
                <select required value={form.walkEventId} onChange={e => setForm({ ...form, walkEventId: e.target.value })}
                  className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary">
                  <option value="">Seleccionar...</option>
                  {events.map(e => <option key={e.id} value={e.id}>{e.name} ({e.year})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-text-secondary">Nombre</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Camisa Rosa Talla M"
                  className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-bold text-text-secondary">Tipo</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary">
                    <option value="SHIRT">Camisa</option>
                    <option value="CAP">Gorra</option>
                    <option value="NUMBER">Número</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-text-secondary">Talla</label>
                  <input value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} placeholder="M"
                    className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm font-bold text-text-secondary">Cantidad</label>
                  <input required type="number" value={form.totalQty} onChange={e => setForm({ ...form, totalQty: +e.target.value })}
                    className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-text-secondary">Precio Unitario (Bs)</label>
                <input required value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} placeholder="15.00"
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
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center border-2 border-dashed border-border rounded-2xl">
          <Package className="text-text-secondary mb-3 opacity-20" size={48} />
          <p className="text-sm font-medium text-text-secondary">No hay productos registrados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-surface border border-border rounded-2xl shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="text-left py-3 px-4 font-bold">Producto</th>
                <th className="text-left py-3 px-4 font-bold">Tipo</th>
                <th className="text-left py-3 px-4 font-bold">Talla</th>
                <th className="text-right py-3 px-4 font-bold">Precio</th>
                <th className="text-right py-3 px-4 font-bold">Cantidad</th>
                <th className="text-left py-3 px-4 font-bold">Evento</th>
                <th className="text-center py-3 px-4 font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const Icon = typeIcons[item.type] || Box;
                return (
                  <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/50 hover:bg-background transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground flex items-center gap-2">
                      <Icon size={16} className="text-primary" /> {item.name}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">{typeLabels[item.type]}</td>
                    <td className="py-3 px-4 text-text-secondary">{item.size || '—'}</td>
                    <td className="py-3 px-4 text-right font-semibold">Bs {Number(item.unitPrice).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold">{item.totalQty}</td>
                    <td className="py-3 px-4 text-text-secondary text-xs">{item.walkEvent.name}</td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
