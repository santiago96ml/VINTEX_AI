import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Navbar } from '../../components/layout/Navbar';
import { createClient } from '@supabase/supabase-js';
import { 
    format, addDays, subDays, startOfDay, endOfDay, 
    isSameDay, parseISO 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

// --- ICONOS (Puedes usar lucide-react o fontawesome) ---
// Asumo que tienes lucide-react por los archivos anteriores.
import { Calendar, Users, User, ChevronLeft, ChevronRight, Plus, X, Clock, Save, Trash2 } from 'lucide-react';

// --- CONFIGURACIÓN ---
const ORCHESTRATOR_URL = import.meta.env.VITE_ORCHESTRATOR_URL || 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host';
const DEFAULT_TIMEZONE = 'America/Argentina/Buenos_Aires';

// --- TIPOS ---
interface Doctor {
  id: number;
  nombre: string;
  especialidad: string;
  horario_inicio: string; // "09:00"
  horario_fin: string;   // "18:00"
  activo: boolean;
  color: string;
}

interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  dni?: string;
  activo: boolean;
  solicitud_de_secretaria?: boolean;
}

interface Cita {
  id: number;
  doctor_id: number;
  cliente_id: number;
  fecha_hora: string; // ISO String
  duracion_minutos: number;
  estado: 'programada' | 'confirmada' | 'cancelada' | 'completada';
  descripcion?: string;
  cliente?: { nombre: string; telefono: string };
  doctor?: { nombre: string; color: string };
}

