import React, { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api'; // Usamos alias @ para evitar errores de ruta
import { useToast } from '@/hooks/use-toast';
import { SatelliteDoctor } from '@/types/satellite';

interface CitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ⚠️ Asegúrate de que esta línea exista y sea 'export const'
export const CitaModal: React.FC<CitaModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [doctores, setDoctores] = useState<SatelliteDoctor[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    doctor_id: '',
    fecha: '',
    hora: '',
    new_client_name: '',
    new_client_telefono: '',
    motivo: ''
  });

  // Cargar doctores para el select cuando se abre el modal
  useEffect(() => {
    if(isOpen) {
      api.get('/rest/v1/doctores') // Endpoint mapeado correcto
        .then(res => setDoctores(res.data || []))
        .catch(err => console.error("Error cargando doctores:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.fecha || !formData.hora || !formData.doctor_id) {
        toast({ variant: "destructive", title: "Faltan datos", description: "Completa fecha, hora y doctor." });
        setLoading(false);
        return;
      }

      // Construir ISO String para Zod
      // Formato: YYYY-MM-DDTHH:mm:00.000Z (o local time offset si el backend lo maneja)
      const fechaHora = new Date(`${formData.fecha}T${formData.hora}:00`).toISOString();

      // Payload estricto según tu Backend Satélite
      const payload = {
        doctor_id: Number(formData.doctor_id),
        fecha_hora: fechaHora,
        duracion_minutos: 30, // Default o configurable
        estado: 'programada',
        descripcion: formData.motivo,
        // Tu backend permite crear cliente al vuelo si no se envía cliente_id
        new_client_name: formData.new_client_name || undefined,
        new_client_telefono: formData.new_client_telefono || undefined
      };

      await api.post('/rest/v1/citas', payload);

      toast({ title: "Cita Creada", description: "Se ha registrado correctamente en el sistema." });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || "Error al crear la cita.";
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-bold text-white">Nueva Cita</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="space-y-2">
            <Label className="text-gray-300">Doctor</Label>
            <select 
              className="w-full bg-black/50 border border-white/10 rounded-md h-10 px-3 text-white focus:outline-none focus:border-neon-main/50"
              value={formData.doctor_id}
              onChange={e => setFormData({...formData, doctor_id: e.target.value})}
              required
            >
              <option value="">Seleccionar Doctor...</option>
              {doctores.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.nombre} {doc.especialidad ? `(${doc.especialidad})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Fecha</Label>
              <Input 
                type="date" 
                className="bg-black/50 border-white/10 text-white focus:border-neon-main/50" 
                required
                value={formData.fecha} 
                onChange={e => setFormData({...formData, fecha: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Hora</Label>
              <Input 
                type="time" 
                className="bg-black/50 border-white/10 text-white focus:border-neon-main/50" 
                required
                value={formData.hora} 
                onChange={e => setFormData({...formData, hora: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Paciente Nuevo (Nombre)</Label>
            <Input 
              placeholder="Ej: Juan Pérez" 
              className="bg-black/50 border-white/10 text-white focus:border-neon-main/50" 
              required
              value={formData.new_client_name} 
              onChange={e => setFormData({...formData, new_client_name: e.target.value})} 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Teléfono (Opcional)</Label>
            <Input 
              placeholder="+54..." 
              className="bg-black/50 border-white/10 text-white focus:border-neon-main/50"
              value={formData.new_client_telefono} 
              onChange={e => setFormData({...formData, new_client_telefono: e.target.value})} 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Motivo</Label>
            <Input 
              placeholder="Consulta general" 
              className="bg-black/50 border-white/10 text-white focus:border-neon-main/50"
              value={formData.motivo} 
              onChange={e => setFormData({...formData, motivo: e.target.value})} 
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 hover:text-white">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-neon-main text-black hover:bg-emerald-400 font-bold">
              {loading ? 'Procesando...' : <span className="flex items-center gap-2"><CheckCircle size={16} /> Confirmar</span>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};