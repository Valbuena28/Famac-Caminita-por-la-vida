'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingCart, Plus, ArrowLeft, User, CreditCard } from 'lucide-react';
import api from '@/lib/axios';

interface Sale {
  id: string; customerName: string; customerCi?: string; total: string; createdAt: string;
  pointOfSale: { name: string };
  items: { quantity: number; subtotal: string; inventoryItem: { name: string; type: string } }[];
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [posList, setPosList] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    customerName: '', customerCi: '', customerEmail: '', customerPhone: '',
    walkEventId: '', pointOfSaleId: '',
    items: [{ inventoryItemId: '', quantity: 1 }],
  });

  useEffect(() => {
    Promise.all([
      api.get('/sales').then(r => setSales(r.data)),
      api.get('/walk-events').then(r => setEvents(r.data)),
      api.get('/point-of-sale').then(r => setPosList(r.data)),
      api.get('/inventory').then(r => setInventoryItems(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  function addItem() {
    setForm({ ...form, items: [...form.items, { inventoryItemId: '', quantity: 1 }] });
  }
  function removeItem(idx: number) {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  }
  function updateItem(idx: number, field: string, value: any) {
    const newItems = [...form.items];
    (newItems[idx] as any)[field] = value;
    setForm({ ...form, items: newItems });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/sales', {
        ...form,
        items: form.items.map(i => ({ ...i, quantity: Number(i.quantity) })),
      });
      setShowModal(false);
      const { data } = await api.get('/sales');
      setSales(data);
    } catch (err: any) { alert(err?.response?.data?.message || 'Error al registrar venta'); }
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
              <ShoppingCart className="text-primary" size={24} /> Ventas
            </h1>
            <p className="text-text-secondary text-sm mt-1">Registro de ventas en Puntos Rosas.</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-sm hover:bg-primary-hover transition-all flex items-center gap-2">
          <Plus size={16} /> Registrar Venta
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-surface p-6 rounded-2xl shadow-xl w-full max-w-lg border border-border my-8">
            <h2 className="text-xl font-bold mb-4">Registrar Venta</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-text-secondary">Evento</label>
                  <select required value={form.walkEventId} onChange={e => setForm({ ...form, walkEventId: e.target.value })}
                    className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary">
                    <option value="">Seleccionar...</option>
                    {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-text-secondary">Punto de Venta</label>
                  <select required value={form.pointOfSaleId} onChange={e => setForm({ ...form, pointOfSaleId: e.target.value })}
                    className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary">
                    <option value="">Seleccionar...</option>
                    {posList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-text-secondary">Comprador</label>
                  <input required value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })}
                    placeholder="Nombre completo"
                    className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm font-bold text-text-secondary">Cédula</label>
                  <input value={form.customerCi} onChange={e => setForm({ ...form, customerCi: e.target.value })}
                    placeholder="V-12345678"
                    className="w-full mt-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-text-secondary mb-2 block">Productos</label>
                {form.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-end">
                    <select required value={item.inventoryItemId} onChange={e => updateItem(idx, 'inventoryItemId', e.target.value)}
                      className="flex-1 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary text-sm">
                      <option value="">Producto...</option>
                      {inventoryItems.map((inv: any) => <option key={inv.id} value={inv.id}>{inv.name} — Bs {Number(inv.unitPrice).toFixed(2)}</option>)}
                    </select>
                    <input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, 'quantity', +e.target.value)}
                      className="w-20 p-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary text-sm text-center" />
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold">✕</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addItem}
                  className="text-xs font-bold text-primary hover:underline mt-1">+ Agregar producto</button>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 p-3 font-bold text-text-secondary bg-background rounded-xl hover:bg-border transition-colors">Cancelar</button>
                <button type="submit"
                  className="flex-1 p-3 font-bold text-white bg-primary rounded-xl hover:bg-primary-hover transition-colors">Registrar</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-text-secondary">Cargando...</div>
      ) : sales.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center border-2 border-dashed border-border rounded-2xl">
          <ShoppingCart className="text-text-secondary mb-3 opacity-20" size={48} />
          <p className="text-sm font-medium text-text-secondary">No hay ventas registradas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sales.map((sale, i) => (
            <motion.div key={sale.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-surface border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary"><User size={16} /></div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{sale.customerName}</h3>
                    <p className="text-xs text-text-secondary">{sale.pointOfSale.name} • {sale.customerCi || 'Sin cédula'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-foreground flex items-center gap-1">
                    <CreditCard size={14} className="text-primary" /> Bs {Number(sale.total).toLocaleString('es-VE')}
                  </p>
                  <p className="text-[10px] text-text-secondary font-medium">
                    {new Date(sale.createdAt).toLocaleDateString('es-VE')} — {new Date(sale.createdAt).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {sale.items.map((si, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-background border border-border text-xs font-semibold text-foreground">
                    {si.quantity}x {si.inventoryItem.name} — Bs {Number(si.subtotal).toFixed(2)}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
