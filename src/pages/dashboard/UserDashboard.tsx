import React, { useState, useEffect, useCallback } from 'react';
// ELIMINADO: import { supabase } ... (Ya no conectamos directo, usamos tu Backend)
import { GlassCard } from '../../components/ui/GlassCard';
import { Navbar } from '../../components/layout/Navbar';

// --- TIPOS DE DATOS ---
interface Doctor {
  id: number;
  nombre: string;
  especialidad: string;
  horario_inicio: string;
  horario_fin: string;
  activo: boolean;
  color?: string;
}

interface Cita {
  id: number;
  doctor_id: number;
  cliente_id: number;
  fecha_hora: string;
  duracion_minutos: number;
  estado: string;
  // Tu backend devuelve estos objetos anidados gracias al join
  cliente: { nombre: string; telefono: string } | null; 
  doctor: { nombre: string } | null;
}

interface Paciente {
  id: number;
  nombre: string;
  dni: string;
  telefono: string;
  activo: boolean;
  solicitud_de_secretaria?: boolean; // Opcional porque viene de la DB como 'solicitud_de_secretaría'
}

interface SidebarButtonProps {
    active: boolean;
    onClick: () => void;
    icon: string;
    label: string;
    notification?: boolean;
}

// --- CONFIGURACIÓN API ---
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'; // Puerto 3001 según tu doc

