import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Calendar as CalendarIcon, Users, Settings, 
  MessageSquare, TrendingUp, Clock, UserCheck, AlertCircle, 
  MoreVertical, Smartphone, Search, CheckCircle2, 
  XCircle, PauseCircle, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
// CORRECCIÓN 1: Ajuste de rutas (asumiendo que estás en src/pages)
import { GlassCard } from '../../components/ui/GlassCard';
import { cn } from '../../lib/utils';

// --- TIPOS DE DATOS ---
type EstadoCita = 'confirmada' | 'pendiente' | 'cancelada' | 'sala_espera' | 'finalizada';
type EstadoTratamiento = 'lead' | 'contactado' | 'agendado' | 'tratamiento' | 'recuperacion';

interface Paciente {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  estado_tratamiento: EstadoTratamiento;
  ltv: number; 
  ultima_interaccion: string;
}

interface Cita {
  id: string;
  pacienteId: string;
  doctor: string;
  fecha: string;
  hora: string;
  duracion: number;
  tipo: string;
  estado: EstadoCita;
  monto: number;
}

// --- DATOS MOCK ---
const MOCK_PACIENTES: Paciente[] = [
  { id: '1', nombre: 'María Gómez', telefono: '+54911...', email: 'maria@mail.com', estado_tratamiento: 'agendado', ltv: 1200, ultima_interaccion: 'Hoy, 09:00' },
  { id: '2', nombre: 'Juan Pérez', telefono: '+54911...', email: 'juan@mail.com', estado_tratamiento: 'contactado', ltv: 0, ultima_interaccion: 'Ayer, 14:30' },
  { id: '3', nombre: 'Carlos Ruiz', telefono: '+54911...', email: 'carlos@mail.com', estado_tratamiento: 'lead', ltv: 0, ultima_interaccion: 'Hace 2h' },
  { id: '4', nombre: 'Ana López', telefono: '+54911...', email: 'ana@mail.com', estado_tratamiento: 'recuperacion', ltv: 4500, ultima_interaccion: 'Hace 3d' },
  { id: '5', nombre: 'Pedro S.', telefono: '+54911...', email: 'pedro@mail.com', estado_tratamiento: 'tratamiento', ltv: 850, ultima_interaccion: 'Hace 1h' },
];

const MOCK_CITAS: Cita[] = [
  { id: '101', pacienteId: '1', doctor: 'Dr. Usuario', fecha: new Date().toISOString().split('T')[0], hora: '09:00', duracion: 30, tipo: 'Consulta General', estado: 'confirmada', monto: 5000 },
  { id: '102', pacienteId: '2', doctor: 'Dr. Usuario', fecha: new Date().toISOString().split('T')[0], hora: '10:30', duracion: 60, tipo: 'Limpieza', estado: 'pendiente', monto: 8000 },
  { id: '103', pacienteId: '4', doctor: 'Dr. Usuario', fecha: new Date().toISOString().split('T')[0], hora: '14:00', duracion: 45, tipo: 'Control', estado: 'sala_espera', monto: 0 },
  { id: '104', pacienteId: '5', doctor: 'Dr. Usuario', fecha: new Date().toISOString().split('T')[0], hora: '16:00', duracion: 60, tipo: 'Ortodoncia', estado: 'cancelada', monto: 15000 },
];

// --- UTILS ---
const getStatusColor = (status: EstadoCita) => {
  switch (status) {
    case 'confirmada': return 'text-neon-main bg-neon-main/10 border-neon-main/30';
    case 'pendiente': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'cancelada': return 'text-red-500 bg-red-500/10 border-red-500/30 opacity-70';
    case 'sala_espera': return 'text-blue-400 bg-blue-400/10 border-blue-400/30 animate-pulse';
    default: return 'text-gray-400 bg-white/5';
  }
};

const formatMoney = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

