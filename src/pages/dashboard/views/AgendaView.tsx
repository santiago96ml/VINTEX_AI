import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { api } from '../../../../src/lib/api';
import { Button } from '@/components/ui/button';
import { SatelliteCita, SatelliteDoctor } from '@/types/satellite';
import { CitaModal } from '../modals/CitaModal';

export const AgendaView = () => {
  const [citas, setCitas] = useState<SatelliteCita[]>([]);
  const [doctores, setDoctores] = useState<SatelliteDoctor[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    const start = new Date(currentDate); start.setHours(0,0,0,0);
    const end = new Date(currentDate); end.setHours(23,59,59,999);
    
    // Traemos agenda del día y doctores
    const [citasRes, initRes] = await Promise.all([
      api.get(`/api/citas?start=${start.toISOString()}&end=${end.toISOString()}`),
      api.get('/api/initial-data')
    ]);
    
    setCitas(citasRes.data);
    setDoctores(initRes.data.doctores || []);
  };

  useEffect(() => { fetchData(); }, [currentDate]);

  // Generar Horas (08:00 a 20:00)
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  const getCitaForSlot = (docId: number, hour: number) => {
    return citas.find(c => {
      const citaHour = new Date(c.fecha_hora).getHours();
      return c.doctor_id === docId && citaHour === hour && c.estado !== 'cancelada';
    });
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between bg-[#0a0a0a] p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))}><ChevronLeft/></Button>
          <h2 className="text-xl font-bold text-white flex gap-2 items-center">
            <Calendar size={20} className="text-neon-main"/>
            {currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          <Button variant="ghost" onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))}><ChevronRight/></Button>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-neon-main text-black font-bold"><Plus size={18} className="mr-2"/> Agendar</Button>
      </div>

      {/* TABLA HORARIA */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-auto flex-1">
        <div className="min-w-[800px]">
          {/* Cabecera Doctores */}
          <div className="grid border-b border-white/10" style={{ gridTemplateColumns: `60px repeat(${doctores.length}, 1fr)` }}>
            <div className="p-4 border-r border-white/10 bg-white/5 sticky left-0 z-10"></div>
            {doctores.map(doc => (
              <div key={doc.id} className="p-3 text-center border-r border-white/10 font-bold text-white bg-white/5">
                {doc.nombre}
                <div className="text-xs text-neon-main font-normal">{doc.especialidad}</div>
              </div>
            ))}
          </div>

          {/* Cuerpo Horas */}
          {hours.map(hour => (
            <div key={hour} className="grid border-b border-white/5" style={{ gridTemplateColumns: `60px repeat(${doctores.length}, 1fr)` }}>
              <div className="p-3 text-center text-xs text-gray-400 border-r border-white/10 flex items-center justify-center">
                {hour}:00
              </div>
              {doctores.map(doc => {
                const cita = getCitaForSlot(doc.id, hour);
                return (
                  <div key={doc.id} className="border-r border-white/10 min-h-[60px] relative p-1">
                    {cita && (
                      <div className="absolute inset-1 rounded-md bg-neon-main/20 border-l-4 border-neon-main p-2 text-xs overflow-hidden cursor-pointer hover:bg-neon-main/30 transition-colors">
                        <div className="font-bold text-white truncate">{cita.cliente?.nombre || 'Ocupado'}</div>
                        <div className="text-neon-main/80 truncate">{cita.descripcion || 'Consulta'}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <CitaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />
    </div>
  );
};