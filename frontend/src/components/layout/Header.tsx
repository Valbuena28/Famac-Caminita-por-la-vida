'use client';
import React from 'react';
import { Bell, Menu, UserCircle } from 'lucide-react';

export default function Header() {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const data = JSON.parse(localStorage.getItem('user') || '{}');
    if (data.email) {
      setUser(data);
    }
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-surface border-b border-border sticky top-0 z-10 shadow-sm/50">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button className="md:hidden p-2 text-text-secondary hover:bg-background rounded-lg">
          <Menu size={20} />
        </button>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-text-secondary hover:bg-background rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border-2 border-surface" />
        </button>
        
        <div className="h-8 w-px bg-border mx-1" />

        <button className="flex items-center gap-3 p-1 pr-3 hover:bg-background rounded-full transition-colors border border-transparent hover:border-border">
          <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-primary border border-primary/20">
            <UserCircle size={24} strokeWidth={2.5} />
          </div>
          <div className="hidden md:flex flex-col items-start leading-none">
            <span className="text-sm font-bold text-foreground">
              {user ? (user.firstName ? `${user.firstName} ${user.lastName}` : 'Usuario FAMAC') : 'Cargando...'}
            </span>
            <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">
              {user ? (user.role === 'ADMIN' ? 'Administrador' : user.role === 'RECEPTIONIST' ? 'Recepcionista' : 'Doctor') : 'Administrador'}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}
