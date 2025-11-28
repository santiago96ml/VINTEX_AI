import React, { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Users, Server, DollarSign, Activity, Database, AlertTriangle, Search, Check, X } from 'lucide-react';

// Datos Mock para visualizar la estructura (esto vendría de Supabase 'users' y 'subscriptions')
const mockUsers = [
  { id: 1, name: 'Clínica Santa María', email: 'contacto@santamaria.com', plan: 'Anual (Enterprise)', status: 'active', debt: 0, resources: { bot: 'online', db: '45%' }, lastPayment: '2025-10-01', nextPayment: '2026-10-01' },
  { id: 2, name: 'Dr. Roberto Gomez', email: 'roberto@gomez.com', plan: 'Mensual (Pro)', status: 'late', debt: 150, resources: { bot: 'offline', db: '12%' }, lastPayment: '2025-09-15', nextPayment: '2025-10-15' },
  { id: 3, name: 'Centro Odontológico Sur', email: 'admin@centrosur.com', plan: 'Trial (Demo)', status: 'active', debt: 0, resources: { bot: 'online', db: '5%' }, lastPayment: '-', nextPayment: 'Trial Ends in 4 days' },
];

export const AdminDashboard: React.FC = () => {
  const [filter, setFilter] = useState('');

  return (
    <div className="min-h-screen bg-[#050505] p-6 pt-24 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Admin */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Panel de Control (God Mode)</h1>
            <p className="text-gray-500 text-sm">Administración de recursos y facturación global.</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-red-500/10 border border-red-500/50 px-4 py-2 rounded text-red-400 text-xs font-mono flex items-center gap-2">
              <AlertTriangle size={14} /> 2 Usuarios con Deuda
            </div>
            <div className="bg-green-500/10 border border-green-500/50 px-4 py-2 rounded text-green-400 text-xs font-mono flex items-center gap-2">
              <Activity size={14} /> Sistemas: 98% Uptime
            </div>
          </div>
        </div>

        {/* Stats Globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Usuarios Totales', val: '1,240', icon: Users, color: 'text-blue-400' },
            { label: 'MRR (Ingresos)', val: '$14,500', icon: DollarSign, color: 'text-green-400' },
            { label: 'Uso de Recursos', val: '64 TB', icon: Database, color: 'text-purple-400' },
            { label: 'Bots Activos', val: '890', icon: Server, color: 'text-neon-main' },
          ].map((stat, i) => (
            <GlassCard key={i} className="!p-4 flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-bold">{stat.val}</h3>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Tabla de Gestión de Usuarios */}
        <GlassCard className="!p-0 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-lg">Directorio de Clientes</h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por email o nombre..." 
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:border-neon-main w-64 transition-all"
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-xs uppercase text-gray-400 font-mono">
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Suscripción</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Recursos (Bot/DB)</th>
                  <th className="p-4">Finanzas</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/5">
                {mockUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-white">{user.name}</div>
                      <div className="text-gray-500 text-xs">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-[#1A1A1A] border border-white/10 px-2 py-1 rounded text-xs text-gray-300">
                        {user.plan}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.status === 'active' ? (
                        <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold uppercase"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/> Al día</span>
                      ) : (
                         <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold uppercase"><AlertTriangle size={12}/> Adeuda</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-xs">
                      <div className="flex gap-2">
                        <span className={user.resources.bot === 'online' ? 'text-green-500' : 'text-red-500'}>BOT: {user.resources.bot}</span>
                        <span className="text-gray-500">|</span>
                        <span className="text-blue-400">DB: {user.resources.db}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={user.debt > 0 ? "text-red-400 font-bold" : "text-gray-400"}>
                        {user.debt > 0 ? `-$${user.debt}` : "---"}
                      </div>
                      <div className="text-[10px] text-gray-600">Prox: {user.nextPayment}</div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-neon-main hover:text-white hover:underline text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};