'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Store, Package, ShoppingCart, Users, Heart,
  ArrowLeft, ChevronLeft, ChevronRight, Footprints, Ribbon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const walkNavItems = [
  { name: 'Dashboard', href: '/dashboard/walk', icon: LayoutDashboard },
  { name: 'Puntos de Venta', href: '/dashboard/walk/pos', icon: Store },
  { name: 'Inventario', href: '/dashboard/walk/inventory', icon: Package },
  { name: 'Ventas', href: '/dashboard/walk/sales', icon: ShoppingCart },
  { name: 'Patrocinantes', href: '/dashboard/walk/sponsors', icon: Users },
  { name: 'Trazabilidad', href: '/dashboard/walk/traceability', icon: Heart },
];

export default function WalkLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Walk Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="fixed top-0 left-0 h-screen bg-gradient-to-b from-[#1a0a14] via-[#2d1025] to-[#1a0a14] border-r border-pink-900/30 flex flex-col z-40 overflow-hidden"
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-pink-900/30">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <Ribbon size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-black text-white tracking-wide">CAMINATA</h1>
                  <p className="text-[10px] font-semibold text-pink-400 tracking-widest">FAMAC 2026</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex justify-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <Ribbon size={22} className="text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {walkNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/10 text-pink-400 shadow-sm'
                    : 'text-pink-200/60 hover:text-pink-300 hover:bg-white/5'
                }`}>
                {isActive && (
                  <motion.div layoutId="walk-active-tab"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-pink-500"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-bold whitespace-nowrap overflow-hidden">
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-pink-900/30 space-y-1">
          <Link href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-pink-200/50 hover:text-pink-300 hover:bg-white/5 transition-all">
            <ArrowLeft size={18} className="flex-shrink-0" />
            {!collapsed && <span className="text-xs font-bold whitespace-nowrap">Volver a SGP-FAMAC</span>}
          </Link>
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-pink-200/40 hover:text-pink-300 hover:bg-white/5 transition-all">
            {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span className="text-xs font-bold">Colapsar</span></>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        animate={{ marginLeft: collapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="flex-1 min-h-screen"
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Footprints size={20} className="text-pink-500" />
            <div>
              <h2 className="text-sm font-black text-foreground">Caminata Rosa FAMAC</h2>
              <p className="text-[10px] font-medium text-text-secondary">Sistema de Gestión de Eventos y Recaudación</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500/10 text-pink-500 border border-pink-500/20">
              Evento Activo
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
