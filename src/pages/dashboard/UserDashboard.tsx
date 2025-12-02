import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { GlassCard } from '../../components/ui/GlassCard';
import { Loader2, Search, LogOut, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient'; // Cliente Auth del Master

// Componentes
import { PatientCard } from '../../features/patients/PatientCard';
import { ChatViewer } from '../../features/chat/ChatViewer';
import { useStorage } from '../../hooks/useStorage';
import { useRealtime } from '../../hooks/useRealtime';

// URLs proporcionadas
const MASTER_API = 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host';
const SATELLITE_API = 'https://webs-de-vintex-bakend-de-clinica.1kh9sk.easypanel.host';

export const UserDashboard = () => {
  // Estado Global
  const [session, setSession] = useState<any>(null);
  const [config, setConfig] = useState<any>(null); // Datos de conexión DB Clínica (para Realtime)
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<{title: string, msg: string} | null>(null);
  
  // Datos
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [citas, setCitas] = useState<any[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'agenda' | 'pacientes'>('agenda');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [modalType, setModalType] = useState<'chat' | 'files' | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [patientFiles, setPatientFiles] = useState<any[]>([]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('vintex_session');
    localStorage.removeItem('vintex_user');
    window.location.href = '/login';
  };

  // --- 1. FETCH AL SATÉLITE (Con Token del Master) ---
  const satelliteFetch = useCallback(async (endpoint: string, opts: any = {}) => {
      // Necesitamos el token para que el satélite sepa quiénes somos
      if (!session?.access_token) return;
      
      try {
        const res = await fetch(`${SATELLITE_API}/api${endpoint}`, {
            ...opts,
            headers: { 
                ...opts.headers, 
                // ENVIAMOS EL TOKEN DEL MASTER
                'Authorization': `Bearer ${session.access_token}`, 
                'Content-Type': 'application/json' 
            }
        });
        
        if (res.status === 401 || res.status === 403) {
             console.warn("Sesión expirada. Saliendo...");
             handleLogout();
             return;
        }
        
        if (!res.ok) throw new Error(`Error Satélite: ${res.statusText}`);
        return res.json();
      } catch (e) {
        console.error(`Error Satélite (${endpoint}):`, e);
        return null;
      }
  }, [session]);

  const { uploadFile, uploading } = useStorage(satelliteFetch);

  // --- 2. INICIALIZACIÓN ---
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setErrorState(null);

      // A. Obtener Sesión Actual (Supabase Master)
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
         if (mounted) window.location.href = '/login';
         return;
      }

      if(mounted) setSession(data.session);

      // B. Obtener Configuración de Clínica (Solo para usar useRealtime)
      // El fetch de datos normales va al satélite, pero para sockets necesitamos las credenciales
      try {
        const res = await fetch(`${MASTER_API}/api/config/init-session`, {
            headers: { 'Authorization': `Bearer ${data.session.access_token}` }
        });
        
        if (!res.ok) throw new Error("Error conectando con Central");
        const cfg = await res.json();
        
        if (!cfg.hasClinic) {
            throw new Error("No tienes una clínica asignada. Contacta a soporte.");
        }

        if (mounted) setConfig(cfg);

      } catch (e: any) {
        console.error(e);
        if (mounted) setErrorState({ title: "Error de Cuenta", msg: e.message });
      }
    };

    init();
    return () => { mounted = false; };
  }, []);

  // --- 3. CARGAR DATOS ---
  const loadData = useCallback(async () => {
      if (!session) return;
      
      if (pacientes.length === 0) setLoading(true);

      try {
          const [initData, citasData] = await Promise.all([
              satelliteFetch('/initial-data'),
              satelliteFetch('/citas')
          ]);

          if (initData) setPacientes(initData.clientes || []);
          if (citasData) setCitas(citasData || []);
          
      } catch (error) { 
          console.error(error); 
      } finally { 
          setLoading(false); 
      }
  }, [satelliteFetch, session, pacientes.length]);

  // Cargar al tener sesión
  useEffect(() => { 
      if(session) loadData(); 
  }, [session, loadData]);

  // Activar Sockets (Realtime) directo a la DB de la clínica
  useRealtime(config, loadData);

  // --- HANDLERS UI ---
  const handleToggleBot = async (patient: any) => {
    const newStatus = !patient.activo;
    setPacientes(prev => prev.map(p => p.id === patient.id ? {...p, activo: newStatus} : p));
    await satelliteFetch(`/clientes/${patient.id}`, { method: 'PATCH', body: JSON.stringify({ activo: newStatus }) });
  };

  const handleOpenChat = async (patient: any) => {
    setSelectedPatient(patient);
    setModalType('chat');
    setChatMessages([]); 
    const history = await satelliteFetch(`/chat-history/${patient.telefono}`);
    if (history) setChatMessages(history);
  };

  const handleOpenFiles = async (patient: any) => {
    setSelectedPatient(patient);
    setModalType('files');
    setPatientFiles([]); 
    const files = await satelliteFetch(`/files/${patient.id}`);
    if (files) setPatientFiles(files);
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if(!file || !selectedPatient) return;
    const success = await uploadFile(file, selectedPatient.id);
    if(success) {
        const files = await satelliteFetch(`/files/${selectedPatient.id}`);
        if (files) setPatientFiles(files);
    }
  };

  // VISTAS DE ERROR Y CARGA
  if (errorState) {
      return (
        <div className="min-h-screen bg-tech-black flex flex-col items-center justify-center text-white gap-6 p-4">
            <div className="bg-red-500/10 border border-red-500/50 p-8 rounded-2xl max-w-md text-center shadow-2xl">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">{errorState.title}</h2>
                <p className="text-gray-400 mb-6">{errorState.msg}</p>
                <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg transition-colors font-bold mx-auto"><LogOut size={18} /> Salir</button>
            </div>
        </div>
      );
  }

  if (loading) {
      return (
        <div className="min-h-screen bg-tech-black flex flex-col items-center justify-center text-neon-main gap-4">
            <Loader2 className="animate-spin w-12 h-12" />
            <p className="text-gray-500 text-sm font-mono animate-pulse">Sincronizando satélite...</p>
        </div>
      );
  }

  // DASHBOARD PRINCIPAL
  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white pt-24 pb-10 px-6 font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 h-[85vh]">
        
        {/* SIDEBAR */}
        <GlassCard className="col-span-1 flex flex-col gap-2 h-full">
           <div className="mb-4 px-4">
               <h3 className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-1">Clínica</h3>
               <p className="text-white font-display truncate">{session?.user?.user_metadata?.full_name || 'Usuario'}</p>
           </div>
           <button onClick={() => setActiveTab('agenda')} className={`p-4 rounded-xl text-left font-bold transition-all ${activeTab === 'agenda' ? 'bg-neon-main text-black' : 'text-gray-400 hover:bg-white/5'}`}>Agenda</button>
           <button onClick={() => setActiveTab('pacientes')} className={`p-4 rounded-xl text-left font-bold transition-all ${activeTab === 'pacientes' ? 'bg-neon-main text-black' : 'text-gray-400 hover:bg-white/5'}`}>Pacientes</button>
           <div className="mt-auto border-t border-white/10 pt-4">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-bold"><LogOut size={16} /> Cerrar Sesión</button>
           </div>
        </GlassCard>

        {/* CONTENIDO PRINCIPAL */}
        <GlassCard className="col-span-3 h-full overflow-hidden flex flex-col relative !p-0">
            {activeTab === 'agenda' && (
                <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Agenda Inteligente</h2>
                        <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm transition-colors" onClick={loadData}><RefreshCw size={14}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {citas.length === 0 ? <p className="text-gray-500 text-center py-20">No hay citas agendadas.</p> : 
                         citas.map((cita: any) => (
                            <div key={cita.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-neon-main/30 transition-colors">
                                <div>
                                    <p className="text-neon-main font-mono text-xs">{new Date(cita.fecha_hora).toLocaleString()}</p>
                                    <p className="font-bold text-white">{cita.cliente?.nombre || 'Desconocido'}</p>
                                    <p className="text-xs text-gray-400">{cita.doctor?.nombre}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${cita.estado === 'confirmada' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                    {cita.estado}
                                </span>
                            </div>
                         ))
                        }
                    </div>
                </div>
            )}
            {activeTab === 'pacientes' && (
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-white/10 bg-tech-card/50">
                        <div className="relative"><Search className="absolute left-3 top-3 text-gray-500" size={18} /><input className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 text-sm text-white focus:border-neon-main outline-none" placeholder="Buscar paciente..." /></div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-3">
                        {pacientes.length === 0 ? <p className="text-center text-gray-500 py-10">No se encontraron pacientes.</p> : pacientes.map(p => (
                            <PatientCard key={p.id} patient={p} actions={{ toggleBot: handleToggleBot, openChat: handleOpenChat, openFiles: handleOpenFiles }} />
                        ))}
                    </div>
                </div>
            )}
        </GlassCard>
      </div>

      {/* MODAL GLOBAL (Chat/Archivos) */}
      {modalType && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModalType(null)}>
            <div className="bg-[#1a1c20] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-tech-card">
                    <h3 className="font-bold text-white flex items-center gap-2">{modalType === 'chat' ? '💬 Historial' : '📂 Archivos'}<span className="text-gray-500 text-sm font-normal">| {selectedPatient?.nombre}</span></h3>
                    <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                <div className="p-0 bg-[#0F0F0F]">
                    {modalType === 'chat' && <ChatViewer messages={chatMessages} />}
                    {modalType === 'files' && (
                        <div className="p-6">
                            <div className="mb-6 flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/5 border-dashed">
                                <label className={`cursor-pointer flex items-center gap-2 bg-neon-main text-black font-bold px-4 py-2 rounded-lg hover:bg-neon-dark transition-all ${uploading ? 'opacity-50' : ''}`}>
                                    {uploading ? <Loader2 className="animate-spin" size={18}/> : 'Subir Archivo'}<input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                </label>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {patientFiles.map((f: any) => (<div key={f.id} className="flex justify-between p-3 bg-white/5 rounded-lg border border-white/5"><span className="text-sm text-gray-300">{f.file_name}</span><button className="text-neon-main text-xs font-bold">DESCARGAR</button></div>))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};