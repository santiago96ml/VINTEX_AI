import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format, addDays, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import axios from 'axios';
import CitaModal from '../modals/CitaModal';

// URL de la API
const API_URL = import.meta.env.VITE_API_URL || 'https://api-clinica.vintex.net.br';

export const AgendaView = () => {
  // --- ESTADOS DE DATOS ---
  const [citas, setCitas] = useState<any[]>([]);
  const [doctores, setDoctores] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  
  // --- ESTADOS DE UI ---
  const [loading, setLoading] = useState(true);
  const [loadingCitas, setLoadingCitas] = useState(false); // Estado de carga específico para citas
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Datos para el modal
  const [modalData, setModalData] = useState<{ date?: Date; doctorId?: number; cita?: any } | null>(null);

  // --- 1. CARGA INICIAL DE MAESTROS ---
  // Se usa useCallback para evitar advertencias de dependencias en el useEffect
  const fetchInitialData = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const { data } = await axios.get(`${API_URL}/api/initial-data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setDoctores(data.doctores || []);
      setClientes(data.clientes || []);
    } catch (error) {
      console.error("Error cargando datos maestros:", error);
    } finally {
      setLoading(false); // Finaliza la carga inicial
    }
  }, []);

  // --- 2. CARGA DE CITAS ---
  const fetchCitas = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      setLoadingCitas(true); // Activa loader al cambiar de día

      const start = startOfDay(currentDate).toISOString();
      const end = endOfDay(currentDate).toISOString();

      const { data } = await axios.get(`${API_URL}/api/citas`, {
        params: { start, end },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setCitas(data || []);
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
      setLoadingCitas(false);
    }
  }, [currentDate]);

  // Efectos
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  // --- LÓGICA DE FILTRADO Y OPTIMIZACIÓN ---
  const activeDoctors = useMemo(() => doctores.filter((d: any) => d.activo), [doctores]);
  
  const filteredDoctors = useMemo(() => {
    return selectedDoctor === 'all' 
      ? activeDoctors 
      : activeDoctors.filter((d: any) => d.id === Number(selectedDoctor));
  }, [selectedDoctor, activeDoctors]);

  const hours = useMemo(() => Array.from({ length: 13 }, (_, i) => i + 8), []); // De 08:00 a 20:00

  // OPTIMIZACIÓN CRÍTICA: Agrupar citas por doctor para no filtrar dentro del render loop
  const appointmentsByDoctor = useMemo(() => {
    const map: Record<number, any[]> = {};
    activeDoctors.forEach((doc: any) => map[doc.id] = []);
    
    citas.forEach((cita: any) => {
      // Aseguramos que la cita sea del día actual (doble verificación visual)
      if (isSameDay(new Date(cita.fecha_hora), currentDate)) {
        if (map[cita.doctor_id]) {
          map[cita.doctor_id].push(cita);
        }
      }
    });
    return map;
  }, [citas, activeDoctors, currentDate]);

  // --- MANEJADORES ---
  const handleCellClick = (doctorId: number, hour: number, minute: number) => {
    const date = new Date(currentDate);
    date.setHours(hour, minute, 0, 0);
    setModalData({ doctorId, date });
    setIsModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, cita: any) => {
    e.stopPropagation();
    setModalData({ cita, date: new Date(cita.fecha_hora), doctorId: cita.doctor_id }); 
    setIsModalOpen(true);
  };

  // Botón "Agendar" general: Asignamos la fecha actual y doctor "all" (o undefined)
  const handleGeneralAdd = () => {
    const now = new Date(currentDate);
    // Redondear a la siguiente hora o media hora para mejor UX
    if (now.getMinutes() < 30) now.setMinutes(30, 0, 0);
    else { now.setHours(now.getHours() + 1); now.setMinutes(0, 0, 0); }
    
    setModalData({ date: now });
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center text-neon-main"><Loader2 className="animate-spin" size={40}/></div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* HEADER DE LA AGENDA */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-[#0A0A0A] p-4 rounded-xl border border-white/10 shadow-lg">
        
        {/* Navegación de Fechas */}
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white capitalize min-w-[200px] flex items-center gap-2">
            {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
            {loadingCitas && <Loader2 className="animate-spin text-neon-main" size={16} />}
          </h2>
          <div className="flex items-center bg-[#1A1A1A] rounded-lg border border-white/10">
            <button onClick={() => setCurrentDate(addDays(currentDate, -1))} className="p-2 hover:text-neon-main text-gray-400 transition-colors"><ChevronLeft size={18}/></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 text-sm font-medium text-gray-300 border-x border-white/10 hover:text-white transition-colors">Hoy</button>
            <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 hover:text-neon-main text-gray-400 transition-colors"><ChevronRight size={18}/></button>
          </div>
        </div>

        {/* Filtros y Botón de Acción */}
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            className="bg-[#1A1A1A] border border-white/10 text-white text-sm rounded-lg p-2.5 outline-none focus:border-neon-main flex-1 md:w-64"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="all">Todos los profesionales</option>
            {activeDoctors.map((doc: any) => (
              <option key={doc.id} value={doc.id}>{doc.nombre}</option>
            ))}
          </select>
          
          <button 
            onClick={handleGeneralAdd}
            className="bg-neon-main hover:bg-neon-dark text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <Plus size={18} /> Agendar
          </button>
        </div>
      </div>

      {/* GRILLA DE LA AGENDA */}
      <div className="flex-1 overflow-auto bg-[#0A0A0A] rounded-xl border border-white/10 relative min-w-[800px] shadow-inner">
        
        {/* Cabecera de Doctores (Sticky) */}
        <div className="flex sticky top-0 z-20 bg-[#0A0A0A] border-b border-white/10 shadow-md">
          <div className="w-16 flex-shrink-0 bg-[#111] border-r border-white/10" />
          {filteredDoctors.map((doc: any) => (
            <div key={doc.id} className="flex-1 min-w-[200px] py-4 px-2 text-center border-r border-white/10 last:border-r-0 bg-[#0A0A0A]">
              <div className="font-bold text-white text-sm">{doc.nombre}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{doc.especialidad}</div>
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Columna de Horas */}
          <div className="w-16 flex-shrink-0 bg-[#111] border-r border-white/10">
            {hours.map(hour => (
              <div key={hour} className="h-24 border-b border-white/5 relative">
                <span className="absolute -top-2.5 right-2 text-xs font-mono text-gray-500">
                  {hour}:00
                </span>
              </div>
            ))}
          </div>

          {/* Columnas de Turnos por Doctor */}
          {filteredDoctors.map((doc: any) => {
             // Usamos la lista optimizada en lugar de filtrar en cada render
             const dayAppointments = appointmentsByDoctor[doc.id] || [];

             return (
              <div key={doc.id} className="flex-1 min-w-[200px] relative border-r border-white/10 last:border-r-0">
                {/* Renderizamos las grillas de tiempo (Slots) */}
                {hours.map(hour => (
                  <div key={hour} className="h-24 border-b border-white/5 relative group">
                    {/* Media hora superior (:00) */}
                    <div 
                      onClick={() => handleCellClick(doc.id, hour, 0)}
                      className="h-1/2 border-b border-white/5 hover:bg-neon-main/5 cursor-pointer transition-colors"
                    />
                    {/* Media hora inferior (:30) */}
                    <div 
                      onClick={() => handleCellClick(doc.id, hour, 30)}
                      className="h-1/2 hover:bg-neon-main/5 cursor-pointer transition-colors"
                    />
                  </div>
                ))}

                {/* Renderizado de Tarjetas de Cita (Posicionamiento Absoluto) */}
                {dayAppointments.map((cita: any) => {
                  const date = new Date(cita.fecha_hora);
                  const startHour = date.getHours();
                  const startMin = date.getMinutes();
                  
                  // Cálculo de posición: (Horas desde las 8) * 96px de altura por hora
                  const top = ((startHour - 8) * 96) + ((startMin / 60) * 96);
                  const height = (cita.duracion_minutos / 60) * 96;
                  
                  // Color dinámico o por defecto
                  const baseColor = doc.color || '#00E599'; 

                  return (
                    <div
                      key={cita.id}
                      onClick={(e) => handleEditClick(e, cita)}
                      className="absolute left-1 right-1 rounded-md p-2 text-xs cursor-pointer hover:z-30 hover:scale-[1.02] hover:shadow-xl transition-all border-l-[3px] overflow-hidden group"
                      style={{ 
                        top: `${top}px`, 
                        height: `${Math.max(height, 30)}px`,
                        backgroundColor: `${baseColor}1A`,
                        borderColor: baseColor
                      }}
                    >
                      <div className="font-bold text-white truncate group-hover:whitespace-normal leading-tight">
                        {cita.cliente?.nombre || cita.new_client_name || 'Sin Nombre'}
                      </div>
                      <div className="text-gray-400 text-[10px] mt-0.5 flex justify-between items-center">
                        <span>{startHour}:{String(startMin).padStart(2,'0')}</span>
                        <span className={`uppercase font-bold ${
                          cita.estado === 'confirmada' ? 'text-green-400' :
                          cita.estado === 'cancelada' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {cita.estado}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL DE CITAS */}
      {isModalOpen && (
        <CitaModal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setModalData(null); }} 
          onSuccess={fetchCitas}
          selectedDate={modalData?.date || currentDate} // Fallback seguro
          doctores={activeDoctors}
          clientes={clientes}
          initialData={modalData?.cita}
          initialDoctorId={modalData?.doctorId} // Prop adicional útil si el modal la soporta
        />
      )}
    </div>
  );
};