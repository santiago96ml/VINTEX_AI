import { useEffect, useState } from 'react';
import { api } from '@/lib/api';  // ← Mismo cliente que usas en DoctorsView
import { GlassCard } from '@/components/ui/GlassCard';
import { Users, Calendar, Activity, Stethoscope, ClipboardList } from 'lucide-react';

// Estructura esperada de la respuesta de /api/metrics
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

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/metrics');
      // Asumimos que el endpoint devuelve directamente el objeto con las stats
      setStats(data);
    } catch (err) {
      console.error('Error cargando métricas desde /api/metrics:', err);
      // Opcional: puedes mostrar un toast aquí si tienes useToast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  // Función para renderizar tarjetas (sin cambios)
  const renderCard = (title: string, value: number | undefined, icon: any, colorClass: string) => (
    <GlassCard className="p-6 flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-20 backdrop-blur-md`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">
          {loading ? (
            <span className="animate-pulse bg-gray-700 h-6 w-12 rounded inline-block"></span>
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
          Actualizado en tiempo real
        </span>
      </div>

      {/* Grilla de Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderCard(
          "Pacientes Activos",
          stats?.pacientes,
          <Users className="w-6 h-6 text-blue-400" />,
          "bg-blue-500/20 text-blue-400"
        )}

        {renderCard(
          "Doctores Disponibles",
          stats?.doctores,
          <Stethoscope className="w-6 h-6 text-green-400" />,
          "bg-green-500/20 text-green-400"
        )}

        {renderCard(
          "Citas Programadas",
          stats?.citas_programadas,
          <Calendar className="w-6 h-6 text-purple-400" />,
          "bg-purple-500/20 text-purple-400"
        )}

        {renderCard(
          "Seguimientos Pendientes",
          stats?.seguimientos,
          <ClipboardList className="w-6 h-6 text-orange-400" />,
          "bg-orange-500/20 text-orange-400"
        )}
      </div>

      {/* Sección Secundaria */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <GlassCard className="lg:col-span-2 p-6 min-h-[300px]">
          <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Actividad Reciente
          </h3>
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/30">
            <p className="text-gray-500 text-sm">Gráfico de citas semanales (Próximamente)</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">Estado del Sistema</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Base de Datos</span>
              <span className="text-green-400 font-medium">Conectado</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Satélite Kennedy</span>
              <span className="text-green-400 font-medium">Online</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Citas Históricas</span>
              <span className="text-white font-bold">{stats?.citas_totales || 0}</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}