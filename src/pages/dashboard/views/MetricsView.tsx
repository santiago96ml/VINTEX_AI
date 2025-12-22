import React, { useState, useEffect } from 'react';
import { Activity, Users, DollarSign, TrendingUp } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

export const MetricsView = () => {
  // 1. Inicializamos con arrays vacíos, NO null ni undefined
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
        // En un escenario real, estas consultas dependerían de las tablas dinámicas
        // Por ahora usamos contadores seguros o mocks si la tabla no existe
        
        // Ejemplo seguro:
        // const { count: patients } = await supabase.from('app_pacientes').select('*', { count: 'exact', head: true });
        
        // Simulamos carga para evitar el error de undefined
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
    return <div className="text-gray-500 animate-pulse">Cargando métricas...</div>;
  }

  const cards = [
    { label: 'Pacientes Totales', value: metrics.totalPatients, icon: Users, color: 'text-blue-400' },
    { label: 'Doctores Activos', value: metrics.activeDoctors, icon: Activity, color: 'text-emerald-400' },
    { label: 'Citas Hoy', value: metrics.appointmentsToday, icon: TrendingUp, color: 'text-rose-400' },
    { label: 'Ingresos Mes', value: `$${metrics.monthlyRevenue}`, icon: DollarSign, color: 'text-yellow-400' },
  ];

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
        
        {/* Barras decorativas animadas */}
        <div className="flex items-end gap-2 h-32 absolute bottom-10 left-10 right-10 justify-between opacity-30">
           {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="w-full bg-neon-main rounded-t-sm" 
                style={{ height: `${Math.random() * 100}%` }} 
              />
           ))}
        </div>
      </div>
    </div>
  );
};