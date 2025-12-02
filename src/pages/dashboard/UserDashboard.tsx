import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { GlassCard } from '../../components/ui/GlassCard';
import { Loader2, Search, LogOut, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

// Importar Componentes
import { PatientCard } from '../../features/patients/PatientCard';
import { ChatViewer } from '../../features/chat/ChatViewer';
import { useStorage } from '../../hooks/useStorage';
import { useRealtime } from '../../hooks/useRealtime';

const MASTER_API = import.meta.env.DEV 
  ? '' 
  : (import.meta.env.VITE_API_BASE_URL || 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host');

export const UserDashboard = () => {
  // Estado Global
  const [config, setConfig] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<{title: string, msg: string} | null>(null);
  
  // Datos
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [citas, setCitas] = useState<any[]>([]);
  
  // Estado UI
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

  // 1. Lógica de Inicialización Blindada
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setErrorState(null);

      // PASO 1: Manejo de OAuth (Google)
      // Detectamos si hay un hash en la URL (indicador de que volvemos de Google)
      const isOAuthRedirect = window.location.hash && window.location.hash.includes('access_token');
      
      let currentSession = null;

      if (isOAuthRedirect) {
        console.log("🔄 Procesando retorno de Google...");
        // Esperamos a que Supabase procese el hash
        const { data } = await supabase.auth.getSession();
        currentSession = data.session;
        // Limpiamos el hash de la URL para que quede limpia
        window.history.replaceState(null, '', window.location.pathname);
      } else {
        // Si no es redirect, intentamos recuperar la sesión normal
        const stored = localStorage.getItem('vintex_session');
        if (stored) {
            try {
                currentSession = JSON.parse(stored);
            } catch (e) { console.error("Sesión corrupta"); }
        }
      }

      // Si después de todo no hay sesión, al login
      if (!currentSession || !currentSession.access_token) {
         console.log("❌ No se encontró sesión válida. Redirigiendo.");
         if (mounted) window.location.href = '/login';
         return;
      }

      // Guardamos/Actualizamos la sesión segura
      localStorage.setItem('vintex_session', JSON.stringify(currentSession));
      localStorage.setItem('vintex_user', JSON.stringify(currentSession.user));
      
      const tk = currentSession.access_token;
      if (mounted) setToken(tk);

      // PASO 2: Conexión al Master
      try {
        console.log("🔗 Conectando a Master con token...");
        const res = await fetch(`${MASTER_API}/api/config/init-session`, {
            headers: { 'Authorization': `Bearer ${tk}` }
        });
        
        if (res.status === 401 || res.status === 403) {
            console.warn("⚠️ Token rechazado por Master");
            handleLogout();
            return;
        }
        
        if (!res.ok) throw new Error(`Error ${res.status} del Servidor Master`);
        
        const cfg = await res.json();
        if (mounted) setConfig(cfg);
        
      } catch (e: any) { 
        console.error("❌ Error crítico:", e);
        if (mounted) {
            setErrorState({
                title: "Error de Conexión",
                msg: "No se pudo conectar con tu clínica. " + (e.message || "")
            });
            setLoading(false);
        }
      }
    };

    init();

    return () => { mounted = false; };
  }, []);

  // Fetch Wrapper
  const satelliteFetch = useCallback(async (endpoint: string, opts: any = {}) => {
      if (!config || !token) return;
      const baseUrl = config.backendUrl.replace(/\/$/, ""); 
      try {
        const res = await fetch(`${baseUrl}/api${endpoint}`, {
            ...opts,
            headers: { ...opts.headers, 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (res.status === 401) { handleLogout(); return; }
        return res.json();
      } catch (e) {
        console.error(`Error Satélite (${endpoint}):`, e);
        return [];
      }
  }, [config, token]);

  const { uploadFile, uploading } = useStorage(satelliteFetch);

  // Carga de Datos
  const loadData = useCallback(async () => {
      if (!config) return;
      setLoading(true);
      try {
          const [initData, citasData] = await Promise.all([
              satelliteFetch('/initial-data'),
              satelliteFetch('/citas')
          ]);
          if (initData) setPacientes(initData.clientes || []);
          if (citasData) setCitas(citasData || []);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
  }, [satelliteFetch, config]);

  useEffect(() => { if(config) loadData(); }, [config, loadData]);
  useRealtime(config, loadData);

  // Handlers
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
    setChatMessages(history || []);
  };

  const handleOpenFiles = async (patient: any) => {
    setSelectedPatient(patient);
    setModalType('files');
    setPatientFiles([]); 
    const files = await satelliteFetch(`/files/${patient.id}`);
    setPatientFiles(files || []);
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if(!file || !selectedPatient) return;
    const success = await uploadFile(file, selectedPatient.id);
    if(success) {
        const files = await satelliteFetch(`/files/${selectedPatient.id}`);
        setPatientFiles(files || []);
    }
  };

  // Render Error
  if (errorState) {
      return (
        <div className="min-h-screen bg-tech-black flex flex-col items-center justify-center text-white gap-6 p-4">
            <div className="bg-red-500/10 border border-red-500/50 p-8 rounded-2xl max-w-md text-center shadow-2xl">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">{errorState.title}</h2>
                <p className="text-gray-400 mb-6">{errorState.msg}</p>
                <div className="flex gap-4 justify-center">
                    <button onClick={() => window.location.reload()} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg transition-colors"><RefreshCw size={18} /> Reintentar</button>
                    <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg transition-colors font-bold"><LogOut size={18} /> Salir</button>
                </div>
            </div>
        </div>
      );
  }

  // Render Loading
  if (loading || !config) {
      return (
        <div className="min-h-screen bg-tech-black flex flex-col items-center justify-center text-neon-main gap-4">
            <Loader2 className="animate-spin w-12 h-12" />
            <p className="text-gray-500 text-sm font-mono animate-pulse">
                {token ? "Conectando con tu clínica..." : "Validando credenciales..."}
            </p>
        </div>
      );
  }

  // Render Dashboard
  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white pt-24 pb-10 px-6 font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 h-[85vh]">
        <GlassCard className="col-span-1 flex flex-col gap-2 h-full">
           <button onClick={() => setActiveTab('agenda')} className={`p-4 rounded-xl text-left font-bold transition-all ${activeTab === 'agenda' ? 'bg-neon-main text-black' : 'text-gray-400 hover:bg-white/5'}`}>Agenda</button>
           <button onClick={() => setActiveTab('pacientes')} className={`p-4 rounded-xl text-left font-bold transition-all ${activeTab === 'pacientes' ? 'bg-neon-main text-black' : 'text-gray-400 hover:bg-white/5'}`}>Pacientes</button>
           <div className="mt-auto border-t border-white/10 pt-4">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-bold"><LogOut size={16} /> Cerrar Sesión</button>
           </div>
        </GlassCard>

        <GlassCard className="col-span-3 h-full overflow-hidden flex flex-col relative !p-0">
            {activeTab === 'agenda' && (
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Agenda Inteligente</h2>
                    <div className="grid grid-cols-5 gap-2 h-full overflow-y-auto">
                        <p className="text-gray-500 col-span-5 text-center py-20">Agenda visual en construcción...</p>
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