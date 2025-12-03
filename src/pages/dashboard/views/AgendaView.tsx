import React, { useState } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { CitaModal } from '../modals/CitaModal';

export const AgendaView = ({ citas, doctores, clientes, satelliteFetch, reload }: any) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  const activeDoctors = doctores.filter((d: any) => d.activo);
  const filteredDoctors = selectedDoctor === 'all' 
    ? activeDoctors 
    : activeDoctors.filter((d: any) => d.id === Number(selectedDoctor));

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); 

  const handleCellClick = (doctorId: number, hour: number, minute: number) => {
    const date = new Date(currentDate);
    date.setHours(hour, minute, 0, 0);
    setModalData({ doctorId, date });
    setIsModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, cita: any) => {
    e.stopPropagation();
    setModalData({ cita });
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* HEADER AGENDA SÓLIDO */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-tech-card p-4 rounded-xl border border-gray-800">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white capitalize">
            {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
          </h2>
          <div className="flex items-center bg-tech-input rounded-lg border border-gray-700">
            <button onClick={() => setCurrentDate(addDays(currentDate, -1))} className="p-2 hover:text-white text-gray-400"><ChevronLeft size={18}/></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 text-sm font-medium text-gray-300 border-x border-gray-700 hover:text-white">Hoy</button>
            <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 hover:text-white text-gray-400"><ChevronRight size={18}/></button>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <select 
            className="dark-input flex-1 md:w-64"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="all">Todos los profesionales</option>
            {activeDoctors.map((doc: any) => (
              <option key={doc.id} value={doc.id}>{doc.nombre}</option>
            ))}
          </select>
          <button 
            onClick={() => { setModalData(null); setIsModalOpen(true); }}
            className="btn-primary whitespace-nowrap"
          >
            <Plus size={18} /> Agendar
          </button>
        </div>
      </div>

      {/* GRILLA DE AGENDA */}
      <div className="flex-1 overflow-auto bg-tech-card rounded-xl border border-gray-800 relative min-w-[800px]">
        <div className="flex sticky top-0 z-20 bg-tech-card border-b border-gray-800">
          <div className="w-16 flex-shrink-0 bg-tech-bg border-r border-gray-800" />
          {filteredDoctors.map((doc: any) => (
            <div key={doc.id} className="flex-1 min-w-[200px] py-3 px-2 text-center border-r border-gray-800 last:border-r-0">
              <div className="font-bold text-white">{doc.nombre}</div>
              <div className="text-xs text-gray-500">{doc.especialidad}</div>
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Columna de Tiempos */}
          <div className="w-16 flex-shrink-0 bg-tech-bg border-r border-gray-800">
            {hours.map(hour => (
              <div key={hour} className="h-24 border-b border-gray-800 relative">
                <span className="absolute -top-3 right-2 text-xs text-gray-500 bg-tech-bg px-1">
                  {hour}:00
                </span>
              </div>
            ))}
          </div>

          {/* Columnas de Doctores */}
          {filteredDoctors.map((doc: any) => {
             const dayAppointments = citas.filter((c: any) => 
               c.doctor_id === doc.id && isSameDay(new Date(c.fecha_hora), currentDate)
             );

             return (
              <div key={doc.id} className="flex-1 min-w-[200px] relative border-r border-gray-800 last:border-r-0">
                {/* Slots vacíos */}
                {hours.map(hour => (
                  <div key={hour} className="h-24 border-b border-gray-800 relative group">
                    <div 
                      onClick={() => handleCellClick(doc.id, hour, 0)}
                      className="h-1/2 border-b border-gray-800/30 hover:bg-neon-main/10 cursor-pointer transition-colors"
                    />
                    <div 
                      onClick={() => handleCellClick(doc.id, hour, 30)}
                      className="h-1/2 hover:bg-neon-main/10 cursor-pointer transition-colors"
                    />
                  </div>
                ))}

                {/* Renderizado de Citas */}
                {dayAppointments.map((cita: any) => {
                  const date = new Date(cita.fecha_hora);
                  const startHour = date.getHours();
                  const startMin = date.getMinutes();
                  
                  const top = ((startHour - 8) * 96) + ((startMin / 60) * 96);
                  const height = (cita.duracion_minutos / 60) * 96;
                  const borderColor = doc.color || '#6B7280';
                  
                  return (
                    <div
                      key={cita.id}
                      onClick={(e) => handleEditClick(e, cita)}
                      className="absolute left-1 right-1 rounded p-2 text-xs cursor-pointer hover:z-10 hover:scale-[1.02] transition-all shadow-sm border-l-4 overflow-hidden"
                      style={{ 
                        top: `${top}px`, 
                        height: `${height}px`,
                        backgroundColor: `${borderColor}33`, 
                        borderColor: borderColor
                      }}
                    >
                      <div className="font-bold text-white truncate">{cita.cliente?.nombre}</div>
                      <div className="text-gray-300 truncate">{startHour}:{String(startMin).padStart(2,'0')} - {cita.estado}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <CitaModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          initialData={modalData}
          doctores={activeDoctors}
          clientes={clientes}
          satelliteFetch={satelliteFetch}
          onSuccess={reload}
        />
      )}
    </div>
  );
};