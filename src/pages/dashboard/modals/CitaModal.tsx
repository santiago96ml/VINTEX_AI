import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, UserPlus, Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

export const CitaModal = ({ isOpen, onClose, initialData, doctores, clientes, satelliteFetch, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [isNewClient, setIsNewClient] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    doctor_id: '',
    cliente_id: '',
    fecha: '',
    hora: '',
    duracion_minutos: 30,
    estado: 'programada',
    descripcion: '',
    // Campos para nuevo cliente
    new_client_name: '',
    new_client_phone: '',
    new_client_dni: ''
  });

  useEffect(() => {
    if (initialData) {
      if (initialData.cita) {
        // MODO EDICIÓN
        const date = new Date(initialData.cita.fecha_hora);
        setFormData({
          doctor_id: initialData.cita.doctor_id,
          cliente_id: initialData.cita.cliente_id,
          fecha: format(date, 'yyyy-MM-dd'),
          hora: format(date, 'HH:mm'),
          duracion_minutos: initialData.cita.duracion_minutos,
          estado: initialData.cita.estado,
          descripcion: initialData.cita.descripcion || '',
          new_client_name: '', new_client_phone: '', new_client_dni: ''
        });
        setIsNewClient(false);
      } else if (initialData.date) {
        // MODO CREACIÓN (Desde click en agenda)
        setFormData(prev => ({
          ...prev,
          doctor_id: initialData.doctorId,
          fecha: format(initialData.date, 'yyyy-MM-dd'),
          hora: format(initialData.date, 'HH:mm'),
          cliente_id: '',
          descripcion: ''
        }));
      }
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fechaHora = new Date(`${formData.fecha}T${formData.hora}:00`);
      
      const payload: any = {
        doctor_id: Number(formData.doctor_id),
        fecha_hora: fechaHora.toISOString(),
        duracion_minutos: Number(formData.duracion_minutos),
        estado: formData.estado,
        descripcion: formData.descripcion,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      if (isNewClient) {
        payload.new_client_name = formData.new_client_name;
        payload.new_client_telefono = formData.new_client_phone;
        payload.new_client_dni = formData.new_client_dni;
      } else {
        payload.cliente_id = Number(formData.cliente_id);
      }

      const url = initialData?.cita ? `/citas/${initialData.cita.id}` : '/citas';
      const method = initialData?.cita ? 'PATCH' : 'POST';

      const res = await satelliteFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (res) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error(error);
      alert("Error guardando la cita");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta cita?')) return;
    setLoading(true);
    await satelliteFetch(`/citas/${initialData.cita.id}`, { method: 'DELETE' });
    onSuccess();
    onClose();
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-tech-card w-full max-w-lg rounded-2xl border border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#1a1c20]">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            {initialData?.cita ? '✏️ Editar Cita' : '📅 Nueva Cita'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* SELECCIÓN DE PACIENTE */}
          <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><User size={14}/> Paciente</label>
              {!initialData?.cita && (
                <button 
                  type="button" 
                  onClick={() => setIsNewClient(!isNewClient)}
                  className="text-xs text-neon-main hover:underline flex items-center gap-1"
                >
                  <UserPlus size={12}/> {isNewClient ? 'Seleccionar existente' : 'Nuevo paciente'}
                </button>
              )}
            </div>

            {isNewClient ? (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <input required className="dark-input" placeholder="Nombre completo" value={formData.new_client_name} onChange={e => setFormData({...formData, new_client_name: e.target.value})} />
                <div className="flex gap-2">
                  <input className="dark-input" placeholder="Teléfono" value={formData.new_client_phone} onChange={e => setFormData({...formData, new_client_phone: e.target.value})} />
                  <input className="dark-input" placeholder="DNI (Opcional)" value={formData.new_client_dni} onChange={e => setFormData({...formData, new_client_dni: e.target.value})} />
                </div>
              </div>
            ) : (
              <select 
                className="dark-input"
                value={formData.cliente_id}
                onChange={e => setFormData({...formData, cliente_id: e.target.value})}
                required
                disabled={!!initialData?.cita} // No cambiar paciente al editar
              >
                <option value="">-- Buscar Paciente --</option>
                {clientes.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nombre} - {c.dni}</option>
                ))}
              </select>
            )}
          </div>

          {/* DETALLES DE CITA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Doctor</label>
              <select 
                className="dark-input"
                value={formData.doctor_id}
                onChange={e => setFormData({...formData, doctor_id: e.target.value})}
                required
              >
                {doctores.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Estado</label>
              <select 
                className="dark-input"
                value={formData.estado}
                onChange={e => setFormData({...formData, estado: e.target.value})}
              >
                <option value="programada">🟡 Programada</option>
                <option value="confirmada">🟢 Confirmada</option>
                <option value="cancelada">🔴 Cancelada</option>
                <option value="completada">🔵 Completada</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1"><Calendar size={10}/> Fecha</label>
              <input type="date" required className="dark-input" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} />
            </div>
            <div className="col-span-1">
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1"><Clock size={10}/> Hora</label>
              <input type="time" required className="dark-input" value={formData.hora} onChange={e => setFormData({...formData, hora: e.target.value})} />
            </div>
            <div className="col-span-1">
              <label className="text-xs text-gray-500 mb-1 block">Duración</label>
              <select className="dark-input" value={formData.duracion_minutos} onChange={e => setFormData({...formData, duracion_minutos: Number(e.target.value)})}>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hora</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nota Interna</label>
            <textarea 
              className="dark-input resize-none h-20" 
              placeholder="Detalles de la consulta..."
              value={formData.descripcion}
              onChange={e => setFormData({...formData, descripcion: e.target.value})}
            />
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-800">
            {initialData?.cita ? (
              <button type="button" onClick={handleDelete} className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm font-medium px-2 py-1 hover:bg-red-500/10 rounded">
                <Trash2 size={16}/> Eliminar
              </button>
            ) : <div/>}
            
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Guardando...' : (
                  <><Save size={18} /> {initialData?.cita ? 'Actualizar' : 'Agendar'}</>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};