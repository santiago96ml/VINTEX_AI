import { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Navbar } from '../../components/layout/Navbar';
import { createClient } from '@supabase/supabase-js'; // Cliente para Realtime

// URL del Orquestador Central (Fija o por variable de entorno del frontend)
const ORCHESTRATOR_URL = import.meta.env.VITE_ORCHESTRATOR_URL || 'https://webs-de-vintex-bakend-de-clinica.1kh9sk.easypanel.host/';

export const UserDashboard = () => {
  // --- ESTADO DE CONFIGURACIÓN DINÁMICA ---
  const [config, setConfig] = useState<{ backendUrl: string; supabaseUrl: string; supabaseAnonKey?: string } | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [supabaseClient, setSupabaseClient] = useState<any>(null);

  // --- ESTADO DE APLICACIÓN ---
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  
  // Datos
  const [doctores, setDoctores] = useState<any[]>([]);
  const [citas, setCitas] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);

  // --- 1. INICIALIZACIÓN: OBTENER CONFIGURACIÓN DEL ORQUESTADOR ---
  useEffect(() => {
    const initSession = async () => {
      const storedToken = localStorage.getItem('sb-access-token'); // O donde guardes el token
      if (!storedToken) {
        window.location.href = '/login'; // Redirigir si no hay sesión
        return;
      }
      setToken(storedToken);

      try {
        // Llamada al Endpoint B del Orquestador
        const res = await fetch(`${ORCHESTRATOR_URL}/api/config/init-session`, {
          headers: { 'Authorization': `Bearer ${storedToken}` }
        });

        if (!res.ok) throw new Error('Fallo al obtener configuración de sesión');

        const fetchedConfig = await res.json();
        setConfig(fetchedConfig);

        // Inicializar cliente Supabase para Realtime (Si tenemos key)
        if (fetchedConfig.supabaseUrl && fetchedConfig.supabaseAnonKey) {
            const sb = createClient(fetchedConfig.supabaseUrl, fetchedConfig.supabaseAnonKey);
            setSupabaseClient(sb);
            console.log("✅ Cliente Realtime inicializado");
        }

      } catch (err: any) {
        console.error("Error crítico:", err);
        setConfigError("No se pudo conectar con el sistema central. Contacte soporte.");
        setLoading(false);
      }
    };

    initSession();
  }, []);

  // --- 2. FUNCIÓN DE PETICIÓN AUTENTICADA (Usa URL Dinámica) ---
  const authFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!token || !config) return null;

    // Usamos config.backendUrl en lugar de una constante hardcodeada
    const url = `${config.backendUrl}/api${endpoint}`;
    
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        }
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error en el servidor satélite');
    }
    return res.json();
  }, [token, config]);

  // --- 3. CARGA DE DATOS (Solo cuando tenemos config) ---
  const fetchData = useCallback(async () => {
    if (!config || !token) return;

    try {
      const initialData = await authFetch('/initial-data');
      if (initialData) {
         setDoctores(initialData.doctores || []);
         setPacientes(initialData.clientes || []);
      }
      const citasData = await authFetch('/citas');
      if (citasData) setCitas(citasData);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [config, token, authFetch]);

  // Polling y Efectos
  useEffect(() => {
    if (config && token) {
        fetchData();
        // Configurar suscripción realtime si existe el cliente
        if (supabaseClient) {
            const channel = supabaseClient.channel('citas-updates')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'citas' }, () => {
                    console.log("Cambio detectado, recargando...");
                    fetchData();
                })
                .subscribe();
            return () => { supabaseClient.removeChannel(channel); };
        }
    }
  }, [config, token, fetchData, supabaseClient]);


  // --- RENDERIZADO ---

  if (configError) {
      return (
          <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center text-red-500">
              <div className="text-center">
                  <h1 className="text-2xl font-bold mb-2">Error de Conexión</h1>
                  <p>{configError}</p>
              </div>
          </div>
      );
  }

  if (loading && !config) {
      return (
          <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00ff9f]"></div>
              <p className="ml-4 text-[#00ff9f]">Conectando con Vintex AI...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white font-sans">
      <Navbar />
      {/* ... Resto de tu UI (Sidebar, GlassCard, Vistas) exactamente igual que antes ... */}
      {/* Solo asegúrate de usar 'pacientes', 'doctores', 'citas' del estado */}
      
      <div className="pt-24 px-4 max-w-7xl mx-auto">
          {/* Ejemplo de contenido renderizado cuando ya cargó */}
          <GlassCard className="p-6">
             <h2 className="text-2xl font-bold text-[#00ff9f] mb-4">Panel de Control</h2>
             <p className="text-gray-400">Conectado a: {config?.backendUrl}</p>
             <div className="mt-4">
               <h3 className="text-lg font-semibold mb-2">Doctores ({doctores.length})</h3>
               <p className="text-gray-400">{doctores.length > 0 ? `Total: ${doctores.length} doctores` : 'No hay doctores disponibles'}</p>
             </div>
             <div className="mt-4">
               <h3 className="text-lg font-semibold mb-2">Pacientes ({pacientes.length})</h3>
               <p className="text-gray-400">{pacientes.length > 0 ? `Total: ${pacientes.length} pacientes` : 'No hay pacientes disponibles'}</p>
             </div>
             <div className="mt-4">
               <h3 className="text-lg font-semibold mb-2">Citas ({citas.length})</h3>
               <p className="text-gray-400">{citas.length > 0 ? `Total: ${citas.length} citas` : 'No hay citas disponibles'}</p>
             </div>
             {/* Aquí inyectas tus componentes de Agenda, Tabla de Pacientes, etc. */}
          </GlassCard>
      </div>
    </div>
  );
};