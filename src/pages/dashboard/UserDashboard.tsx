import React, { useState, useEffect, useCallback } from 'react';
// CORRECCIÓN: Usamos 'Stethoscope' en lugar de 'UserMd'
import { Calendar, Users, Stethoscope, BarChart2, LogOut, Menu } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { AgendaView } from './views/AgendaView';
import { PatientsView } from './views/PatientsView';
import { DoctorsView } from './views/DoctorsView';
import { MetricsView } from './views/MetricsView';
import { useRealtime } from '../../hooks/useRealtime';

const MASTER_API = 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host';
const SATELLITE_API = 'https://webs-de-vintex-bakend-de-clinica.1kh9sk.easypanel.host';

export const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'pacientes' | 'doctores' | 'metricas'>('agenda');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  
  // Datos Globales
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [doctores, setDoctores] = useState<any[]>([]);
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- LÓGICA DE CONEXIÓN ---
  const satelliteFetch = useCallback(async (endpoint: string, opts: any = {}) => {
    if (!session?.access_token) return;
    try {
      const res = await fetch(`${SATELLITE_API}/api${endpoint}`, {
        ...opts,
        headers: { 
          ...opts.headers, 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json' 
        }
      });
      if (res.status === 401) { window.location.href = '/login'; return; }
      return res.json();
    } catch (e) { console.error(e); return null; }
  }, [session]);

  const loadData = useCallback(async () => {
    if (!session) return;
    try {
      const [initData, citasData] = await Promise.all([
        satelliteFetch('/initial-data'),
        satelliteFetch('/citas')
      ]);
      if (initData) {
        setPacientes(initData.clientes || []);
        setDoctores(initData.doctores || []);
      }
      if (citasData) setCitas(citasData);
    } finally { setLoading(false); }
  }, [satelliteFetch, session]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { window.location.href = '/login'; return; }
      setSession(data.session);
      
      const res = await fetch(`${MASTER_API}/api/config/init-session`, {
         headers: { 'Authorization': `Bearer ${data.session.access_token}` }
      });
      if (res.ok) setConfig(await res.json());
    };
    init();
  }, []);

  useEffect(() => { if (session) loadData(); }, [session, loadData]);
  useRealtime(config, loadData);

  // --- RENDERIZADO ---
  if (loading) return (
    <div className="min-h-screen bg-tech-bg flex items-center justify-center text-neon-main gap-4">
      <div className="w-12 h-12 border-4 border-tech-card border-t-neon-main rounded-full animate-spin"></div>
      <p className="font-mono animate-pulse">Cargando Vintex OS...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-tech-bg overflow-hidden font-sans text-gray-200">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-tech-card border-r border-gray-800 transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-800 text-center">
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <span className="text-neon-main text-3xl">⚡</span> Vintex
          </h1>
        </div>
        
        <nav className="p-4 space-y-2">
          <SidebarItem icon={Calendar} label="Agenda" active={activeTab === 'agenda'} onClick={() => { setActiveTab('agenda'); setSidebarOpen(false); }} />
          <SidebarItem icon={Users} label="Pacientes" active={activeTab === 'pacientes'} onClick={() => { setActiveTab('pacientes'); setSidebarOpen(false); }} />
          {/* CORRECCIÓN: Usamos Stethoscope aquí */}
          <SidebarItem icon={Stethoscope} label="Doctores" active={activeTab === 'doctores'} onClick={() => { setActiveTab('doctores'); setSidebarOpen(false); }} />
          <SidebarItem icon={BarChart2} label="Métricas" active={activeTab === 'metricas'} onClick={() => { setActiveTab('metricas'); setSidebarOpen(false); }} />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <button onClick={() => { supabase.auth.signOut(); window.location.href = '/login'; }} className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-gray-800">
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* OVERLAY MÓVIL */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="md:hidden flex items-center justify-between p-4 bg-tech-card border-b border-gray-800">
          <button onClick={() => setSidebarOpen(true)} className="text-white"><Menu /></button>
          <span className="font-bold text-white">Vintex Clinic</span>
          <div className="w-6" /> 
        </div>

        <div className="flex-1 overflow-auto bg-tech-bg p-4 md:p-6 relative">
          {activeTab === 'agenda' && (
            <AgendaView 
              citas={citas} 
              doctores={doctores} 
              clientes={pacientes}
              satelliteFetch={satelliteFetch} 
              reload={loadData} 
            />
          )}
          {activeTab === 'pacientes' && (
            <PatientsView 
              pacientes={pacientes} 
              citas={citas}
              satelliteFetch={satelliteFetch} 
              reload={loadData}
            />
          )}
          {activeTab === 'doctores' && (
            <DoctorsView 
              doctores={doctores} 
              satelliteFetch={satelliteFetch} 
              reload={loadData} 
            />
          )}
          {activeTab === 'metricas' && (
            <MetricsView citas={citas} pacientes={pacientes} doctores={doctores} />
          )}
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border-l-4 ${active ? 'bg-[#1a1c20] text-white border-neon-main shadow-[0_0_10px_rgba(0,255,159,0.1)]' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}
  >
    <Icon size={20} className={active ? 'text-neon-main' : ''} />
    <span className="font-medium">{label}</span>
  </button>
);