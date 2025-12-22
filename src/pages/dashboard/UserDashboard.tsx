import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar as CalendarIcon, 
  Menu, LogOut, Package, Activity, ChevronRight 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { clearApiConfig } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Vistas (Asegúrate de que estos archivos existan en tu proyecto)
import { MetricsView } from './views/MetricsView';
import { PatientsView } from './views/PatientsView';
import { DoctorsView } from './views/DoctorsView';
import { AgendaView } from './views/AgendaView';

// Tipado para la configuración y el perfil
interface UIConfig {
  theme?: any;
  modules?: string[];
  tables?: Record<string, string>;
}

interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  [key: string]: any;
}

export const UserDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [config, setConfig] = useState<UIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true; // Para evitar actualizaciones de estado si el componente se desmonta

    const loadData = async () => {
      try {
        // 1. Verificar sesión activa
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) { 
          if (isMounted) navigate('/login'); 
          return; 
        }

        // 2. Cargar Perfil de Usuario
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (isMounted) setUserProfile(profile || { id: user.id, email: user.email });

        // 3. Cargar Configuración UI
        // Nota: Asegúrate que la columna en DB sea 'ID_USER' o 'user_id' según tu esquema real.
        const { data: webConfig } = await supabase
          .from('web_clinica')
          .select('ui_config')
          .eq('ID_USER', user.id) // Revisa si en tu base de datos es mayúscula o minúscula
          .maybeSingle();

        if (isMounted) {
          if (webConfig?.ui_config) {
            setConfig(webConfig.ui_config);
          } else {
            // Fallback por defecto
            setConfig({ tables: { patients: 'pacientes', doctors: 'doctores', appointments: 'citas' } }); 
          }
        }

      } catch (e) {
        console.error("Error loading dashboard critical data:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false; // Cleanup
    };
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      clearApiConfig(); // Limpia localStorage del satélite
      navigate('/login');
    }
  };

  // Función robusta para obtener nombres de tablas
  const getTableName = (key: string): string => {
    if (config?.tables?.[key]) {
      return config.tables[key];
    }
    // Fallback: Si no hay config, asume prefijo 'app_' (SaaS standard)
    return `app_${key}`;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500 animate-pulse">
          <div className="w-8 h-8 border-4 border-neon-main border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Cargando entorno...</p>
        </div>
      );
    }

    switch (activeView) {
      case 'overview': return <MetricsView />;
      case 'patients': return <PatientsView tableName={getTableName('patients')} />;
      case 'doctors': return <DoctorsView tableName={getTableName('doctors')} />;
      case 'agenda': return <AgendaView tableName={getTableName('appointments')} />;
      case 'inventory': return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500 border border-dashed border-white/10 rounded-xl bg-white/5">
          <Package size={48} className="mb-4 opacity-50 text-neon-main"/>
          <p className="text-lg font-medium">Módulo de Inventario</p>
          <p className="text-sm opacity-70">Conectado a tabla: <code className="bg-black/30 px-2 py-1 rounded text-neon-main">{getTableName('inventory')}</code></p>
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
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-main to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
          <span className="font-bold text-lg tracking-tight">Vintex OS</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-neon-main/10 text-neon-main font-semibold shadow-inner' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon size={20} className={isActive ? "text-neon-main" : "text-gray-500 group-hover:text-white"} />
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight size={16} className="ml-auto opacity-70 animate-in slide-in-from-left-2" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Footer in Sidebar */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-8 w-8 border border-white/10">
              <AvatarFallback className="bg-zinc-800 text-xs text-white">
                {userProfile?.email?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userProfile?.full_name || 'Usuario'}</p>
              <p className="text-xs text-gray-500 truncate">{userProfile?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050505] relative bg-[url('/grid-pattern.svg')] bg-repeat opacity-100">
        
        {/* Header Mobile & Desktop */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-black/60 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-gray-400 hover:text-white hover:bg-white/10">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#0a0a0a] border-r-white/10 text-white w-72 p-0">
                <div className="p-6 font-bold text-xl text-neon-main border-b border-white/10">Vintex OS Mobile</div>
                <nav className="p-4 space-y-2">
                  {menuItems.map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => { setActiveView(item.id); setIsMobileOpen(false); }} 
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${activeView === item.id ? 'bg-white/10 text-white' : 'text-gray-400'}`}
                    >
                      <item.icon size={20} /> 
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            
            <h1 className="text-xl font-semibold tracking-tight text-white/90">
              {menuItems.find(i => i.id === activeView)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-3">
             {/* Dropdown Usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-white/20 transition-all p-0 overflow-hidden">
                  <Avatar className="h-full w-full">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs">
                       {userProfile?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#0a0a0a] border border-white/10 text-gray-200 shadow-2xl" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">{userProfile?.full_name || 'Mi Cuenta'}</p>
                    <p className="text-xs leading-none text-gray-500">{userProfile?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleSignOut} className="text-rose-400 focus:text-rose-300 focus:bg-rose-900/20 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};S