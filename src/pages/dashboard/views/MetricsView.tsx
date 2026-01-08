import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { GlassCard } from '@/components/ui/GlassCard';
import { Users, Calendar, Activity, Stethoscope, ClipboardList } from 'lucide-react';

interface ClinicStats {
  pacientes: number;
  doctores: number;
  citas_totales: number;
  citas_programadas: number;
  seguimientos: number;
}

export default function MetricsView() {
  const [stats, setStats] = useState<ClinicStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Usamos tu URL de producción REAL
  const API_URL = import.meta.env.VITE_API_URL || 'https://clinica1.vintex.net.br';

  useEffect(() => {
    async function fetchStats() {
      // 🔍 LOG 1: Verificar que la función arranca
      console.log("🔄 Iniciando fetchStats..."); 
      
      try {
        // 1. Obtener Token de la sesión actual
        const { data: { session } } = await supabase.auth.getSession();
        
        // 🔍 LOG 2: Verificar qué devuelve Supabase (null o objeto sesión)
        console.log("🔑 Estado de Sesión:", session); 

        const token = session?.access_token;

        if (!token) {
          console.error("⛔ No hay sesión activa (Token es null o undefined)");
          setLoading(false);
          return; // Aquí es donde se detiene si no hay login
        }

        console.log("📡 Conectando a:", `${API_URL}/api/metrics`);

        // 2. Petición al Backend Desplegado
        const response = await fetch(`${API_URL}/api/metrics`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Métricas recibidas (Raw):", data);

        // PEQUEÑA MEJORA DE SEGURIDAD: 
        // Si data es un array (como sospechamos), tomamos el primer elemento.
        const statsData = Array.isArray(data) ? data[0] : data;
        setStats(statsData);

      } catch (err) {
        console.error('❌ Error cargando estadísticas:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const renderCard = (title: string, value: number | undefined, icon: any, colorClass: string) => (
    <GlassCard className="p-6 flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-20 backdrop-blur-md`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">
          {loading ? (
             <div className="h-6 w-16 bg-gray-700 animate-pulse rounded"></div>
          ) : (
            value || 0
          )}
        </h3>
      </div>
    </GlassCard>
  );

  return (
    <div className="space-y-8 p-1">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Panel General <span className="text-purple-400">Vintex</span>
        </h2>
        <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
          En vivo
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderCard("Pacientes Activos", stats?.pacientes, <Users className="w-6 h-6 text-blue-400" />, "bg-blue-500/20 text-blue-400")}
        {renderCard("Doctores", stats?.doctores, <Stethoscope className="w-6 h-6 text-green-400" />, "bg-green-500/20 text-green-400")}
        {renderCard("Citas Programadas", stats?.citas_programadas, <Calendar className="w-6 h-6 text-purple-400" />, "bg-purple-500/20 text-purple-400")}
        {renderCard("Seguimientos", stats?.seguimientos, <ClipboardList className="w-6 h-6 text-orange-400" />, "bg-orange-500/20 text-orange-400")}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
         <GlassCard className="lg:col-span-2 p-6 min-h-[300px] flex flex-col justify-center items-center text-gray-500 border border-gray-800 bg-gray-900/50">
            <Activity className="w-10 h-10 mb-2 opacity-50"/>
            <p>Gráficos de actividad próximamente</p>
         </GlassCard>
         <GlassCard className="p-6">
            <h3 className="text-white mb-4 font-bold">Resumen</h3>
            <div className="flex justify-between text-sm text-gray-400 border-b border-gray-700 pb-2">
                <span>Total Histórico</span>
                <span className="text-white font-bold">{stats?.citas_totales || 0}</span>
            </div>
         </GlassCard>
      </div>
    </div>
  );
}