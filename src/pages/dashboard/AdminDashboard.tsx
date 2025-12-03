import { useState } from 'react';
import { 
  Users, DollarSign, Activity, Server, Search, AlertTriangle, 
  Database, MoreVertical, FileText, Power, Phone // <--- FALTABAN ESTOS IMPORTs
} from 'lucide-react';

// --- COMPONENTE UI LOCAL (Para reemplazar la importación externa si no la tienes a mano) ---
// Si ya tienes el archivo, puedes descomentar tu import original y borrar esto.
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl ${className}`}>
    {children}
  </div>
);
// import { GlassCard } from '../../components/ui/GlassCard'; // <--- Tu import original

// --- MOCK DATA ---
const mockUsers = [
  { 
    id: '1', 
    name: 'Clínica Santa María', 
    email: 'contacto@santamaria.com', 
    plan: 'Enterprise (Anual)', 
    status: 'active', 
    debt: 0, 
    demoRemaining: null,
    n8n_executions: 15400,
    cost: 45, 
    revenue: 299, 
    last_call: '2024-01-15: Revisión de flujo de WhatsApp. Cliente satisfecho.',
    resources: { bot: true, web: true },
    joined: '2023-08-01'
  },
  { 
    id: '2', 
    name: 'Dr. Roberto Gomez', 
    email: 'roberto@gomez.com', 
    plan: 'Pro (Mensual)', 
    status: 'past_due', 
    debt: 150, 
    demoRemaining: null,
    n8n_executions: 2300,
    cost: 12,
    revenue: 99,
    last_call: '2024-02-01: Reclamo por caída del bot. Se reinició instancia.',
    resources: { bot: false, web: true }, 
    joined: '2023-11-10'
  },
  { 
    id: '3', 
    name: 'Odontología Sur', 
    email: 'admin@centrosur.com', 
    plan: 'Demo', 
    status: 'active', 
    debt: 0, 
    demoRemaining: '4 días',
    n8n_executions: 850,
    cost: 5,
    revenue: 0,
    last_call: '2024-02-10: Onboarding inicial. Dudas sobre agenda.',
    resources: { bot: true, web: true },
    joined: '2024-02-01'
  },
];

export const AdminDashboard = () => {
  const [filter, setFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null); 

  const filteredUsers = mockUsers.filter(u => 
    u.name.toLowerCase().includes(filter.toLowerCase()) || 
    u.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    // Nota: Asegúrate de tener configurado 'neon-main' en tu tailwind.config.js
    // o reemplaza 'text-neon-main' por un color estándar como 'text-purple-500'
    <div className="min-h-screen bg-[#050505] p-6 pt-24 text-gray-200 font-sans relative overflow-hidden">
      
      {/* Fondo Ambiental */}
      <div className="fixed top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-purple-500 text-4xl">⚡</span> God Mode
            </h1>
            <p className="text-gray-500 text-sm mt-1">Administración centralizada de infraestructura y facturación.</p>
          </div>
          
          <div className="flex gap-3">
            <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={14} /> 1 Cliente en Mora
            </div>
            <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold flex items-center gap-2">
              <Activity size={14} /> N8N: 98% Saludable
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Ingresos (MRR)', val: '$12,450', sub: '+12% vs mes anterior', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Usuarios Totales', val: '142', sub: '12 demos activas', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Costo Operativo', val: '$3,200', sub: 'N8N + Supabase', icon: Server, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Ejecuciones Bot', val: '1.2M', sub: 'Últimos 30 días', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((stat, i) => (
            <GlassCard key={i} className="flex items-center gap-4 p-5 hover:border-white/20 transition-colors">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">{stat.label}</p>
                <h3 className="text-2xl font-bold text-white">{stat.val}</h3>
                <p className="text-[10px] text-gray-400">{stat.sub}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* TABLA DE USUARIOS */}
        <GlassCard className="!p-0 overflow-hidden border-white/10">
          {/* Toolbar Tabla */}
          <div className="p-5 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0A0A0A]/50">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-purple-500"/> Directorio de Clientes
            </h3>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Buscar cliente, email o ID..." 
                className="w-full bg-[#151515] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-purple-500 focus:outline-none transition-all"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#151515] text-xs uppercase text-gray-500 font-bold tracking-wider">
                  <th className="p-4 border-b border-white/5">Cliente</th>
                  <th className="p-4 border-b border-white/5">Estado / Plan</th>
                  <th className="p-4 border-b border-white/5">Uso & Costos</th>
                  <th className="p-4 border-b border-white/5">Infraestructura</th>
                  <th className="p-4 border-b border-white/5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-xs font-bold text-gray-400">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            {user.status === 'active' 
                                ? <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded uppercase font-bold flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/> Al día</span>
                                : <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded uppercase font-bold flex items-center gap-1"><AlertTriangle size={10}/> Deuda ${user.debt}</span>
                            }
                        </div>
                        <span className="text-xs text-gray-400">{user.plan}</span>
                        {user.demoRemaining && <span className="text-[10px] text-yellow-500 font-mono">⏳ Expira en {user.demoRemaining}</span>}
                      </div>
                    </td>

                    <td className="p-4">
                        <div className="flex items-center gap-4 text-xs">
                            <div>
                                <span className="block text-gray-500 mb-0.5">Ingreso</span>
                                <span className="text-green-400 font-mono font-bold">+${user.revenue}</span>
                            </div>
                            <div className="w-px h-6 bg-white/10"></div>
                            <div>
                                <span className="block text-gray-500 mb-0.5">Costo</span>
                                <span className="text-red-400 font-mono font-bold">-${user.cost}</span>
                            </div>
                            <div className="w-px h-6 bg-white/10"></div>
                            <div>
                                <span className="block text-gray-500 mb-0.5">Ejecuciones</span>
                                <span className="text-purple-500 font-mono">{user.n8n_executions.toLocaleString()}</span>
                            </div>
                        </div>
                    </td>

                    <td className="p-4">
                        <div className="flex gap-2">
                            <div className={`px-2 py-1 rounded text-[10px] font-bold border flex items-center gap-1 ${user.resources.bot ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                                <Server size={10} /> BOT
                            </div>
                            <div className={`px-2 py-1 rounded text-[10px] font-bold border flex items-center gap-1 ${user.resources.web ? 'bg-blue-900/20 border-blue-500/30 text-blue-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                                <Database size={10} /> WEB
                            </div>
                        </div>
                    </td>

                    <td className="p-4 text-right">
                      <button onClick={() => setSelectedUser(user)} className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* MODAL DE DETALLE DE USUARIO */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedUser(null)}>
            <div className="bg-[#101012] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                
                {/* Header Modal */}
                <div className="p-6 border-b border-white/10 bg-[#16171a] flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{selectedUser.name}</h2>
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                            {selectedUser.email} 
                            <span className="w-1 h-1 rounded-full bg-gray-500"></span> 
                            Miembro desde {selectedUser.joined}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-mono font-bold text-green-400">${selectedUser.revenue - selectedUser.cost}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">Margen Mensual</div>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto space-y-8">
                    
                    {/* Sección Control de Sistemas (Kill Switch) */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Power size={14}/> Control de Sistemas
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#050505] border border-white/10 p-4 rounded-xl flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-white mb-1">Bot de WhatsApp</div>
                                    <div className="text-xs text-gray-500">N8N Workflows</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={selectedUser.resources.bot} onChange={() => {}} />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                </label>
                            </div>
                            <div className="bg-[#050505] border border-white/10 p-4 rounded-xl flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-white mb-1">Acceso Web</div>
                                    <div className="text-xs text-gray-500">Dashboard Cliente</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={selectedUser.resources.web} onChange={() => {}} />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Historial de Llamadas / Soporte */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Phone size={14}/> Bitácora de Contacto
                        </h4>
                        <div className="bg-[#050505] border border-white/10 rounded-xl p-4">
                            <div className="flex gap-4 items-start">
                                <div className="mt-1 bg-gray-800 p-2 rounded-full text-gray-400"><FileText size={16}/></div>
                                <div>
                                    <p className="text-sm text-gray-300 italic">"{selectedUser.last_call}"</p>
                                    <p className="text-xs text-gray-600 mt-2 font-mono">Registrado por: Agente Admin</p>
                                </div>
                            </div>
                            <button className="w-full mt-4 py-2 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold text-gray-400 transition-colors">
                                + Agregar Nueva Nota
                            </button>
                        </div>
                    </div>

                </div>

                <div className="p-4 bg-[#16171a] border-t border-white/10 flex justify-end gap-3">
                    <button onClick={() => setSelectedUser(null)} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-colors">Cerrar</button>
                    {/* Botón Peligroso */}
                    <button className="px-4 py-2 rounded-lg text-sm font-bold bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors border border-red-500/20">
                        Suspender Cuenta
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};