'use client';
import { useState } from 'react';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password
      });
      localStorage.setItem('sgp_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 404) {
        setError('El correo o la contraseña son incorrectos.');
      } else {
        setError('No se pudo conectar al servidor. Inténtalo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Imágen de Fondo enviada por el usuario */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <img src="/fondo.png" alt="Fondo FAMAC" className="absolute w-full h-full object-cover opacity-60 mix-blend-multiply" onError={(e) => { e.currentTarget.style.display = 'none' }} />
      </div>
      
      {/* Decorative Blur */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none z-0" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md py-8 px-8 mx-4 relative z-10 glass rounded-3xl shadow-soft"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-40 h-32 mb-4 flex items-center justify-center">
             <img src="/logo.png" alt="FAMAC Logo" className="w-full h-full object-contain drop-shadow-md" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          </div>
          <p className="text-foreground font-bold text-lg tracking-wide uppercase mt-1">SGP-FAMAC</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-white bg-primary rounded-xl font-medium text-center border border-border shadow-sm transition-all">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Identidad Digital</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
                <Mail size={18} strokeWidth={2.5} />
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-surface border-2 border-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder-text-text-secondary/50 text-foreground font-semibold"
                placeholder="doctor@famac.com"
              />
            </div>
          </div>

          <div className="space-y-2 pb-4">
            <label className="text-sm font-bold text-foreground">Contraseña Segura</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
                <Lock size={18} strokeWidth={2.5} />
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-surface border-2 border-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder-text-text-secondary/50 text-foreground font-semibold"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-lg tracking-wide flex items-center justify-center space-x-2 transition-all shadow-md shadow-primary/40 ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-95 hover:-translate-y-1'}`}
          >
            <span>{loading ? 'Accediendo al Sistema...' : 'Entrar a FAMAC'}</span>
            {!loading && <ArrowRight size={20} strokeWidth={2.5} />}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
