import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Calendar, Package, LogOut, LayoutDashboard, 
  Settings, Activity, CreditCard, Stethoscope
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

// Importamos tus vistas existentes (Asegúrate de que estos archivos existan en tu carpeta views)
import { PatientsView } from './views/PatientsView';
import { MetricsView } from './views/MetricsView';
import { DoctorsView } from './views/DoctorsView';
import { AgendaView } from './views/AgendaView';

// URL del Backend (Ajustada a tu servidor Hostinger)
const API_URL = 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host';

export const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Estado para la configuración dinámica (lo que decide la IA)
  const [config, setConfig] = useState<any>(null); 

  // 1. CARGAR CONFIGURACIÓN AL INICIAR
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/login');
            return;
        }

        console.log("🔄 Cargando interfaz personalizada...");

        // Pedimos al backend la configuración de este usuario
        const response = await fetch(`${API_URL}/api/config/init-session`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        
        if (!response.ok) throw new Error("Error cargando configuración");
        
        const data = await response.json();
        
        // Si hay configuración de UI, la aplicamos
        if (data.uiConfig) {
          console.log("✨ Tema aplicado:", data.uiConfig.theme);
          setConfig(data.uiConfig);
          applyTheme(data.uiConfig.theme);
        } else {
          // Fallback: Configuración por defecto si la IA falló o es una cuenta vieja
          console.warn("⚠️ No hay uiConfig, usando por defecto.");
          setConfig({
            features: { patients: true, calendar: true, billing: true }, // Todo activo por defecto
            texts: { dashboardTitle: "Mi Clínica", welcomeMessage: "Bienvenido al sistema" }
          });
        }
      } catch (e) {
        console.error("Error Dashboard:", e);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, [navigate]);

  // 2. FUNCIÓN PARA "PINTAR" LA WEB (CSS Variables)
  const applyTheme = (theme: any) => {
    if (!theme) return;
    const root = document.documentElement;
    // Cambiamos los colores globales de Tailwind dinámicamente
    // Si la IA manda un color, lo usamos; si no, dejamos el neon original
    if (theme.primaryColor) root.style.setProperty('--color-neon-main', theme.primaryColor);
    if (theme.secondaryColor) root.style.setProperty('--color-secondary', theme.secondaryColor);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('vintex_session');
    localStorage.removeItem('vintex_user');
    navigate('/login');
  };

  // 3. DEFINIR EL MENÚ DINÁMICO
  const getMenuItems = () => {
    if (!config) return []; 

    const items = [
      { id: 'overview', icon: LayoutDashboard, label: 'Panel Principal', show: true },
      
      // Módulos condicionales (Solo se muestran si features.[modulo] es true)
      { id: 'patients', icon: Users, label: 'Pacientes', show: config.features?.patients },
      { id: 'agenda', icon: Calendar, label: 'Agenda', show: config.features?.calendar },
      { id: 'doctors', icon: Stethoscope, label: 'Doctores', show: config.features?.patients }, // Solemos ligar doctores a pacientes
      { id: 'inventory', icon: Package, label: 'Inventario', show: config.features?.inventory },
      { id: 'billing', icon: CreditCard, label: 'Facturación', show: config.features?.billing },
    ];

    return items.filter(item => item.show);
  };

  // 4. RENDERIZADOR DE VISTAS
  const renderContent = () => {
    switch (activeView) {
      case 'overview': return <MetricsView />;
      case 'patients': return <PatientsView />;
      case 'doctors': return <DoctorsView />;
      case 'agenda': return <AgendaView />;
      case 'inventory': return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Package size={48} className="mb-4 opacity-50" />
            <h3 className="text-xl font-bold">Módulo de Inventario</h3>
            <p>Este módulo está activo en tu base de datos.</p>
        </div>
      );
      default: return <MetricsView />;
    }
  };

  if (loading) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-neon-main border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm animate-pulse">Cargando tu interfaz...</p>
            </div>
        </div>
      );
  }

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden font-sans">
      {/* Sidebar Dinámico */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 border-r border-white/10 bg-[#0A0A0A] flex flex-col"
      >
        <div className="p-6">
          {/* Título personalizado por la IA (o default) */}
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-main to-purple-500 truncate">
            {config?.texts?.dashboardTitle || "Vintex Panel"}
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {getMenuItems().map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeView === item.id 
                  ? 'bg-neon-main/10 text-neon-main border border-neon-main/20 shadow-[0_0_20px_-5px_var(--color-neon-main)]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </motion.div>

      {/* Área Principal */}
      <main className="flex-1 overflow-auto bg-[#050505] relative">
        {/* Header con Bienvenida IA */}
        <header className="sticky top-0 z-20 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 px-8 py-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {config?.texts?.welcomeMessage || "Bienvenido de nuevo"}
            </h2>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-main to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white font-bold">
                U
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};