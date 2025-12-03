import { TrendingUp, Users, Calendar, Activity } from 'lucide-react';

export const MetricsView = ({ citas, pacientes }: any) => {
  
  const totalCitas = citas.length;
  const citasHoy = citas.filter((c: any) => new Date(c.fecha_hora).toDateString() === new Date().toDateString()).length;
  const pacientesActivos = pacientes.filter((p: any) => p.activo).length;
  
  const stats = [
    { title: 'Total Citas', value: totalCitas, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Citas Hoy', value: citasHoy, icon: Activity, color: 'text-neon-main', bg: 'bg-neon-main/10' },
    { title: 'Pacientes en Base', value: pacientes.length, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Bots Activos', value: pacientesActivos, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Resumen Operativo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-tech-card p-6 rounded-xl border border-gray-800 flex items-center gap-4 hover:border-gray-700 transition-all">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">{stat.title}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-tech-card p-6 rounded-xl border border-gray-800">
        <h3 className="text-lg font-bold text-white mb-4">Próximas Citas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-800/50 text-gray-200 uppercase text-xs">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Paciente</th>
                <th className="p-3">Doctor</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {citas.slice(0, 5).map((cita: any) => (
                <tr key={cita.id} className="border-b border-gray-800 hover:bg-gray-800/20">
                  <td className="p-3 font-mono text-neon-main">{new Date(cita.fecha_hora).toLocaleString()}</td>
                  <td className="p-3 font-bold text-white">{cita.cliente?.nombre}</td>
                  <td className="p-3">{cita.doctor?.nombre}</td>
                  <td className="p-3 capitalize">{cita.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {citas.length === 0 && <p className="text-center py-4">No hay datos suficientes.</p>}
        </div>
      </div>
    </div>
  );
};