// ==========================================
// 1. VISTA DE PILOTO (HOME)
// ==========================================
const PilotView = () => {
  const ingresosTotal = useMemo(() => MOCK_CITAS.filter(c => c.estado !== 'cancelada').reduce((acc, curr) => acc + curr.monto, 0), []);
  // Asumiendo 8 turnos diarios para el cálculo de ocupación
  const ocupacion = Math.round((MOCK_CITAS.filter(c => c.estado === 'confirmada').length / 8) * 100); 
  
  const chartData = [
    { name: 'Lun', leads: 4, confirmados: 2 },
    { name: 'Mar', leads: 3, confirmados: 1 },
    { name: 'Mié', leads: 7, confirmados: 5 },
    { name: 'Jue', leads: 5, confirmados: 4 },
    { name: 'Vie', leads: 9, confirmados: 8 },
    { name: 'Sáb', leads: 2, confirmados: 2 },
    { name: 'Dom', leads: 1, confirmados: 0 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="!p-5 border-l-4 border-l-neon-main flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Ingresos Proyectados</p>
              <h3 className="text-3xl font-display font-bold text-white tracking-tight">{formatMoney(ingresosTotal)}</h3>
            </div>
            <div className="p-2 bg-neon-main/10 rounded-lg text-neon-main"><TrendingUp size={20} /></div>
          </div>
          <div className="mt-2 text-xs text-green-400 font-medium">+14% vs mes anterior</div>
        </GlassCard>
        
        <GlassCard className="!p-5 border-l-4 border-l-blue-500 flex flex-col justify-between">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Ocupación Hoy</p>
              <h3 className="text-3xl font-display font-bold text-white tracking-tight">{ocupacion}%</h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Clock size={20} /></div>
          </div>
           <div className="mt-2 text-xs text-gray-500">4 espacios libres</div>
        </GlassCard>

        <GlassCard className="!p-5 border-l-4 border-l-purple-500 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Tiempo Ahorrado IA</p>
              <h3 className="text-3xl font-display font-bold text-white tracking-tight">14hs</h3>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Zap size={20} /></div>
          </div>
          <div className="mt-2 text-xs text-gray-500">Equivale a $45.000 en personal</div>
        </GlassCard>

        <GlassCard className="!p-5 border-l-4 border-l-red-500 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -top-6 bg-red-500/20 w-24 h-24 rounded-full blur-xl" />
          <div className="flex justify-between items-start relative z-10">
             <div>
               <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Atención Requerida</p>
               <h3 className="text-3xl font-display font-bold text-white tracking-tight">3 Leads</h3>
             </div>
             <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><AlertCircle size={20} /></div>
          </div>
          <button className="mt-2 text-xs text-white bg-red-500/20 hover:bg-red-500/30 py-1 px-2 rounded border border-red-500/50 transition-colors w-fit">
            Ver Pendientes
          </button>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRÁFICO CENTRAL */}
        <div className="lg:col-span-2 h-full">
          <GlassCard className="h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-neon-main"/> 
                Rendimiento de Conversión
              </h3>
            </div>
            <div className="flex-1 w-full h-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff99" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00ff99" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="leads" stroke="#00ff99" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
                  <Area type="monotone" dataKey="confirmados" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorConf)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* FEED DE ACTIVIDAD */}
        <GlassCard className="h-[400px] flex flex-col">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"/> Live Pulse
          </h3>
          <div className="flex-1 overflow-y-auto space-y-0 pr-1 custom-scrollbar">
            {[
              { type: 'success', msg: 'Turno confirmado con María Gómez', time: '2 min', icon: CheckCircle2 },
              { type: 'warning', msg: 'Juan Pérez derivado a recepción (Pregunta compleja)', time: '15 min', icon: AlertCircle },
              { type: 'info', msg: 'Recordatorio enviado a Pedro S.', time: '32 min', icon: MessageSquare },
              { type: 'success', msg: 'Turno confirmado con Ana L.', time: '1h', icon: CheckCircle2 },
              { type: 'error', msg: 'Cancelación: Carlos M. (Reprogramando...)', time: '2h', icon: XCircle },
              { type: 'ia', msg: 'IA está negociando horario con Nuevo Lead', time: 'ahora', icon: Zap },
            ].map((log, i) => (
              <div key={i} className="flex gap-3 items-start p-3 hover:bg-white/5 rounded-lg transition-colors group cursor-default border-b border-white/5 last:border-0">
                <div className={`mt-0.5 p-1.5 rounded-md shrink-0 ${
                  log.type === 'success' ? 'bg-green-500/10 text-green-500' : 
                  log.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' : 
                  log.type === 'error' ? 'bg-red-500/10 text-red-500' : 
                  log.type === 'ia' ? 'bg-neon-main/10 text-neon-main animate-pulse' :
                  'bg-blue-500/10 text-blue-500'
                }`}>
                  <log.icon size={14} />
                </div>
                <div>
                  <p className="text-gray-300 text-xs leading-snug group-hover:text-white transition-colors">{log.msg}</p>
                  <span className="text-[10px] text-gray-600 font-mono">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

// ==========================================
// 2. AGENDA VISUAL
// ==========================================
const AgendaModule = () => {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Agenda Inteligente</h2>
          <p className="text-xs text-gray-500">Gestionada por Vintex AI</p>
        </div>
        <div className="flex items-center gap-4">
             <div className="bg-black/30 p-1 rounded-lg border border-white/10 flex text-xs">
                <button className="px-3 py-1.5 bg-white/10 text-white rounded shadow">Día</button>
                <button className="px-3 py-1.5 text-gray-400 hover:text-white transition-colors">Semana</button>
                <button className="px-3 py-1.5 text-gray-400 hover:text-white transition-colors">Lista</button>
             </div>
             <button className="bg-neon-main text-black text-xs font-bold px-4 py-2 rounded hover:bg-neon-dark transition-colors">
               + Agendar Manual
             </button>
        </div>
      </div>

      <GlassCard className="flex-1 overflow-hidden flex flex-col !p-0">
        <div className="flex border-b border-white/10 p-4 bg-white/5">
             <div className="w-16 text-center text-xs text-gray-400 font-mono pt-1">HORA</div>
             <div className="flex-1 pl-4 text-xs text-gray-400 font-mono pt-1">PACIENTE & DETALLES</div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 relative">
           <div className="absolute left-0 right-0 top-[180px] border-t border-red-500/50 z-10 flex items-center pointer-events-none">
               <span className="bg-red-500 text-white text-[10px] px-1 rounded-r font-bold">AHORA</span>
           </div>

           {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '14:00', '15:00', '16:00'].map((time) => {
              const cita = MOCK_CITAS.find(c => c.hora === time);
              return (
                <div key={time} className="flex gap-4 min-h-[80px] group relative">
                   <div className="w-16 text-right text-xs text-gray-600 font-mono pt-2">{time}</div>
                   <div className="flex-1 border-t border-white/5 relative pt-1">
                      {cita ? (
                        <motion.div 
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           className={cn(
                               "absolute top-1 left-0 right-4 rounded-lg p-3 border flex justify-between items-center cursor-pointer hover:brightness-110 transition-all shadow-lg z-10",
                               getStatusColor(cita.estado)
                           )}
                           style={{ height: `${(cita.duracion / 30) * 80 - 10}px` }} 
                        >
                           <div className="flex items-start gap-3">
                               <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-xs font-bold">
                                   {cita.pacienteId}
                               </div>
                               <div>
                                   <h4 className="text-sm font-bold leading-none mb-1">{MOCK_PACIENTES.find(p => p.id === cita.pacienteId)?.nombre}</h4>
                                   <p className="text-[10px] opacity-80 flex items-center gap-1"><Smartphone size={10}/> {cita.tipo}</p>
                               </div>
                           </div>
                           <div className="flex items-center gap-2">
                               <span className="text-[10px] font-mono bg-black/20 px-2 py-1 rounded">{cita.duracion} min</span>
                               <button className="p-1.5 hover:bg-black/20 rounded text-current"><MessageSquare size={14} /></button>
                               <button className="p-1.5 hover:bg-black/20 rounded text-current"><MoreVertical size={14} /></button>
                           </div>
                        </motion.div>
                      ) : (
                        <div className="h-full w-full hover:bg-white/5 rounded-lg transition-colors -mt-1 border border-transparent hover:border-white/5 border-dashed flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer">
                           <span className="text-xs text-gray-500">+ Disponible</span>
                        </div>
                      )}
                   </div>
                </div>
              )
           })}
        </div>
      </GlassCard>
    </div>
  );
};

// ==========================================
// 3. CRM DE PACIENTES
// ==========================================
const CRMModule = () => {
  // CORRECCIÓN 2: Tipado estricto para las columnas
  const columns: { id: EstadoTratamiento, title: string, color: string }[] = [
    { id: 'lead', title: 'Nuevos Leads', color: 'border-blue-500' },
    { id: 'contactado', title: 'Contactados', color: 'border-yellow-500' },
    { id: 'agendado', title: 'Agendados', color: 'border-neon-main' },
    { id: 'tratamiento', title: 'En Tratamiento', color: 'border-purple-500' },
    { id: 'recuperacion', title: 'Recuperación', color: 'border-pink-500' },
  ];

  return (
    <div className="h-full flex flex-col animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Pipeline de Pacientes</h2>
        <div className="flex gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
                <input type="text" placeholder="Buscar paciente..." className="bg-black/30 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white w-48 focus:border-neon-main outline-none"/>
            </div>
            <button className="bg-neon-main text-black px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-neon-dark">
                <Users size={14}/> Nuevo Paciente
            </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-w-max h-full pb-4">
          {columns.map((col) => {
            const items = MOCK_PACIENTES.filter(p => p.estado_tratamiento === col.id);
            return (
              <div key={col.id} className="w-[280px] flex flex-col h-full">
                <div className={`flex justify-between items-center mb-3 pb-2 border-b-2 ${col.color}`}>
                   <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{col.title}</span>
                   <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-400">{items.length}</span>
                </div>
                
                <div className="flex-1 bg-white/5 rounded-xl p-2 space-y-2 overflow-y-auto custom-scrollbar border border-white/5">
                   {items.map(patient => (
                     <motion.div 
                        whileHover={{ scale: 1.02 }}
                        key={patient.id} 
                        className="bg-[#151515] p-3 rounded-lg border border-white/5 hover:border-white/20 shadow-sm cursor-grab active:cursor-grabbing group"
                     >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[10px] font-bold text-white">
                                    {patient.nombre.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-gray-200">{patient.nombre}</span>
                            </div>
                            {patient.ltv > 1000 && <span className="text-[8px] bg-neon-main/10 text-neon-main px-1.5 py-0.5 rounded border border-neon-main/20">VIP</span>}
                        </div>
                        
                        <div className="space-y-1.5">
                            <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Clock size={10}/> {patient.ultima_interaccion}
                            </div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                <LayoutDashboard size={10}/> LTV: ${patient.ltv}
                            </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/5 flex justify-between opacity-60 group-hover:opacity-100 transition-opacity">
                            <button className="text-[10px] text-neon-main hover:underline flex items-center gap-1">
                                <MessageSquare size={10}/> Chat IA
                            </button>
                            <button className="text-[10px] text-gray-400 hover:text-white">Ver Ficha</button>
                        </div>
                     </motion.div>
                   ))}
                   <button className="w-full py-2 text-xs text-gray-500 hover:bg-white/5 rounded border border-dashed border-white/10 hover:border-white/20 transition-all">
                       + Añadir
                   </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. CONFIGURACIÓN IA
// ==========================================
const ConfigModule = () => {
    const [mode, setMode] = useState<'auto' | 'hybrid' | 'off'>('auto');

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Settings className="text-neon-main" /> Configuración del Cerebro
            </h2>

            <GlassCard className="mb-8 !p-8 border-neon-main/20">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">Modo de Operación</h3>
                        <p className="text-sm text-gray-400 max-w-md">Define cuánta autonomía tiene Vintex AI sobre tu agenda.</p>
                    </div>
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                        <button 
                            onClick={() => setMode('auto')}
                            className={cn(
                                "px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
                                mode === 'auto' ? "bg-neon-main text-black shadow-[0_0_20px_rgba(0,255,153,0.3)]" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <Zap size={16} /> Automático
                        </button>
                        <button 
                            onClick={() => setMode('hybrid')}
                            className={cn(
                                "px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
                                mode === 'hybrid' ? "bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.3)]" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <UserCheck size={16} /> Híbrido
                        </button>
                        <button 
                            onClick={() => setMode('off')}
                            className={cn(
                                "px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
                                mode === 'off' ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <PauseCircle size={16} /> Pausado
                        </button>
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="!p-6">
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2"><CalendarIcon size={16} className="text-blue-400"/> Reglas de Agenda</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                            <div>
                                <p className="text-sm text-gray-200">Límite de Duración (Viernes)</p>
                                <p className="text-xs text-gray-500">No agendar citas {'>'} 1 hora</p>
                            </div>
                            <div className="w-10 h-5 bg-neon-main rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-3 h-3 bg-black rounded-full"/></div>
                        </div>
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                            <div>
                                <p className="text-sm text-gray-200">Bloqueo Vacaciones</p>
                                <p className="text-xs text-gray-500">Dr. Usuario fuera 1-15 Enero</p>
                            </div>
                            <div className="w-10 h-5 bg-gray-700 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"/></div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="!p-6">
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2"><MessageSquare size={16} className="text-purple-400"/> Personalidad del Bot</h4>
                    <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-xs text-gray-400">Tono de Voz</label>
                            <select className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white outline-none focus:border-neon-main">
                                <option>Profesional y Empático (Recomendado)</option>
                                <option>Directo y Eficiente</option>
                                <option>Amigable y Casual</option>
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs text-gray-400">Tiempo de Espera antes de responder</label>
                            <input type="range" className="w-full accent-neon-main" />
                            <div className="flex justify-between text-[10px] text-gray-500"><span>Inmediato</span><span>2 min (Natural)</span></div>
                         </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

// --- DASHBOARD PRINCIPAL ---
export const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'agenda' | 'crm' | 'config'>('home');

  const NavItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: React.ElementType, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 mb-1",
        activeTab === id 
          ? 'bg-neon-main text-black font-bold shadow-[0_0_15px_rgba(0,255,153,0.4)]' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      )}
    >
      <Icon size={20} />
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#050505] flex overflow-hidden">
      <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl fixed h-full z-20 hidden md:flex flex-col p-6">
        <div className="mb-10 flex items-center gap-3 px-2">
           <div className="w-8 h-8 bg-gradient-to-br from-neon-main to-teal-500 rounded-lg flex items-center justify-center font-bold text-black shadow-neon">V</div>
           <span className="font-display font-bold text-white text-lg tracking-wide">VINTEX</span>
        </div>

        <div className="flex-1">
          <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-4 px-4">Principal</p>
          <NavItem id="home" icon={LayoutDashboard} label="Vista de Piloto" />
          <NavItem id="agenda" icon={CalendarIcon} label="Gestión de Turnos" />
          <NavItem id="crm" icon={Users} label="CRM Pacientes" />
          
          <div className="my-6 border-t border-white/5 mx-4" />
          
          <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-4 px-4">Sistema</p>
          <NavItem id="config" icon={Settings} label="Configuración IA" />
        </div>

        <div className="mt-auto pt-6 border-t border-white/5">
          <GlassCard className="!p-3 flex items-center gap-3 !bg-white/5 !border-0 cursor-pointer hover:!bg-white/10">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white font-bold">DR</div>
            <div>
              <p className="text-xs text-white font-bold">Dr. Usuario</p>
              <p className="text-[10px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/> Online</p>
            </div>
          </GlassCard>
        </div>
      </aside>

      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-24 md:pt-8 overflow-y-auto h-screen bg-tech-black bg-grid-white/[0.02]">
        <header className="flex md:hidden justify-between items-center mb-6">
           <div className="font-bold text-white flex items-center gap-2">
             <div className="w-6 h-6 bg-neon-main rounded flex items-center justify-center text-black text-xs">V</div> VINTEX AI
           </div>
        </header>

        <AnimatePresence mode="wait">
            {activeTab === 'home' && <PilotView key="home" />}
            {activeTab === 'agenda' && <AgendaModule key="agenda" />}
            {activeTab === 'crm' && <CRMModule key="crm" />}
            {activeTab === 'config' && <ConfigModule key="config" />}
        </AnimatePresence>
      </div>
    </div>
  );
};