// CORRECCIÓN DE IMPORTACIÓN: Exportación nombrada para coincidir con App.tsx
export const UserDashboard = () => {
  
  // --- ESTADO GLOBAL ---
  const [activeTab, setActiveTab] = useState<'agenda' | 'pacientes' | 'doctores'>('agenda');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // --- DATOS DE LA CLÍNICA ---
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [hasNotification, setHasNotification] = useState(false);

  // --- ESTADO UI AGENDA ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | 'all'>('all');

  // --- ESTADO FORMULARIOS ---
  const [showDocForm, setShowDocForm] = useState(false);
  const [newDoc, setNewDoc] = useState({ nombre: '', especialidad: '' });

  // --- FUNCIONES DE AYUDA API ---
  const authFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!token) return null;
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        }
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error en el servidor');
    }
    return res.json();
  }, [token]);

  // --- CARGA DE DATOS (Conectado al Backend server.js) ---
  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      // 1. Cargar Datos Iniciales (Doctores y Pacientes desde tu endpoint optimizado)
      // Usamos el endpoint '/api/initial-data' definido en server.js
      const initialData = await authFetch('/initial-data');
      
      if (initialData) {
         setDoctores(initialData.doctores || []);
         // Tu backend devuelve 'clientes', lo mapeamos a 'pacientes'
         setPacientes(initialData.clientes || []);
         
         // Verificamos la notificación de secretaría (según tu lógica de base de datos)
         const notif = initialData.clientes?.some((p: any) => p.solicitud_de_secretaria || p.solicitud_de_secretaría);
         setHasNotification(!!notif);
      }

      // 2. Cargar Citas (Endpoint '/api/citas' del server.js)
      // Tu backend ya hace los joins con clientes y doctores
      const citasData = await authFetch('/citas');
      if (citasData) {
          setCitas(citasData);
      }

    } catch (error: any) {
      console.error("Error cargando datos del Backend:", error.message);
    } finally {
      setLoading(false);
    }
  }, [token, authFetch]);

  // --- CICLO DE VIDA ---
  
  // 1. Obtener Token (Simulado desde LocalStorage o Contexto de Auth)
  useEffect(() => {
      // Asumiendo que guardaste el token al hacer login
      const storedToken = localStorage.getItem('token') || localStorage.getItem('sb-access-token'); 
      // NOTA: Ajusta la key según cómo guardes el token en Login.tsx
      if (storedToken) {
          setToken(storedToken);
      } else {
          // Si no hay token, redirigir o manejar error
          console.warn("No hay token de autenticación");
          setLoading(false);
      }
  }, []);

  // 2. Polling de Datos (Cada 10s consulta al Backend)
  useEffect(() => {
    if (token) {
      fetchData();
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [token, fetchData]);


  // --- ACCIONES (Conectadas al Backend) ---

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
        // POST a tu backend /api/doctores
        await authFetch('/doctores', {
            method: 'POST',
            body: JSON.stringify({
                nombre: newDoc.nombre,
                especialidad: newDoc.especialidad,
                horario_inicio: '09:00', // Formato HH:MM validado por Zod en backend
                horario_fin: '18:00',
                color: '#00ff9f' // Color por defecto requerido por tu esquema Zod
            })
        });

        setShowDocForm(false);
        setNewDoc({ nombre: '', especialidad: '' });
        fetchData(); // Recargar datos
    } catch (error: any) {
        alert("Error al crear doctor: " + error.message);
    }
  };

  const toggleBotStatus = async (paciente: Paciente) => {
    // Actualización optimista UI
    const updatedPacientes = pacientes.map(p => 
        p.id === paciente.id ? { ...p, activo: !p.activo } : p
    );
    setPacientes(updatedPacientes);

    try {
        // PATCH a tu backend /api/clients/:id (Nota: server.js usa 'clientes', asegúrate de la ruta)
        // Según server.js línea 227 la ruta es /api/clientes/:id
        await authFetch(`/clientes/${paciente.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ activo: !paciente.activo })
        });
    } catch (error) {
        console.error("Error actualizando bot:", error);
        fetchData(); // Revertir si falla
    }
  };

  // --- HELPERS AGENDA ---
  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let i = 8; i < 19; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
      slots.push(`${i.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const getAppointmentsForSlot = (docId: number, timeStr: string) => {
    // Normalización de fechas para evitar problemas de zona horaria simples
    const dateStr = currentDate.toISOString().split('T')[0];
    
    return citas.filter(c => {
      if (c.doctor_id !== docId) return false;
      
      // El backend devuelve fecha ISO (ej: 2025-11-05T14:30:00Z)
      const citaDate = new Date(c.fecha_hora);
      const cDateStr = citaDate.toISOString().split('T')[0];
      const cTimeStr = citaDate.toISOString().split('T')[1].substring(0, 5); // HH:MM
      
      return cDateStr === dateStr && cTimeStr === timeStr;
    });
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white font-sans selection:bg-[#00ff9f] selection:text-black">
      <Navbar />

      <div className="pt-24 px-4 md:px-8 pb-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-80px)]">
        
        {/* --- SIDEBAR --- */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <GlassCard className="h-full p-4 flex flex-col gap-2 border border-white/5 bg-white/[0.02]">
            <div className="mb-8 px-2 mt-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-bolt text-[#00ff9f]"></i> Clínica
              </h2>
              <p className="text-xs text-gray-500 mt-1">Gestión Inteligente</p>
            </div>

            <SidebarButton 
              active={activeTab === 'agenda'} 
              onClick={() => setActiveTab('agenda')} 
              icon="📅" label="Agenda" 
            />
            
            <SidebarButton 
              active={activeTab === 'pacientes'} 
              onClick={() => setActiveTab('pacientes')} 
              icon="👥" label="Pacientes" 
              notification={hasNotification}
            />

            <SidebarButton 
              active={activeTab === 'doctores'} 
              onClick={() => setActiveTab('doctores')} 
              icon="👨‍⚕️" label="Doctores" 
            />
          </GlassCard>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 overflow-hidden flex flex-col relative">
           {loading && (
              <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ff9f]"></div>
              </div>
            )}

          <GlassCard className="flex-1 overflow-hidden flex flex-col p-0 border border-white/5 bg-white/[0.02]">
            
            {/* --- VISTA: AGENDA --- */}
            {activeTab === 'agenda' && (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <div className="flex items-center gap-4">
                    <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition">←</button>
                    <h3 className="text-lg font-semibold capitalize">{currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                    <button onClick={() => changeDate(1)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition">→</button>
                  </div>
                  
                  <div className="flex gap-3">
                    <select 
                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00ff9f] outline-none text-gray-300"
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    >
                        <option value="all">Todos los profesionales</option>
                        {doctores.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                    </select>
                    <button className="bg-[#00ff9f] text-black font-semibold px-4 py-2 rounded-lg hover:bg-[#00cc80] transition shadow-[0_0_15px_rgba(0,255,159,0.3)]">
                        + Cita
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <div className="flex min-w-[800px]">
                        {/* Columna Horas */}
                        <div className="w-20 sticky left-0 bg-[#0D0D0F] border-r border-white/10 z-20 flex-shrink-0">
                            <div className="h-12 border-b border-white/10 bg-[#16171a]"></div> 
                            {getTimeSlots().map(time => (
                                <div key={time} className="h-24 border-b border-white/5 flex items-start justify-center pt-2 text-xs text-gray-500 font-mono">
                                    {time}
                                </div>
                            ))}
                        </div>

                        {doctores.length === 0 && !loading && (
                            <div className="p-8 text-gray-500 italic">No hay doctores registrados.</div>
                        )}
                        
                        {doctores
                            .filter(d => selectedDoctorId === 'all' || d.id === selectedDoctorId)
                            .map(doctor => (
                            <div key={doctor.id} className="flex-1 min-w-[200px] border-r border-white/5 bg-gradient-to-b from-transparent to-white/[0.01]">
                                <div className="h-12 sticky top-0 bg-[#16171a]/90 backdrop-blur border-b border-white/10 flex items-center justify-center font-medium text-[#00ff9f] z-10 shadow-lg">
                                    {doctor.nombre}
                                </div>
                                {getTimeSlots().map(time => {
                                    const slotAppts = getAppointmentsForSlot(doctor.id, time);
                                    return (
                                        <div key={`${doctor.id}-${time}`} className="h-24 border-b border-white/5 p-1 relative group transition-colors hover:bg-white/[0.03]">
                                            {slotAppts.map(appt => (
                                                <div key={appt.id} className="absolute inset-x-1 top-1 bottom-1 bg-[#00ff9f]/10 border-l-2 border-[#00ff9f] p-2 rounded overflow-hidden hover:scale-[1.02] hover:shadow-lg hover:bg-[#00ff9f]/20 transition-all cursor-pointer z-10">
                                                    <p className="font-bold text-xs text-[#00ff9f] truncate">{appt.cliente?.nombre || 'Cliente'}</p>
                                                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${appt.estado === 'confirmada' ? 'bg-green-500' : 'bg-yellow-500'}`}></span> 
                                                        {appt.estado}
                                                    </p>
                                                </div>
                                            ))}
                                            
                                            {/* Hover Add Button */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <span className="text-[#00ff9f] text-xl">+</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            )}

            {/* --- VISTA: PACIENTES --- */}
            {activeTab === 'pacientes' && (
              <div className="flex flex-col h-full p-6">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Base de Pacientes</h2>
                        <p className="text-sm text-gray-400 mt-1">Gestiona los usuarios y el estado del bot de IA.</p>
                    </div>
                    <input type="text" placeholder="Buscar por nombre o DNI..." className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 w-72 focus:border-[#00ff9f] outline-none text-sm" />
                </div>

                <div className="flex-1 overflow-auto border border-white/10 rounded-xl bg-black/20">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5 sticky top-0 z-10 text-xs uppercase tracking-wider text-gray-400">
                            <tr>
                                <th className="p-4 font-semibold">Nombre</th>
                                <th className="p-4 font-semibold">Teléfono</th>
                                <th className="p-4 font-semibold">Estado IA</th>
                                <th className="p-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {pacientes.map(paciente => (
                                <tr key={paciente.id} className={`hover:bg-white/[0.02] transition-colors ${paciente.solicitud_de_secretaria ? 'bg-red-500/5' : ''}`}>
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold">
                                            {paciente.nombre.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium">{paciente.nombre}</p>
                                            {paciente.solicitud_de_secretaria && (
                                                <span className="text-[10px] text-red-400 flex items-center gap-1 animate-pulse mt-0.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Solicita Atención
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm font-mono">{paciente.telefono}</td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => toggleBotStatus(paciente)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                                paciente.activo 
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' 
                                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20'
                                            }`}
                                        >
                                            {paciente.activo ? 'Bot Activo' : 'Pausado'}
                                        </button>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-[#00ff9f] hover:text-white text-sm font-medium transition-colors">Ver Chat</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>
            )}

            {/* --- VISTA: DOCTORES --- */}
            {activeTab === 'doctores' && (
                <div className="p-8 overflow-auto h-full">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold">Gestión Médica</h2>
                        <button onClick={() => setShowDocForm(!showDocForm)} className="border border-dashed border-white/30 px-4 py-2 rounded-lg hover:border-[#00ff9f] hover:text-[#00ff9f] transition text-sm">
                            {showDocForm ? 'Cancelar' : '+ Nuevo Doctor'}
                        </button>
                    </div>

                    {showDocForm && (
                        <form onSubmit={handleCreateDoctor} className="mb-8 bg-white/5 p-6 rounded-xl border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 items-end animate-in fade-in slide-in-from-top-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:border-[#00ff9f] outline-none" 
                                    value={newDoc.nombre} 
                                    onChange={e => setNewDoc({...newDoc, nombre: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Especialidad</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:border-[#00ff9f] outline-none"
                                    value={newDoc.especialidad} 
                                    onChange={e => setNewDoc({...newDoc, especialidad: e.target.value})} 
                                />
                            </div>
                            <button type="submit" className="bg-[#00ff9f] text-black font-bold py-2 rounded-lg hover:bg-[#00cc80] transition">Guardar Doctor</button>
                        </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {doctores.map(doc => (
                            <div key={doc.id} className="group bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 p-5 rounded-2xl hover:border-[#00ff9f]/30 transition-all hover:shadow-[0_0_20px_rgba(0,255,159,0.05)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-[#00ff9f] blur-[50px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl">👨‍⚕️</div>
                                    <div className={`w-2 h-2 rounded-full ${doc.activo ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-gray-500'}`}></div>
                                </div>
                                <h3 className="font-bold text-lg text-white">{doc.nombre}</h3>
                                <p className="text-[#00ff9f] text-sm mb-4">{doc.especialidad}</p>
                                <div className="pt-4 border-t border-white/5 flex justify-between text-xs text-gray-500">
                                    <span>Horario:</span>
                                    <span className="text-gray-300 font-mono">
                                        {doc.horario_inicio ? doc.horario_inicio.slice(0,5) : '--:--'} - {doc.horario_fin ? doc.horario_fin.slice(0,5) : '--:--'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

          </GlassCard>
        </main>
      </div>
    </div>
  );
};

// Componente Auxiliar
const SidebarButton: React.FC<SidebarButtonProps> = ({ active, onClick, icon, label, notification }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
      active 
        ? 'bg-[#00ff9f]/10 text-[#00ff9f] border border-[#00ff9f]/20 shadow-[0_0_15px_rgba(0,255,159,0.1)]' 
        : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
    }`}
  >
    <div className="flex items-center gap-3">
        <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
        <span className="font-medium">{label}</span>
    </div>
    {notification && (
        <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
    )}
  </button>
);