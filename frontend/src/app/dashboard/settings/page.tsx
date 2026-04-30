'use client';
import { useState, useEffect } from 'react';
import { Shield, Building2, Activity, Users, Lock, Save, AlertCircle, Search, Edit2, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'profile' | 'audit'>('users');
  const [userRole, setUserRole] = useState('');
  
  // Users Tab State
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // New User Modal State
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'DOCTOR' });

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    foundationName: '',
    director: '',
    address: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || '');
    
    if (user.role === 'ADMIN') {
      api.get('/users')
         .then(res => setUsers(res.data))
         .catch(err => console.error("Error cargando usuarios", err))
         .finally(() => setLoadingUsers(false));
         
      api.get('/settings/profile')
         .then(res => {
            if (res.data) setProfileData(res.data);
         }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'audit' && userRole === 'ADMIN') {
      setLoadingAudit(true);
      api.get('/settings/audit-logs')
        .then(res => setAuditLogs(res.data))
        .catch(console.error)
        .finally(() => setLoadingAudit(false));
    }
  }, [activeTab, userRole]);

  const handleSaveProfile = async () => {
    try {
      await api.patch('/settings/profile', profileData);
      alert('Perfil Institucional guardado correctamente en la Base de Datos.');
    } catch (e) {
      console.error(e);
      alert('Error al intentar guardar el perfil.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/users', {
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
        email: newUserData.email,
        passwordHash: newUserData.password,
        role: newUserData.role
      });
      // The backend response might not include the full object right away depending on implementation, but we append it
      setUsers([{ ...res.data, role: newUserData.role, firstName: newUserData.firstName, lastName: newUserData.lastName, email: newUserData.email }, ...users]);
      setShowNewUserModal(false);
      setNewUserData({ firstName: '', lastName: '', email: '', password: '', role: 'DOCTOR' });
      alert('Personal registrado exitosamente en SGP-FAMAC.');
    } catch (err: any) {
      console.error(err);
      alert('Error crítico creando cuenta. Verifique que el correo no esté duplicado.');
    }
  };

  const handleUpdateRole = async (userId: string, currentRole: string) => {
    const newRole = prompt('Escriba exactamente el nuevo rol (ADMIN, DOCTOR, RECEPTIONIST):', currentRole);
    if (!newRole || newRole.toUpperCase() === currentRole) return;
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole.toUpperCase() });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole.toUpperCase() } : u));
    } catch (e) {
      alert('Error al actualizar el nivel jerárquico. Verifique sintaxis.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Peligro: ¿Está absolutamente seguro de revocar el acceso y BORRAR a este usuario permanentemente?')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (e) {
      alert('Error bloqueando el usuario.');
    }
  };

  if (userRole && userRole !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center shadow-inner">
          <Lock size={48} strokeWidth={2.5}/>
        </div>
        <h2 className="text-3xl font-black text-foreground">Acceso Denegado</h2>
        <p className="text-text-secondary font-medium max-w-lg">Este módulo de Ajustes del Sistema es exclusivo para los Administradores Generales. Los voluntarios y personal operativo no tienen los permisos requeridos para gestionar roles institucionales ni auditar plataformas.</p>
      </div>
    );
  }

  const tabClass = (tab: string) => `flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/30 origin-left scale-100' : 'bg-surface border border-border text-text-secondary hover:bg-background hover:text-primary scale-95'}`;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Ajustes del Sistema</h1>
          <p className="text-text-secondary font-medium text-sm mt-1">Supervisión administrativa, control de accesos e identidad corporativa.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav Settings */}
        <div className="w-full lg:w-72 flex flex-col gap-3">
          <button onClick={() => setActiveTab('users')} className={tabClass('users')}><Users size={20} strokeWidth={2.5}/> Usuarios y Roles</button>
          <button onClick={() => setActiveTab('profile')} className={tabClass('profile')}><Building2 size={20} strokeWidth={2.5}/> Perfil Fundación</button>
          <button onClick={() => setActiveTab('audit')} className={tabClass('audit')}><Shield size={20} strokeWidth={2.5}/> Auditoría y Logs</button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-sm min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* TAB: USERS */}
            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
                  <div>
                    <h2 className="text-xl font-black text-foreground flex items-center gap-2"><Users className="text-primary"/> Gestión de Cuentas</h2>
                    <p className="text-sm font-medium text-text-secondary mt-1">Crea, bloquea o asigna niveles jerárquicos al personal oficial de FAMAC.</p>
                  </div>
                  <button onClick={() => setShowNewUserModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold shadow-md shadow-primary/20 transition-all active:scale-95">
                    + Registrar Personal
                  </button>
                </div>

                <div className="bg-background rounded-2xl border border-border overflow-hidden">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-surface text-text-secondary uppercase text-xs font-black tracking-wider border-b border-border">
                      <tr>
                        <th className="px-6 py-4">Usuario</th>
                        <th className="px-6 py-4">Correo (Credencial)</th>
                        <th className="px-6 py-4">Jerarquía (Rol)</th>
                        <th className="px-6 py-4 text-right">Controles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {loadingUsers ? (
                         <tr><td colSpan={4} className="px-6 py-10 text-center font-bold text-text-secondary">Descargando matriz de usuarios...</td></tr>
                      ) : users.length === 0 ? (
                         <tr><td colSpan={4} className="px-6 py-10 text-center font-bold text-text-secondary">No hay usuarios disponibles (Simulación o Error de BD).</td></tr>
                      ) : (
                        users.map((u: any) => (
                          <tr key={u.id} className="hover:bg-surface transition-colors">
                            <td className="px-6 py-4 font-bold text-foreground">{u.firstName} {u.lastName}</td>
                            <td className="px-6 py-4 font-medium text-text-secondary">{u.email}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-lg border
                                ${u.role === 'ADMIN' ? 'bg-rose-100 text-rose-700 border-rose-200' : 
                                  u.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                                  'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button onClick={() => handleUpdateRole(u.id, u.role)} className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors tooltip-trigger" title="Modificar Contraseña/Rol"><Edit2 size={18}/></button>
                              <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-rose-400 hover:text-white hover:bg-rose-500 rounded-lg transition-colors tooltip-trigger" title="Revocar Accesos"><Trash2 size={18}/></button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                 <div className="border-b border-border pb-6 flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-black text-foreground flex items-center gap-2"><Building2 className="text-primary"/> Perfil Institucional</h2>
                    <p className="text-sm font-medium text-text-secondary mt-1">Estos datos alimentan automáticamente los membretes de los reportes PDF impresos.</p>
                  </div>
                  <button onClick={handleSaveProfile} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95">
                    <Save size={18} strokeWidth={2.5}/> Guardar Perfil
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="md:col-span-2">
                     <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Nombre Entidad Oficial</label>
                     <input value={profileData.foundationName} onChange={e => setProfileData({...profileData, foundationName: e.target.value})} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div className="md:col-span-2">
                     <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Autoridad a Cargo (Director/a)</label>
                     <input value={profileData.director} onChange={e => setProfileData({...profileData, director: e.target.value})} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div className="md:col-span-2">
                     <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1"><MapPin size={14}/> Sede Física Central</label>
                     <textarea rows={2} value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div>
                     <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1"><Phone size={14}/> Contacto de Centro</label>
                     <input value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div>
                     <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1"><Mail size={14}/> Email Institucional</label>
                     <input value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: AUDIT */}
            {activeTab === 'audit' && (
              <motion.div key="audit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="border-b border-border pb-6">
                  <h2 className="text-xl font-black text-foreground flex items-center gap-2"><Shield className="text-primary"/> Registro de Actividad</h2>
                  <p className="text-sm font-medium text-text-secondary mt-1">Bitácora inmutable de eventos críticos. Monitorea quién hizo qué y cuándo dentro de la base de datos de FAMAC.</p>
                </div>

                <div className="bg-background rounded-2xl border border-border overflow-hidden">
                  <div className="p-4 bg-surface border-b border-border flex flex-col md:flex-row gap-3 items-center justify-between">
                     <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16}/>
                        <input placeholder="Filtrar bitácora por usuario o evento..." className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all"/>
                     </div>
                     <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border hover:bg-surface text-foreground font-bold text-xs uppercase tracking-wider rounded-lg transition-all"><AlertCircle size={14}/> Exportar Log</button>
                  </div>
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-surface text-text-secondary uppercase text-[11px] font-black tracking-widest border-b border-border">
                      <tr>
                        <th className="px-6 py-4">Evento Trackeado</th>
                        <th className="px-6 py-4">Operador Original</th>
                        <th className="px-6 py-4">Objetivo (Target API)</th>
                        <th className="px-6 py-4 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {loadingAudit && <tr><td colSpan={4} className="px-6 py-10 text-center font-bold text-text-secondary">Extrayendo registro de actividades cifrado...</td></tr>}
                      {!loadingAudit && auditLogs.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center font-bold text-text-secondary">No han ocurrido modificaciones en el sistema recientemente.</td></tr>}
                      {!loadingAudit && auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-surface transition-colors">
                          <td className="px-6 py-4 font-black flex items-center gap-2 text-foreground">
                             <span className={`w-2 h-2 rounded-full 
                               ${log.severity === 'critical' ? 'bg-rose-500' : log.severity === 'success' ? 'bg-emerald-500' : log.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                             {log.action}
                          </td>
                          <td className="px-6 py-4 font-bold text-primary">{log.user}</td>
                          <td className="px-6 py-4 font-medium text-text-secondary">{log.target}</td>
                          <td className="px-6 py-4 text-right font-medium text-text-secondary text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* NEW USER MODAL OVERLAY */}
      <AnimatePresence>
        {showNewUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl border border-border">
              <h2 className="text-2xl font-black text-foreground mb-6">Registrar Nuevo Personal</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-text-secondary uppercase">Nombre</label>
                    <input required value={newUserData.firstName} onChange={e => setNewUserData({...newUserData, firstName: e.target.value})} className="w-full mt-1 px-4 py-3 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none text-foreground" placeholder="Ej: Dra. María" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-secondary uppercase">Apellido</label>
                    <input required value={newUserData.lastName} onChange={e => setNewUserData({...newUserData, lastName: e.target.value})} className="w-full mt-1 px-4 py-3 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none text-foreground" placeholder="Ej: Gómez" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase">Correo Electrónico (Credencial de Acceso)</label>
                  <input type="email" required value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})} className="w-full mt-1 px-4 py-3 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none text-foreground" placeholder="doctora@famac.org" />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase">Contraseña Dinámica Temporal</label>
                  <input type="password" required value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})} className="w-full mt-1 px-4 py-3 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none text-foreground" placeholder="Mínimo 6 caracteres" />
                </div>
                <div>
                   <label className="text-xs font-bold text-text-secondary uppercase">Nivel Jerárquico Inicial</label>
                   <select value={newUserData.role} onChange={e => setNewUserData({...newUserData, role: e.target.value})} className="w-full mt-1 px-4 py-3 bg-background border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none text-foreground cursor-pointer">
                      <option value="DOCTOR">DOCTOR (Gestión de Expedientes)</option>
                      <option value="RECEPTIONIST">RECEPCIONISTA (Modo Lectura / Agendas)</option>
                      <option value="ADMIN">ADMINISTRADOR TOTAL (Peligro)</option>
                   </select>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <button type="button" onClick={() => setShowNewUserModal(false)} className="px-5 py-2.5 bg-background border border-border rounded-xl font-bold text-text-secondary text-sm hover:bg-surface transition-all">Cancelar</button>
                  <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/30 hover:bg-primary-hover active:scale-95 transition-all outline-none">
                     Inscribir en FAMAC
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
