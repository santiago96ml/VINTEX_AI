import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Navbar } from '../../components/layout/Navbar';
import { createClient } from '@supabase/supabase-js';
import { format, addDays, subDays, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Users, User, ChevronLeft, ChevronRight, Plus, X, Save, Trash2 } from 'lucide-react';

const MASTER_API = import.meta.env.VITE_API_BASE_URL || 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host';

export const UserDashboard = () => {
  const [config, setConfig] = useState<{ backendUrl: string; supabaseUrl: string; supabaseAnonKey?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [citas, setCitas] = useState<any[]>([]);
  const [doctores, setDoctores] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // UI States
  const [activeTab, setActiveTab] = useState('agenda');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
      cliente_id: '', doctor_id: '', fecha: '', hora: '', duracion: 30, estado: 'programada', descripcion: '',
      isNewClient: false, new_client_name: '', new_client_dni: '', new_client_phone: ''
  });

  // 1. INICIALIZACIÓN: Obtener URL del Satélite desde Master
  useEffect(() => {
    const init = async () => {
      const sess = localStorage.getItem('vintex_session');
      if (!sess) return window.location.href = '/login';
      
      const parsed = JSON.parse(sess);
      const tk = parsed.access_token || parsed.token;
      setToken(tk);

      try {
        // Pedir al Master la config de mi clínica
        const res = await fetch(`${MASTER_API}/api/config/init-session`, {
            headers: { 'Authorization': `Bearer ${tk}` }
        });
        
        if (!res.ok) throw new Error('Error validando sesión');
        const cfg = await res.json();
        
        if (!cfg.hasClinic) {
            alert("No tienes una clínica asignada.");
            return;
        }

        // Guardar config del satélite
        setConfig(cfg);

      } catch (e) {
        console.error("Session Error:", e);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // 2. FETCH AL SATÉLITE
  const satelliteFetch = useCallback(async (endpoint: string, opts: RequestInit = {}) => {
      if (!config || !token) return;
      
      // Usamos config.backendUrl que viene del Master (tu URL de easypanel)
      const baseUrl = config.backendUrl.replace(/\/$/, ""); 
      
      const res = await fetch(`${baseUrl}/api${endpoint}`, {
          ...opts,
          headers: { ...opts.headers, 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
  }, [config, token]);

  // 3. CARGAR DATOS
  const loadData = useCallback(async () => {
      if (!config) return;
      try {
          const initData = await satelliteFetch('/initial-data');
          if (initData) {
              setDoctores(initData.doctores || []);
              setPacientes(initData.clientes || []);
          }
          const start = startOfDay(currentDate).toISOString();
          const end = endOfDay(currentDate).toISOString();
          const citasData = await satelliteFetch(`/citas?start=${start}&end=${end}`);
          if (citasData) setCitas(citasData);
      } catch (e) { console.error("Error loading data:", e); }
  }, [satelliteFetch, currentDate, config]);

  useEffect(() => { loadData(); }, [loadData]);

  // 4. GUARDAR
  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const fechaLocal = new Date(`${formData.fecha}T${formData.hora}`);
          const payload = {
              doctor_id: Number(formData.doctor_id),
              fecha_hora: fechaLocal.toISOString(),
              duracion_minutos: Number(formData.duracion),
              estado: formData.estado,
              descripcion: formData.descripcion,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              ...(formData.isNewClient ? {
                  new_client_name: formData.new_client_name,
                  new_client_dni: formData.new_client_dni,
                  new_client_telefono: formData.new_client_phone
              } : { cliente_id: Number(formData.cliente_id) })
          };

          const url = modalMode === 'create' ? '/citas' : `/citas/${editingId}`;
          const method = modalMode === 'create' ? 'POST' : 'PATCH';
          
          await satelliteFetch(url, { method, body: JSON.stringify(payload) });
          setShowModal(false);
          loadData();
      } catch (e) { alert("Error al guardar"); console.error(e); }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-[#00ff9f]">Conectando a tu clínica...</div>;

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white font-sans pb-10">
      <Navbar />
      <div className="pt-24 px-4 max-w-[1600px] mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-80px)]">
        
        {/* SIDEBAR */}
        <GlassCard className="w-full md:w-64 flex-shrink-0 flex flex-col p-4 gap-2 h-full">
            <div className="mb-6 px-2">
                <h2 className="text-xl font-bold text-[#00ff9f]">Panel Clínica</h2>
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                    <span className="text-xs text-gray-400">Satélite Online</span>
                </div>
            </div>
            {/* Botones de navegación... */}
            <button onClick={() => setActiveTab('agenda')} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'agenda' ? 'bg-[#00ff9f]/10 text-[#00ff9f]' : 'text-gray-400 hover:bg-white/5'}`}>
                <Calendar size={20} /> Agenda
            </button>
        </GlassCard>

        {/* CONTENIDO PRINCIPAL (AGENDA) */}
        <GlassCard className="flex-1 overflow-hidden flex flex-col relative p-0">
            {activeTab === 'agenda' && (
                <div className="flex flex-col h-full">
                    {/* Header Agenda */}
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setCurrentDate(subDays(currentDate, 1))}><ChevronLeft/></button>
                            <h2 className="text-xl font-semibold capitalize w-64 text-center">{format(currentDate, "EEEE, d MMMM", { locale: es })}</h2>
                            <button onClick={() => setCurrentDate(addDays(currentDate, 1))}><ChevronRight/></button>
                        </div>
                        <button onClick={() => { setModalMode('create'); setShowModal(true); }} className="bg-[#00ff9f] text-black px-4 py-2 rounded-lg flex gap-2 font-bold"><Plus size={18}/> Nueva Cita</button>
                    </div>

                    {/* Grilla Horaria */}
                    <div className="flex-1 overflow-y-auto flex relative">
                        <div className="w-16 bg-[#0D0D0F] border-r border-white/10 pt-12 sticky left-0 z-20">
                            {Array.from({length: 13}, (_, i) => i + 8).map(h => (
                                <div key={h} className="h-24 border-b border-white/5 text-xs text-gray-500 flex justify-center pt-2">{h}:00</div>
                            ))}
                        </div>
                        <div className="flex flex-1 min-w-0">
                            {doctores.map(doc => (
                                <div key={doc.id} className="flex-1 min-w-[200px] border-r border-white/5 relative">
                                    <div className="h-12 sticky top-0 bg-[#151518] border-b border-white/10 flex items-center justify-center text-[#00ff9f] z-10 font-medium">{doc.nombre}</div>
                                    <div className="relative">
                                        {/* Background Cells */}
                                        {Array.from({length: 13}, (_, i) => i + 8).map(h => (
                                            <div key={h} className="h-24 border-b border-white/5 hover:bg-white/5 transition-colors"/>
                                        ))}
                                        
                                        {/* Citas */}
                                        {citas.filter(c => c.doctor_id === doc.id && isSameDay(new Date(c.fecha_hora), currentDate)).map(cita => {
                                            const d = new Date(cita.fecha_hora);
                                            // Cálculo: (Hora - 8) * 60min + Minutos -> pixel scaling
                                            const minutesFromStart = (d.getHours() - 8) * 60 + d.getMinutes();
                                            const top = minutesFromStart * (96/60); // 96px por hora
                                            const height = cita.duracion_minutos * (96/60);
                                            
                                            return (
                                                <div key={cita.id} 
                                                    className="absolute left-1 right-1 rounded p-2 text-xs border-l-4 overflow-hidden hover:brightness-125 z-10 shadow-lg cursor-pointer transition-all"
                                                    style={{ top: `${top}px`, height: `${height}px`, backgroundColor: `${doc.color}33`, borderColor: doc.color }}
                                                    onClick={() => {
                                                        setEditingId(cita.id);
                                                        setModalMode('edit');
                                                        setFormData({
                                                            cliente_id: cita.cliente_id.toString(), doctor_id: cita.doctor_id.toString(),
                                                            fecha: format(d, 'yyyy-MM-dd'), hora: format(d, 'HH:mm'),
                                                            duracion: cita.duracion_minutos, estado: cita.estado, descripcion: cita.descripcion || '',
                                                            isNewClient: false, new_client_name: '', new_client_dni: '', new_client_phone: ''
                                                        });
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    <p className="font-bold truncate text-white">{cita.cliente?.nombre}</p>
                                                    <p className="text-gray-300">{format(d, 'HH:mm')}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </GlassCard>
      </div>

      {/* MODAL (Simplificado para brevedad, incluir form completo aquí) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="w-full max-w-lg bg-[#1a1c20] border-gray-700 relative animate-in zoom-in-95">
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4"><X/></button>
                <h3 className="text-2xl font-bold mb-6 text-white">{modalMode === 'create' ? 'Agendar Cita' : 'Detalles de Cita'}</h3>
                
                <form onSubmit={handleSave} className="space-y-4">
                    {/* Selectores de Cliente y Doctor... (Igual que antes pero asegurando usar los datos del estado) */}
                    <div className="grid grid-cols-2 gap-4">
                        <select className="bg-black/40 border border-white/10 rounded p-2 text-white" value={formData.doctor_id} onChange={e => setFormData({...formData, doctor_id: e.target.value})} required>
                            <option value="">Seleccionar Doctor...</option>
                            {doctores.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                        </select>
                        <input type="date" className="bg-black/40 border border-white/10 rounded p-2 text-white" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} required />
                    </div>
                    {/* Resto del formulario... */}
                    <div className="flex justify-end gap-2 pt-4">
                        {modalMode === 'edit' && <button type="button" onClick={() => { /* Handle Delete */ }} className="text-red-500 mr-auto px-4">Eliminar</button>}
                        <button type="submit" className="bg-[#00ff9f] text-black px-6 py-2 rounded font-bold">Guardar</button>
                    </div>
                </form>
            </GlassCard>
        </div>
      )}
    </div>
  );
};