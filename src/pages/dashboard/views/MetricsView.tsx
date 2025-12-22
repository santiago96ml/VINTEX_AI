import React, { useState, useEffect } from 'react';
import { Activity, Users, DollarSign, TrendingUp } from 'lucide-react';
// Asegúrate de que esta ruta sea correcta según tu estructura
import { supabase } from '../../../lib/supabaseClient';

export const MetricsView = () => {
  // 1. Estado inicial seguro
  const [metrics, setMetrics] = useState({
    totalPatients: 0,
    activeDoctors: 0,
    appointmentsToday: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        // Aquí irían tus consultas reales a Supabase
        // const { count } = await supabase.from('...').select('*', { count: 'exact' });
        
        // Simulamos retardo de red para ver el estado de carga
        await new Promise(resolve => setTimeout(resolve, 500));

        setMetrics({
          totalPatients: 1240,
          activeDoctors: 8,
          appointmentsToday: 42,
          monthlyRevenue: 54000
        });
      } catch (error) {
        console.error("Error loading metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 animate-pulse flex items-center gap-2">
          <Activity className="animate-spin" size={20} />
          Cargando métricas...
        </div>
      </div>
    );
  }

  // 2. Validación defensiva antes de renderizar
  if (!metrics) return null;

  const cards = [
    { label: 'Pacientes Totales', value: metrics.totalPatients, icon: Users, color: 'text-blue-400' },
    { label: 'Doctores Activos', value: metrics.activeDoctors, icon: Activity, color: 'text-emerald-400' },
    { label: 'Citas Hoy', value: metrics.appointmentsToday, icon: TrendingUp, color: 'text-rose-400' },
    { label: 'Ingresos Mes', value: `$${metrics.monthlyRevenue}`, icon: DollarSign, color: 'text-yellow-400' },
  ];

  // Array estático para evitar errores de generación dinámica
  const bars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Resumen General</h2>
      
      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div key={index} className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">{card.label}</span>
              <card.icon className={`${card.color} opacity-80`} size={20} />
            </div>
            <div className="text-3xl font-bold text-white">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Gráfico Placeholder */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl h-80 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-neon-main/5 to-transparent opacity-50" />
        <p className="text-gray-500 z-10">Gráfico de Actividad (Próximamente)</p>
        
        {/* Barras decorativas (Versión segura) */}
        <div className="flex items-end gap-2 h-32 absolute bottom-10 left-10 right-10 justify-between opacity-30">
           {bars.map((i) => (
              <div 
                key={i} 
                className="w-full bg-neon-main rounded-t-sm" 
                style={{ height: `${Math.random() * 80 + 20}%` }} 
              />
           ))}
        </div>
      </div>
    </div>
  );
};