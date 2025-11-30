import { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Navbar } from '../../components/layout/Navbar';
import { createClient } from '@supabase/supabase-js';

// CORRECCIÓN 1: Apuntar al Backend CENTRAL (Orquestador)
// NO al de la clínica. El central es el que tiene el endpoint /config/init-session
const ORCHESTRATOR_URL = import.meta.env.VITE_ORCHESTRATOR_URL || 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host';

export const UserDashboard = () => {
  const [config, setConfig] = useState<{ backendUrl: string; supabaseUrl: string; supabaseAnonKey?: string } | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [supabaseClient, setSupabaseClient] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  
  const [doctores, setDoctores] = useState<any[]>([]);
  const [citas, setCitas] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);

  // --- 1. INICIALIZACIÓN ---
  useEffect(() => {
    const initSession = async () => {
      // CORRECCIÓN 2: Leer el token correctamente desde el objeto JSON guardado en Login.tsx
      const sessionStr = localStorage.getItem('vintex_session');
      let storedToken = null;

      if (sessionStr) {
          try {
              const session = JSON.parse(sessionStr);
              storedToken = session.access_token || session.token; // Intentar obtener el access_token
          } catch (e) {
              console.error("Error parseando sesión", e);
          }
      }

      // Si no hay token, redirigir
      if (!storedToken) {
        console.warn("No se encontró token válido, redirigiendo al login.");
        window.location.href = '/login';
        return;
      }
      
      setToken(storedToken);

      try {
        // Llamada al Endpoint del CENTRAL
        console.log("Pidiendo configuración a:", `${ORCHESTRATOR_URL}/api/config/init-session`);
        
        const res = await fetch(`${ORCHESTRATOR_URL}/api/config/init-session`, {
          headers: { 
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Fallo al obtener config (${res.status}): ${errText}`);
        }

        const fetchedConfig = await res.json();
        console.log("Configuración recibida:", fetchedConfig);
        setConfig(fetchedConfig);

        if (fetchedConfig.supabaseUrl && fetchedConfig.supabaseAnonKey) {
            const sb = createClient(fetchedConfig.supabaseUrl, fetchedConfig.supabaseAnonKey);
            setSupabaseClient(sb);
        }

      } catch (err: any) {
        console.error("Error crítico en initSession:", err);
        setConfigError(err.message || "Error de conexión con el sistema central.");
        setLoading(false);
      }
    };

    initSession();
  }, []);

  // --- 2. FUNCIÓN DE PETICIÓN AUTENTICADA ---
  const authFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!token || !config) return null;

    // Aquí usamos la URL que nos devolvió el orquestador (que será la de la clínica)
    // Asegúrate que config.backendUrl no tenga una barra al final si endpoint empieza con /
    const baseUrl = config.backendUrl.replace(/\/$/, ''); 
    const url = `${baseUrl}/api${endpoint}`;
    
    console.log(`Fetching: ${url}`);

    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        }
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Error en el servidor satélite');
    }
    return res.json();
  }, [token, config]);

  // ... (El resto de tu código: fetchData, useEffect, renderizado se mantiene igual)
  
  // --- 3. CARGA DE DATOS ---
  const fetchData = useCallback(async () => {
    if (!config || !token) return;

    try {
      // Nota: Asegúrate que tu backend clínica devuelva { doctors: [], ... } o { doctores: [] }
      // Según tu código de backend, devuelve { doctors: ..., clients: ... } en inglés.
      // Ajustaremos aquí para mapear la respuesta del backend de clínica.
      const initialData = await authFetch('/initial-data');
      
      if (initialData) {
         // Mapeo de datos según tu backend de clínica (server.js)
         setDoctores(initialData.doctors || initialData.doctores || []);
         setPacientes(initialData.clients || initialData.clientes || []);
      }
      
      const citasData = await authFetch('/citas');
      if (citasData) setCitas(citasData);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [config, token, authFetch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // ... Resto del componente ...
  // (Incluye el return y el JSX original)
  
  if (configError) {
      return (
          <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center text-red-500 p-4">
              <div className="text-center">
                  <h1 className="text-2xl font-bold mb-2">Error de Conexión</h1>
                  <p>{configError}</p>
                  <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700">Reintentar</button>
              </div>
          </div>
      );
  }
  
  // ...
  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white font-sans">
      <Navbar />
      
      <div className="pt-24 px-4 max-w-7xl mx-auto">
          <GlassCard className="p-6">
             <h2 className="text-2xl font-bold text-[#00ff9f] mb-4">Panel de Control</h2>
             
             {loading && !config ? (
                 <div className="flex items-center gap-3 text-gray-400">
                     <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-[#00ff9f]"></div>
                     Conectando con Vintex AI Central...
                 </div>
             ) : (
                 <>
                     <p className="text-gray-400 text-sm mb-6">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        Conectado a servidor clínico: <span className="font-mono text-white opacity-70">{config?.backendUrl}</span>
                     </p>
                     
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                           <h3 className="text-lg font-semibold mb-1 text-white">Doctores</h3>
                           <p className="text-3xl font-bold text-[#00ff9f]">{doctores.length}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                           <h3 className="text-lg font-semibold mb-1 text-white">Pacientes</h3>
                           <p className="text-3xl font-bold text-blue-400">{pacientes.length}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                           <h3 className="text-lg font-semibold mb-1 text-white">Citas</h3>
                           <p className="text-3xl font-bold text-purple-400">{citas.length}</p>
                        </div>
                     </div>
                 </>
             )}
          </GlassCard>
      </div>
    </div>
  );
};