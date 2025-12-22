import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { api } from '../../../../src/lib/api'; // Usamos tu instancia de axios configurada
import { Button } from '@/components/ui/button';
import { SatelliteCita } from '@/types/satellite';
import { CitaModal } from '../modals/CitaModal';

export const AgendaView = () => {
  const [citas, setCitas] = useState<SatelliteCita[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchCitas = async () => {
    try {
      setLoading(true);
      // Calculamos rango de fechas para la query (Mes actual)
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();

      const { data } = await api.get<SatelliteCita[]>(`/api/citas?start=${start}&end=${end}`);
      setCitas(data);
    } catch (e) {
      console.error("Error cargando agenda:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, [currentDate]);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-[#0a0a0a] p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
            <ChevronLeft className="text-gray-400" />
          </Button>
          <h2 className="text-xl font-bold text-white capitalize">
            {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
            <ChevronRight className="text-gray-400" />
          </Button>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-neon-main text-black hover:bg-emerald-400 font-bold">
          <Plus size={18} className="mr-2"/> Agendar Cita
        </Button>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Cargando calendario seguro...</div>
        ) : citas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-500">
            <CalendarIcon size={48} className="mb-4 opacity-50"/>
            <p>No hay citas programadas para este periodo.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {citas.map((cita) => (
              <div key={cita.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group border-l-4" style={{ borderLeftColor: cita.doctor?.color || '#333' }}>
                <div className="flex gap-4">
                  <div className="text-center w-16">
                    <div className="text-lg font-bold text-white">{new Date(cita.fecha_hora).getDate()}</div>
                    <div className="text-xs text-gray-500 uppercase">{new Date(cita.fecha_hora).toLocaleDateString('es-ES', { weekday: 'short' })}</div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{cita.cliente?.nombre || 'Cliente Nuevo'}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock size={14} />
                      {new Date(cita.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                      <span className="text-gray-600">•</span>
                      {cita.duracion_minutos} min
                      <span className="text-gray-600">•</span>
                      Dr. {cita.doctor?.nombre}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider 
                    ${cita.estado === 'confirmada' ? 'bg-emerald-500/10 text-emerald-400' : 
                      cita.estado === 'cancelada' ? 'bg-red-500/10 text-red-400' : 
                      'bg-yellow-500/10 text-yellow-400'}`}>
                    {cita.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CitaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => { fetchCitas(); setIsModalOpen(false); }} 
      />
    </div>
  );
};