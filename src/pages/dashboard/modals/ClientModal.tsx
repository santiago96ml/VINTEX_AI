import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { SatelliteClient } from '@/types/satellite';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: SatelliteClient | null;
  onSuccess: () => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, clientToEdit, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    dni: '',
    activo: true
  });

  useEffect(() => {
    if (clientToEdit) {
      setFormData({
        nombre: clientToEdit.nombre,
        telefono: clientToEdit.telefono || '',
        dni: clientToEdit.dni || '',
        activo: clientToEdit.activo
      });
    } else {
      setFormData({ nombre: '', telefono: '', dni: '', activo: true });
    }
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Endpoint correcto según tu backend robusto: /api/clientes
      if (clientToEdit) {
        await api.patch(`/api/clientes/${clientToEdit.id}`, formData);
        toast({ title: "Éxito", description: "Cliente actualizado correctamente." });
      } else {
        // Asumiendo que agregaremos POST /api/clientes o usaremos creación vía cita
        await api.post('/api/clientes', formData);
        toast({ title: "Éxito", description: "Cliente creado correctamente." });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || "Error al guardar cliente. Verifique los datos.";
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-bold text-white">{clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* ... Inputs iguales ... */}
          <div className="space-y-2">
            <Label>Nombre Completo</Label>
            <Input className="bg-black/50 border-white/10 text-white" required 
              value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input className="bg-black/50 border-white/10 text-white" 
              value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>DNI</Label>
            <Input className="bg-black/50 border-white/10 text-white" 
              value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} />
          </div>
          <div className="flex items-center justify-between pt-2">
            <Label>Activo</Label>
            <Switch checked={formData.activo} onCheckedChange={c => setFormData({...formData, activo: c})} />
          </div>
          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-white/10 text-gray-300">Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-neon-main text-black hover:bg-emerald-400 font-bold">
              {loading ? 'Guardando...' : <Save size={16} className="mr-2" /> } {loading ? '' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};