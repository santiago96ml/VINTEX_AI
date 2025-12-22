import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar as CalendarIcon, Settings, 
  Menu, LogOut, Bell, Package, Activity, ChevronRight, X 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { clearApiConfig } from '../../lib/api'; 
import { Button } from '@/components/ui/button';

// Vistas
import { MetricsView } from './views/MetricsView';
import { PatientsView } from './views/PatientsView';
import { DoctorsView } from './views/DoctorsView';
import { AgendaView } from './views/AgendaView';

interface UIConfig {
  theme?: any;
  modules?: string[];
  tables?: Record<string, string>;
}

export const UserDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // Menú nativo
  const [config, setConfig] = useState<UIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login'); return; }

        const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
        setUserProfile(profile);

        const { data: webConfig } = await supabase
          .from('web_clinica')
          .select('ui_config')
          .eq('ID_USER', user.id)
          .maybeSingle();

        if (webConfig?.ui_config) {
          setConfig(webConfig.ui_config);
        } else {
          setConfig({ tables: { patients: 'pacientes', doctors: 'doctores' } }); 
        }
      } catch (e) {
        console.error("Error loading dashboard", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearApiConfig();
    navigate('/login');
  };

  const getTableName = (key: string) => config?.tables?.[key] || `app_${key}`;

  const renderContent = () => {
    if (loading) return <div className="flex items-center justify-center h-full text-neon-main animate-pulse">Cargando sistema...</div>;

    switch (activeView) {
      case 'overview': return <MetricsView />;
      case 'patients': return <PatientsView tableName={getTableName('patients')} />;
      case 'doctors': return <DoctorsView tableName={getTableName('doctors')} />;
      case 'agenda': return <AgendaView tableName={getTableName('appointments')} />;
      case 'inventory': return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <Package size={48} className="mb-4 opacity-50"/>
          <p>Módulo de Inventario (Tabla: {getTableName('inventory')})</p>
        </div>
      );
      default: return <MetricsView />;
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Panel General', icon: LayoutDashboard },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'doctors', label: 'Doctores', icon: Activity },
    { id: 'agenda', label: 'Agenda', icon: CalendarIcon },
    { id: 'inventory', label: 'Inventario', icon: Package },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-gray-100 font-sans overflow-hidden">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-main to-emerald-600 shadow-[0_0_15px_rgba(0,229,153,0.3)]" />
          <span className="font-bold text-lg tracking-tight">Vintex OS</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${activeView === item.id 
                  ? 'bg-neon-main/10 text-neon-main shadow-[0_0_20px_rgba(0,229,153,0.1)]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon size={20} className={activeView === item.id ? 'animate-pulse' : ''} />
              <span className="font-medium">{item.label}</span>
              {activeView === item.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
            </button>
          ))}
        </nav>
      </aside>

      {/* MOBILE MENU OVERLAY */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden">
          <div className="absolute left-0 top-0 h-full w-64 bg-[#0a0a0a] border-r border-white/10 p-4">
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-lg text-neon-main">Vintex OS</span>
              <button onClick={() => setIsMobileOpen(false)}><X className="text-gray-400" /></button>
            </div>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveView(item.id); setIsMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeView === item.id ? 'bg-neon-main/20 text-neon-main' : 'text-gray-400'}`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-black/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileOpen(true)} className="md:hidden text-gray-400">
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {menuItems.find(i => i.id === activeView)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell size={20} className="text-gray-400 hover:text-white cursor-pointer" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </div>
            
            {/* USER MENU NATIVO (Sin Shadcn Dropdown) */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="h-9 w-9 rounded-full bg-neon-main text-black font-bold flex items-center justify-center ring-2 ring-white/10 hover:ring-white/30 transition-all"
              >
                {userProfile?.full_name?.charAt(0).toUpperCase() || 'U'}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm font-medium text-white">{userProfile?.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{userProfile?.email}</p>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-white/5 flex items-center gap-2"
                  >
                    <LogOut size={14} /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};-