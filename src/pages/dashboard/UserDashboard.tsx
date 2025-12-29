import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar as CalendarIcon, 
  Menu, LogOut, Bell, Activity, X,
  Settings, School // ✅ Importamos el icono para Kennedy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { clearApiConfig } from '../../lib/api'; 

// Definimos la interfaz para la configuración que viene del backend
interface UIConfig {
  theme?: any;
  modules?: string[];
  tables?: Record<string, string>;
}

export const UserDashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); 

  const [config, setConfig] = useState<UIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Hook para detectar la ruta actual
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Detectar clics fuera del menú de usuario
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Carga de datos de usuario y configuración
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
          setConfig(webConfig.ui_config as UIConfig);
        } else {
          setConfig({ tables: { patients: 'pacientes', doctors: 'doctores', appointments: 'citas' } }); 
        }
      } catch (e) {
        console.error("Error loading dashboard data:", e);
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

  // ✅ Función para determinar si una ruta está activa
  const isActive = (path: string) => {
    // Si es root '/dashboard', lo marcamos activo si estamos exactamente ahí o en metrics (opcional)
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    // Para subrutas, verificamos si incluye el path
    return location.pathname.includes(path) && path !== '/dashboard';
  };

  const getTableName = (key: string) => config?.tables?.[key] || `app_${key}`;

  // ✅ Definición de Items del Menú Principal
  const mainMenuItems = [
    { path: '/dashboard', label: 'Panel General', icon: LayoutDashboard }, // Ojo: Si usas una ruta hija por defecto, ajusta el path
    { path: '/dashboard/patients', label: 'Pacientes', icon: Users },
    { path: '/dashboard/doctors', label: 'Doctores', icon: Activity },
    { path: '/dashboard/agenda', label: 'Agenda', icon: CalendarIcon },
    // { path: '/dashboard/inventory', label: 'Inventario', icon: Package }, // Desactivado o mover a ruta real si existe
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-gray-100 font-sans overflow-hidden">
      
      {/* --- SIDEBAR DESKTOP --- */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-main to-emerald-600 shadow-[0_0_15px_rgba(0,229,153,0.3)]" />
          <span className="font-bold text-lg tracking-tight text-white">Vintex OS</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {/* Módulos Principales */}
          {mainMenuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative outline-none
                ${isActive(item.path)
                  ? 'bg-neon-main/10 text-neon-main shadow-[inset_0_0_0_1px_rgba(0,229,153,0.2)]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon size={20} className={isActive(item.path) ? 'text-neon-main' : 'group-hover:text-white'} />
              <span className="font-medium">{item.label}</span>
              {isActive(item.path) && (
                <motion.div layoutId="activeIndicator" className="absolute right-2 w-1.5 h-1.5 rounded-full bg-neon-main" />
              )}
            </button>
          ))}

          {/* ✅ SECCIÓN SATÉLITES / KENNEDY */}
          <div className="mt-6 mb-2 px-2">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Satélites</p>
          </div>
          
          <button
            onClick={() => navigate('/dashboard/kennedy')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative outline-none
              ${isActive('/dashboard/kennedy')
                ? 'bg-indigo-500/20 text-indigo-400 shadow-[inset_0_0_0_1px_rgba(129,140,248,0.3)]' // Estilo especial para Kennedy (Indigo)
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
          >
            <School size={20} className={isActive('/dashboard/kennedy') ? 'text-indigo-400' : 'group-hover:text-white'} />
            <span className="font-medium">Punto Kennedy</span>
          </button>

        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-neon-main/20 flex items-center justify-center text-neon-main font-bold ring-1 ring-neon-main/30">
                {userProfile?.full_name?.charAt(0).toUpperCase() || 'U'}
             </div>
             <div className="flex-1 overflow-hidden">
               <p className="text-sm font-medium text-white truncate">{userProfile?.full_name}</p>
               <p className="text-xs text-gray-500 truncate">Online</p>
             </div>
          </div>
        </div>
      </aside>

      {/* --- MOBILE MENU OVERLAY (NATIVO) --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md md:hidden">
          <div className="absolute left-0 top-0 h-full w-72 bg-[#0a0a0a] border-r border-white/10 flex flex-col animate-in slide-in-from-left">
            <div className="p-6 flex justify-between items-center border-b border-white/10">
              <span className="font-bold text-lg text-neon-main">Vintex OS</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {mainMenuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${isActive(item.path) ? 'bg-neon-main/20 text-neon-main' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
              
              {/* Kennedy Mobile */}
              <div className="mt-4 mb-2 px-2 border-t border-white/10 pt-2">
                 <p className="text-xs font-bold text-gray-600 uppercase">Satélites</p>
              </div>
              <button
                  onClick={() => { navigate('/dashboard/kennedy'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${isActive('/dashboard/kennedy') ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <School size={20} />
                  <span>Punto Kennedy</span>
                </button>

            </nav>
             <div className="p-4 border-t border-white/10">
                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-rose-400 hover:bg-rose-500/10 transition-colors">
                   <LogOut size={20} /> <span>Cerrar Sesión</span>
                </button>
             </div>
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-black/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent truncate">
              {/* Lógica simple para mostrar título basado en ruta */}
              {location.pathname.includes('kennedy') ? 'Punto Kennedy' : 
               mainMenuItems.find(i => isActive(i.path))?.label || 'Panel General'}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-neon-main/50">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-black rounded-full" />
            </button>
            
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="h-10 w-10 rounded-full bg-gradient-to-tr from-neon-main/80 to-emerald-500/80 text-black font-bold flex items-center justify-center ring-2 ring-white/10 hover:ring-white/30 transition-all focus:outline-none shadow-lg shadow-neon-main/20"
              >
                {userProfile?.full_name?.charAt(0).toUpperCase() || 'U'}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 origin-top-right backdrop-blur-xl">
                  <div className="px-4 py-3 border-b border-white/5 bg-white/5 mx-2 rounded-t-lg mb-2">
                    <p className="text-sm font-semibold text-white truncate">{userProfile?.full_name}</p>
                    <p className="text-xs text-gray-400 truncate">{userProfile?.email}</p>
                  </div>
                  <div className="px-2">
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg flex items-center gap-2 transition-colors">
                          <Settings size={16} /> Configuración
                      </button>
                  </div>
                  <div className="h-px bg-white/10 my-2 mx-2" />
                  <div className="px-2 pb-1">
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={16} /> Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-300 delay-100">
             {/* ✅ AQUÍ ESTÁ EL CAMBIO CLAVE: Renderizamos Outlet en lugar del switch */}
             {loading ? (
                <div className="flex items-center justify-center h-full text-neon-main animate-pulse font-medium">
                  Cargando tu sistema...
                </div>
             ) : (
                <Outlet />
             )}
          </div>
        </div>
      </main>
    </div>
  );
};