export const UserDashboard = () => {
  // --- ESTADO DE CONEXIÓN ---
  const [config, setConfig] = useState<{ backendUrl: string; supabaseUrl: string; supabaseAnonKey?: string } | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // --- ESTADO DE DATOS ---
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [pacientes, setPacientes] = useState<Cliente[]>([]);

  // --- ESTADO DE UI (AGENDA) ---
  const [activeTab, setActiveTab] = useState<'agenda' | 'pacientes' | 'doctores'>('agenda');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | 'all'>('all');
  
  // --- ESTADO DEL MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCita, setEditingCita] = useState<Cita | null>(null);
  
  // Formulario Cita
  const [formData, setFormData] = useState({
      cliente_id: '',
      doctor_id: '',
      fecha: '',
      hora: '',
      duracion: 30,
      estado: 'programada',
      descripcion: '',
      // Campos para paciente nuevo
      isNewClient: false,
      new_client_name: '',
      new_client_phone: '',
      new_client_dni: ''
  });

  // ------------------------------------------------------------------
  // 1. INICIALIZACIÓN Y CONEXIÓN (Lógica Robusta)
  // ------------------------------------------------------------------
  useEffect(() => {
    const initSession = async () => {
      const sessionStr = localStorage.getItem('vintex_session');
      let storedToken = null;

      if (sessionStr) {
          try {
              const session = JSON.parse(sessionStr);
              storedToken = session.access_token || session.token;
          } catch (e) { console.error("Error parseando sesión", e); }
      }

      if (!storedToken) {
        window.location.href = '/login';
        return;
      }
      setToken(storedToken);

      try {
        // Pedir configuración al Orquestador
        const res = await fetch(`${ORCHESTRATOR_URL}/api/config/init-session`, {
          headers: { 
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
          }
        });

        if (!res.ok) throw new Error(`Fallo de conexión: ${res.status}`);

        const fetchedConfig = await res.json();
        setConfig(fetchedConfig);

        // Iniciar Realtime
        if (fetchedConfig.supabaseUrl && fetchedConfig.supabaseAnonKey) {
            const sb = createClient(fetchedConfig.supabaseUrl, fetchedConfig.supabaseAnonKey);
            setSupabaseClient(sb);
        }
      } catch (err: any) {
        setConfigError(err.message || "Error de conexión.");
        setLoading(false);
      }
    };
    initSession();
  }, []);

  // Helper para peticiones autenticadas
  const authFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!token || !config) return null;
    const baseUrl = config.backendUrl.replace(/\/$/, '');
    
    const res = await fetch(`${baseUrl}/api${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        }
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Error en API');
    }
    return res.json();
  }, [token, config]);

  // ------------------------------------------------------------------
  // 2. CARGA DE DATOS
  // ------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    if (!config || !token) return;

    try {
      // 1. Datos estáticos (Doctores, Pacientes)
      const initialData = await authFetch('/initial-data');
      if (initialData) {
         setDoctores(initialData.doctors || initialData.doctores || []);
         setPacientes(initialData.clients || initialData.clientes || []);
      }

      // 2. Citas del día (Optimizadas por rango)
      const start = startOfDay(currentDate).toISOString();
      const end = endOfDay(currentDate).toISOString();
      
      const citasData = await authFetch(`/citas?start=${start}&end=${end}`);
      if (citasData) setCitas(citasData);

    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }, [config, token, currentDate, authFetch]); // Dependencia currentDate para recargar al cambiar día

  // Polling y Realtime
  useEffect(() => {
      if (config && token) {
          fetchData();
          // Suscripción Realtime a cambios en 'citas'
          if (supabaseClient) {
            const channel = supabaseClient.channel('dashboard-updates')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'citas' }, () => {
                    console.log("⚡ Cambio detectado en DB, actualizando...");
                    fetchData();
                })
                .subscribe();
            return () => { supabaseClient.removeChannel(channel); };
          }
      }
  }, [config, token, fetchData, supabaseClient]);


  // ------------------------------------------------------------------
  // 3. LÓGICA DE AGENDA (Grilla Visual)
  // ------------------------------------------------------------------
  
  // Generar horas de 08:00 a 21:00
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8); // [8, 9, ..., 20]

  const getAppointmentsForDoc = (docId: number) => {
      return citas.filter(c => c.doctor_id === docId);
  };

  const handleGridClick = (docId: number, hour: number) => {
      const date = new Date(currentDate);
      date.setHours(hour, 0, 0, 0);
      
      setModalMode('create');
      setEditingCita(null);
      setFormData({
          ...formData,
          doctor_id: docId.toString(),
          fecha: format(date, 'yyyy-MM-dd'),
          hora: format(date, 'HH:mm'),
          cliente_id: '',
          isNewClient: false
      });
      setShowModal(true);
  };

  const handleEditClick = (e: React.MouseEvent, cita: Cita) => {
      e.stopPropagation();
      setModalMode('edit');
      setEditingCita(cita);
      
      const date = new Date(cita.fecha_hora);
      setFormData({
          cliente_id: cita.cliente_id.toString(),
          doctor_id: cita.doctor_id.toString(),
          fecha: format(date, 'yyyy-MM-dd'),
          hora: format(date, 'HH:mm'),
          duracion: cita.duracion_minutos,
          estado: cita.estado,
          descripcion: cita.descripcion || '',
          isNewClient: false,
          new_client_name: '', new_client_dni: '', new_client_phone: ''
      });
      setShowModal(true);
  };

  // ------------------------------------------------------------------
  // 4. GUARDAR CITA (Con Timezone Fix)
  // ------------------------------------------------------------------
  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!token) return;
      
      try {
          // Construir fecha ISO combinando día y hora
          const dateTimeString = `${formData.fecha}T${formData.hora}`;
          const fechaHora = new Date(dateTimeString);

          const payload: any = {
              doctor_id: parseInt(formData.doctor_id),
              fecha_hora: fechaHora.toISOString(),
              duracion_minutos: formData.duracion,
              estado: formData.estado,
              descripcion: formData.descripcion,
              // ⚠️ FIX CRÍTICO: Enviamos la zona horaria del navegador
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          };

          if (formData.isNewClient) {
              payload.new_client_name = formData.new_client_name;
              payload.new_client_dni = formData.new_client_dni;
              payload.new_client_telefono = formData.new_client_phone;
          } else {
              payload.cliente_id = parseInt(formData.cliente_id);
          }

          const url = modalMode === 'create' ? '/citas' : `/citas/${editingCita?.id}`;
          const method = modalMode === 'create' ? 'POST' : 'PATCH';

          await authFetch(url, {
              method,
              body: JSON.stringify(payload)
          });

          setShowModal(false);
          fetchData(); // Recargar agenda

      } catch (err: any) {
          alert("Error al guardar: " + err.message);
      }
  };

  const handleDelete = async () => {
      if (!editingCita || !confirm("¿Eliminar esta cita?")) return;
      try {
          await authFetch(`/citas/${editingCita.id}`, { method: 'DELETE' });
          setShowModal(false);
          fetchData();
      } catch (e: any) { alert(e.message); }
  };

  // ------------------------------------------------------------------
  // RENDERIZADO
  // ------------------------------------------------------------------

  if (configError) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500">{configError}</div>;
  if (loading && !config) return <div className="min-h-screen bg-black flex items-center justify-center text-[#00ff9f]">Cargando Clínica...</div>;

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white font-sans pb-10">
      <Navbar />

      <div className="pt-24 px-4 max-w-[1600px] mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-80px)]">
        
        {/* SIDEBAR DE NAVEGACIÓN */}
        <GlassCard className="w-full md:w-64 flex-shrink-0 flex flex-col p-4 gap-2 h-full">
            <div className="mb-6 px-2">
                <h2 className="text-xl font-bold text-[#00ff9f]">Panel Clínica</h2>
                <p className="text-xs text-gray-500">Gestión Inteligente</p>
            </div>
            
            <button onClick={() => setActiveTab('agenda')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'agenda' ? 'bg-[#00ff9f]/10 text-[#00ff9f] border border-[#00ff9f]/20' : 'text-gray-400 hover:bg-white/5'}`}>
                <Calendar size={20} /> <span className="font-medium">Agenda</span>
            </button>
            <button onClick={() => setActiveTab('pacientes')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'pacientes' ? 'bg-[#00ff9f]/10 text-[#00ff9f] border border-[#00ff9f]/20' : 'text-gray-400 hover:bg-white/5'}`}>
                <Users size={20} /> <span className="font-medium">Pacientes</span>
            </button>
            <button onClick={() => setActiveTab('doctores')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'doctores' ? 'bg-[#00ff9f]/10 text-[#00ff9f] border border-[#00ff9f]/20' : 'text-gray-400 hover:bg-white/5'}`}>
                <User size={20} /> <span className="font-medium">Doctores</span>
            </button>
        </GlassCard>

        {/* ÁREA PRINCIPAL */}
        <GlassCard className="flex-1 overflow-hidden flex flex-col relative p-0">
            
            {/* VISTA: AGENDA */}
            {activeTab === 'agenda' && (
                <div className="flex flex-col h-full">
                    {/* Header Agenda */}
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="p-2 hover:bg-white/10 rounded-lg"><ChevronLeft /></button>
                            <h2 className="text-xl font-semibold capitalize w-64 text-center">
                                {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
                            </h2>
                            <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 hover:bg-white/10 rounded-lg"><ChevronRight /></button>
                        </div>
                        
                        <div className="flex gap-3">
                            <select 
                                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00ff9f] outline-none"
                                value={selectedDoctorId}
                                onChange={(e) => setSelectedDoctorId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            >
                                <option value="all">Todos los profesionales</option>
                                {doctores.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                            </select>
                            <button 
                                onClick={() => { setModalMode('create'); setShowModal(true); }}
                                className="bg-[#00ff9f] text-black font-semibold px-4 py-2 rounded-lg hover:bg-[#00cc80] flex items-center gap-2"
                            >
                                <Plus size={18} /> Cita
                            </button>
                        </div>
                    </div>

                    {/* Grilla de Turnos */}
                    <div className="flex-1 overflow-y-auto relative">
                        <div className="flex min-w-full">
                            {/* Columna Horas */}
                            <div className="w-16 flex-shrink-0 bg-[#0D0D0F] sticky left-0 z-10 border-r border-white/10">
                                <div className="h-12 border-b border-white/10"></div>
                                {timeSlots.map(hour => (
                                    <div key={hour} className="h-24 border-b border-white/5 text-xs text-gray-500 flex justify-center pt-2">
                                        {hour}:00
                                    </div>
                                ))}
                            </div>

                            {/* Columnas Doctores */}
                            <div className="flex flex-1">
                                {doctores
                                    .filter(d => selectedDoctorId === 'all' || d.id === selectedDoctorId)
                                    .map(doc => (
                                    <div key={doc.id} className="flex-1 min-w-[200px] border-r border-white/5 relative">
                                        {/* Cabecera Doctor */}
                                        <div className="h-12 sticky top-0 bg-[#151518] border-b border-white/10 flex items-center justify-center font-medium text-[#00ff9f] z-10 shadow-sm">
                                            {doc.nombre}
                                        </div>

                                        {/* Celdas de Tiempo */}
                                        <div className="relative">
                                            {/* Fondo de la grilla */}
                                            {timeSlots.map(hour => (
                                                <div key={hour} 
                                                     className="h-24 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group relative"
                                                     onClick={() => handleGridClick(doc.id, hour)}
                                                >
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none text-[#00ff9f]">+</div>
                                                </div>
                                            ))}

                                            {/* Citas Renderizadas (Posicionamiento Absoluto) */}
                                            {getAppointmentsForDoc(doc.id).map(cita => {
                                                const citaDate = new Date(cita.fecha_hora);
                                                if (!isSameDay(citaDate, currentDate)) return null;

                                                const startHour = citaDate.getHours();
                                                const startMin = citaDate.getMinutes();
                                                
                                                // Cálculo de posición (asumiendo que empieza a las 8:00 AM)
                                                const minutesFromStart = (startHour - 8) * 60 + startMin;
                                                const pixelsPerMinute = 96 / 60; // 96px (h-24) es 1 hora
                                                const top = minutesFromStart * pixelsPerMinute;
                                                const height = cita.duracion_minutos * pixelsPerMinute;

                                                return (
                                                    <div 
                                                        key={cita.id}
                                                        onClick={(e) => handleEditClick(e, cita)}
                                                        className="absolute left-1 right-1 rounded-md p-2 text-xs cursor-pointer hover:brightness-110 transition-all z-10 overflow-hidden border-l-4 shadow-lg"
                                                        style={{ 
                                                            top: `${top}px`, 
                                                            height: `${height}px`,
                                                            backgroundColor: `${doc.color}33`, // Color con transparencia
                                                            borderColor: doc.color
                                                        }}
                                                    >
                                                        <p className="font-bold text-white truncate">{cita.cliente?.nombre || 'Cliente'}</p>
                                                        <p className="text-gray-300">{format(citaDate, 'HH:mm')} - {cita.estado}</p>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* PLACEMAKERS PARA OTRAS TABS (Puedes expandirlas luego) */}
            {activeTab === 'pacientes' && <div className="p-8 text-center text-gray-500">Tabla de Pacientes (Implementar aquí)</div>}
            {activeTab === 'doctores' && <div className="p-8 text-center text-gray-500">Gestión de Doctores (Implementar aquí)</div>}

        </GlassCard>
      </div>

      {/* --- MODAL DE NUEVA/EDITAR CITA --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="w-full max-w-lg bg-[#1a1c20] border border-gray-700 relative animate-in fade-in zoom-in-95">
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
                
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    {modalMode === 'create' ? <><Plus className="text-[#00ff9f]"/> Nueva Cita</> : 'Editar Cita'}
                </h3>

                <form onSubmit={handleSave} className="space-y-4">
                    {/* Selector de Paciente */}
                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                        <div className="flex gap-4 mb-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={!formData.isNewClient} onChange={() => setFormData({...formData, isNewClient: false})} className="accent-[#00ff9f]" />
                                <span className="text-sm">Paciente Existente</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={formData.isNewClient} onChange={() => setFormData({...formData, isNewClient: true})} className="accent-[#00ff9f]" />
                                <span className="text-sm">Nuevo Paciente</span>
                            </label>
                        </div>

                        {!formData.isNewClient ? (
                             <select 
                                className="w-full bg-[#0D0D0F] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00ff9f]"
                                value={formData.cliente_id}
                                onChange={e => setFormData({...formData, cliente_id: e.target.value})}
                                required
                             >
                                <option value="">Seleccionar paciente...</option>
                                {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} - {p.dni}</option>)}
                             </select>
                        ) : (
                            <div className="space-y-2">
                                <input placeholder="Nombre Completo" className="w-full bg-[#0D0D0F] border border-white/10 rounded-lg p-2" required value={formData.new_client_name} onChange={e => setFormData({...formData, new_client_name: e.target.value})} />
                                <div className="flex gap-2">
                                    <input placeholder="DNI" className="w-1/2 bg-[#0D0D0F] border border-white/10 rounded-lg p-2" required value={formData.new_client_dni} onChange={e => setFormData({...formData, new_client_dni: e.target.value})} />
                                    <input placeholder="Teléfono" className="w-1/2 bg-[#0D0D0F] border border-white/10 rounded-lg p-2" required value={formData.new_client_phone} onChange={e => setFormData({...formData, new_client_phone: e.target.value})} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detalles Cita */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Doctor</label>
                            <select className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white" value={formData.doctor_id} onChange={e => setFormData({...formData, doctor_id: e.target.value})} required>
                                <option value="">Seleccionar...</option>
                                {doctores.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Fecha</label>
                            <input type="date" className="w-full bg-black/30 border border-white/10 rounded-lg p-2" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Hora</label>
                            <input type="time" className="w-full bg-black/30 border border-white/10 rounded-lg p-2" value={formData.hora} onChange={e => setFormData({...formData, hora: e.target.value})} required />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Duración (min)</label>
                            <input type="number" className="w-full bg-black/30 border border-white/10 rounded-lg p-2" value={formData.duracion} onChange={e => setFormData({...formData, duracion: parseInt(e.target.value)})} />
                        </div>
                        <div>
                             <label className="text-xs text-gray-400 mb-1 block">Estado</label>
                             <select className="w-full bg-black/30 border border-white/10 rounded-lg p-2" value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value as any})}>
                                <option value="programada">Programada</option>
                                <option value="confirmada">Confirmada</option>
                                <option value="cancelada">Cancelada</option>
                                <option value="completada">Completada</option>
                             </select>
                        </div>
                    </div>

                    <textarea 
                        placeholder="Notas o descripción..." 
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 h-20 resize-none outline-none focus:border-[#00ff9f]"
                        value={formData.descripcion}
                        onChange={e => setFormData({...formData, descripcion: e.target.value})}
                    />

                    <div className="flex justify-between pt-4 border-t border-white/10">
                        {modalMode === 'edit' ? (
                            <button type="button" onClick={handleDelete} className="text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg flex items-center gap-2"><Trash2 size={18}/> Eliminar</button>
                        ) : <div></div>}
                        
                        <button type="submit" className="bg-[#00ff9f] text-black font-bold px-6 py-2 rounded-lg hover:bg-[#00cc80] flex items-center gap-2">
                            <Save size={18} /> {modalMode === 'create' ? 'Agendar' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </GlassCard>
        </div>
      )}

    </div>
  );
};