import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar as CalendarIcon, Settings, 
  Menu, LogOut, Bell, Package, Activity, ChevronRight 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { clearApiConfig } from '../../lib/api'; // Importante para logout
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  const [config, setConfig] = useState<UIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login'); return; }

        // 1. Perfil
        const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
        setUserProfile(profile);

        // 2. Configuración UI (Si es satélite, quizás no tenga esta tabla, usar default)
        const { data: webConfig } = await supabase
          .from('web_clinica')
          .select('ui_config')
          .eq('ID_USER', user.id)
          .maybeSingle();

        if (webConfig?.ui_config) {
          setConfig(webConfig.ui_config);
        } else {
          // Fallback para satélites puros que no usaron el constructor IA
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
    clearApiConfig(); // Limpiamos la URL del satélite al salir
    navigate('/login');
  };

  // Resuelve el nombre de la tabla (Soporta SaaS 'app_xxx' y Satélite 'xxx')
  const getTableName = (key: string) => config?.tables?.[key] || `app_${key}`;

  const renderContent = () => {
    if (loading) return <div className="text-center p-10 text-gray-500">Cargando módulos...</div>;

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
    { id: 'overview', label: 'Panel', icon: LayoutDashboard },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'doctors', label: 'Doctores', icon: Activity },
    { id: 'agenda', label: 'Agenda', icon: CalendarIcon },
    { id: 'inventory', label: 'Inventario', icon: Package },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-gray-100 font-sans overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-main to-emerald-600" />
          <span className="font-bold text-lg">Vintex OS</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${activeView === item.id ? 'bg-neon-main/10 text-neon-main' : 'text-gray-400 hover:text-white'}`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
              {activeView === item.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-black/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-gray-400"><Menu /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#0a0a0a] border-r-white/10 text-white w-64">
                <div className="p-6 font-bold text-xl text-neon-main">Vintex OS</div>
                <nav className="px-4 space-y-1">
                  {menuItems.map((item) => (
                    <button key={item.id} onClick={() => { setActiveView(item.id); setIsMobileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400">
                      <item.icon size={20} /> <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-semibold">{menuItems.find(i => i.id === activeView)?.label}</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar><AvatarFallback className="bg-neon-main text-black font-bold">U</AvatarFallback></Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#0a0a0a] border-white/10 text-gray-200" align="end">
              <DropdownMenuLabel>{userProfile?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={handleSignOut} className="text-rose-400 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
};