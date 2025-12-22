import React, { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { SatelliteDoctor } from '@/types/satellite';

interface CitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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

  useEffect(() => {
    if(isOpen) {
      // CORRECCIÓN: Usar /api/initial-data para obtener doctores
      api.get('/api/initial-data')
        .then(res => setDoctores(res.data.doctores || []))
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
        return;
      }

      const fechaHora = new Date(`${formData.fecha}T${formData.hora}:00`).toISOString();

      const payload = {
        doctor_id: Number(formData.doctor_id),
        fecha_hora: fechaHora,
        duracion_minutos: 30,
        estado: 'programada',
        descripcion: formData.motivo,
        new_client_name: formData.new_client_name || undefined,
        new_client_telefono: formData.new_client_telefono || undefined
      };

      await api.post('/api/citas', payload);

      toast({ title: "Cita Creada", description: "Se ha registrado correctamente." });
      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.error || "Error al crear la cita.";
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setLoading(false);
    }
  };

  // ... (Renderizado del formulario igual, el cambio clave estaba en el useEffect)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-bold text-white">Nueva Cita</h2>
          <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Doctor</Label>
            <select 
              className="w-full bg-black/50 border border-white/10 rounded-md h-10 px-3 text-white"
              value={formData.doctor_id}
              onChange={e => setFormData({...formData, doctor_id: e.target.value})}
              required
            >
              <option value="">Seleccionar Doctor...</option>
              {doctores.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.nombre} - {doc.especialidad}</option>
              ))}
            </select>
          </div>
          {/* Resto de inputs (Fecha, Hora, Cliente Nuevo, Motivo) se mantienen igual */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input type="date" className="bg-black/50 border-white/10 text-white" required value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Hora</Label>
              <Input type="time" className="bg-black/50 border-white/10 text-white" required value={formData.hora} onChange={e => setFormData({...formData, hora: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Paciente Nuevo (Nombre)</Label>
            <Input placeholder="Ej: Juan Pérez" className="bg-black/50 border-white/10 text-white" required value={formData.new_client_name} onChange={e => setFormData({...formData, new_client_name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input placeholder="+54..." className="bg-black/50 border-white/10 text-white" value={formData.new_client_telefono} onChange={e => setFormData({...formData, new_client_telefono: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Motivo</Label>
            <Input className="bg-black/50 border-white/10 text-white" value={formData.motivo} onChange={e => setFormData({...formData, motivo: e.target.value})} />
          </div>
          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-white/10 text-gray-300">Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-neon-main text-black hover:bg-emerald-400 font-bold">{loading ? '...' : 'Confirmar'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};