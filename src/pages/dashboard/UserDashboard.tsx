import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { GlassCard } from '../../components/ui/GlassCard';
import { Loader2, Search } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Importar Componentes Nuevos
import { PatientCard } from '../../features/patients/PatientCard';
import { ChatViewer } from '../../features/chat/ChatViewer';
import { useStorage } from '../../hooks/useStorage';
import { useRealtime } from '../../hooks/useRealtime';

const MASTER_API = import.meta.env.VITE_API_BASE_URL || 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host';

export const UserDashboard = () => {
  // Estado Global
  const [config, setConfig] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Datos
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [citas, setCitas] = useState<any[]>([]);
  
  // Estado UI
  const [activeTab, setActiveTab] = useState<'agenda' | 'pacientes'>('agenda');
  const [selectedPatient, setSelectedPatient] = useState<any>(null); // Para Modales
  const [modalType, setModalType] = useState<'chat' | 'files' | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [patientFiles, setPatientFiles] = useState<any[]>([]);

  // 1. Inicialización (Igual que antes)
  useEffect(() => {
    const init = async () => {
      const sess = localStorage.getItem('vintex_session');
      if (!sess) return window.location.href = '/login';
      const tk = JSON.parse(sess).access_token;
      setToken(tk);

      try {
        const res = await fetch(`${MASTER_API}/api/config/init-session`, {
            headers: { 'Authorization': `Bearer ${tk}` }
        });
        const cfg = await res.json();
        setConfig(cfg);
      } catch (e) { console.error(e); }
    };
    init();
  }, []);

  // Fetch Wrapper
  const satelliteFetch = useCallback(async (endpoint: string, opts: any = {}) => {
      if (!config || !token) return;
      const baseUrl = config.backendUrl.replace(/\/$/, ""); 
      const res = await fetch(`${baseUrl}/api${endpoint}`, {
          ...opts,
          headers: { ...opts.headers, 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      return res.json();
  }, [config, token]);

  // Hook de Storage (Ahora disponible)
  const { uploadFile, uploading } = useStorage(satelliteFetch);

  // Carga de Datos
  const loadData = useCallback(async () => {
      if (!config) return;
      setLoading(true);
      try {
          const initData = await satelliteFetch('/initial-data');
          setPacientes(initData.clientes || []);
          const citasData = await satelliteFetch('/citas'); // Simplificado para el ejemplo
          setCitas(citasData || []);
      } finally { setLoading(false); }
  }, [satelliteFetch, config]);

  useEffect(() => { loadData(); }, [loadData]);

  // Hook Realtime (Auto-recarga)
  useRealtime(config, loadData);

  // --- ACCIONES DE PACIENTES ---

  const handleToggleBot = async (patient: any) => {
    // Optimistic UI Update
    const newStatus = !patient.activo;
    const updated = pacientes.map(p => p.id === patient.id ? {...p, activo: newStatus} : p);
    setPacientes(updated);

    await satelliteFetch(`/clientes/${patient.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ activo: newStatus })
    });
  };

  const handleOpenChat = async (patient: any) => {
    setSelectedPatient(patient);
    setModalType('chat');
    setChatMessages([]); // Limpiar previo
    const history = await satelliteFetch(`/chat-history/${patient.telefono}`);
    setChatMessages(history || []);
  };

  const handleOpenFiles = async (patient: any) => {
    setSelectedPatient(patient);
    setModalType('files');
    const files = await satelliteFetch(`/files/${patient.id}`);
    setPatientFiles(files || []);
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if(!file || !selectedPatient) return;
    
    const success = await uploadFile(file, selectedPatient.id);
    if(success) {
        // Recargar lista de archivos
        const files = await satelliteFetch(`/files/${selectedPatient.id}`);
        setPatientFiles(files || []);
    }
  };

  if (!config) return <div className="min-h-screen bg-tech-black flex items-center justify-center text-neon-main"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white pt-24 pb-10 px-6 font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 h-[85vh]">
        
        {/* SIDEBAR */}
        <GlassCard className="col-span-1 flex flex-col gap-2 h-full">
           <button onClick={() => setActiveTab('agenda')} className={`p-4 rounded-xl text-left font-bold ${activeTab === 'agenda' ? 'bg-neon-main text-black' : 'text-gray-400 hover:bg-white/5'}`}>
             Agenda
           </button>
           <button onClick={() => setActiveTab('pacientes')} className={`p-4 rounded-xl text-left font-bold ${activeTab === 'pacientes' ? 'bg-neon-main text-black' : 'text-gray-400 hover:bg-white/5'}`}>
             Pacientes
           </button>
        </GlassCard>

        {/* MAIN CONTENT */}
        <GlassCard className="col-span-3 h-full overflow-hidden flex flex-col relative !p-0">
            
            {/* VISTA AGENDA (Placeholder) */}
            {activeTab === 'agenda' && (
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Agenda Inteligente</h2>
                    <div className="grid grid-cols-5 gap-2 h-full overflow-y-auto">
                        {/* Aquí iría tu componente AgendaGrid complejo */}
                        <p className="text-gray-500 col-span-5 text-center py-20">Agenda visual en construcción...</p>
                    </div>
                </div>
            )}

            {/* VISTA PACIENTES */}
            {activeTab === 'pacientes' && (
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-white/10 bg-tech-card/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                            <input className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 text-sm text-white focus:border-neon-main outline-none" placeholder="Buscar paciente..." />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-3">
                        {pacientes.map(p => (
                            <PatientCard 
                                key={p.id} 
                                patient={p} 
                                actions={{
                                    toggleBot: handleToggleBot,
                                    openChat: handleOpenChat,
                                    openFiles: handleOpenFiles
                                }} 
                            />
                        ))}
                    </div>
                </div>
            )}

        </GlassCard>
      </div>

      {/* MODAL GLOBAL (Chat / Files) */}
      {modalType && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModalType(null)}>
            <div className="bg-[#1a1c20] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-tech-card">
                    <h3 className="font-bold text-white">
                        {modalType === 'chat' ? `Chat: ${selectedPatient?.nombre}` : `Archivos: ${selectedPatient?.nombre}`}
                    </h3>
                    <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="p-0">
                    {modalType === 'chat' && <ChatViewer messages={chatMessages} />}
                    
                    {modalType === 'files' && (
                        <div className="p-6">
                            <div className="mb-6 flex gap-4 items-center">
                                <label className="cursor-pointer bg-neon-main text-black font-bold px-4 py-2 rounded-lg hover:bg-neon-dark transition-colors">
                                    {uploading ? 'Subiendo...' : 'Subir Archivo'}
                                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                </label>
                                <span className="text-xs text-gray-500">PDF, JPG, PNG (Max 10MB)</span>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {patientFiles.map((f: any) => (
                                    <div key={f.id} className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/5">
                                        <span className="text-sm truncate max-w-xs">{f.file_name}</span>
                                        <a href="#" className="text-neon-main text-xs hover:underline">Descargar</a>
                                    </div>
                                ))}
                                {patientFiles.length === 0 && <p className="text-gray-500 text-center">Sin archivos adjuntos.</p>}
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