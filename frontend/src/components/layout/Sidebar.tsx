'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, FileText, Settings, LogOut, PieChart, Footprints } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Pacientes', href: '/dashboard/patients', icon: Users },
  { name: 'Citas Médicas', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Finanzas (Contabilidad)', href: '/dashboard/finance', icon: PieChart },
  { name: 'Caminata FAMAC', href: '/dashboard/walk', icon: Footprints },
  { name: 'Ajustes', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || '');
  }, []);

  const filteredNavItems = navItems.filter(item => {
    if (userRole === 'RECEPTIONIST') {
      return item.name === 'Dashboard' || item.name === 'Pacientes' || item.name === 'Citas Médicas';
    }
    return true;
  });

  return (
    <aside className="hidden w-64 md:flex flex-col h-screen overflow-y-auto border-r border-border bg-surface shadow-soft z-20">
      <div className="h-16 flex items-center px-6 border-b border-border bg-background">
        <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 relative flex items-center justify-center">
            <img src="/logo.png" alt="Logotipo FAMAC" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          FAMAC
        </h2>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1.5 bg-background">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              isActive 
                ? "bg-surface text-primary font-bold shadow-sm border border-primary/10" 
                : "text-text-secondary hover:bg-surface hover:text-foreground"
            )}>
              <item.icon size={18} className={cn("transition-colors", isActive ? "text-primary" : "text-text-secondary")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border bg-background">
        <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-bold text-text-secondary hover:bg-surface hover:text-primary transition-all">
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
