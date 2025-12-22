import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
// CORRECCIÓN: Usamos alias @ para evitar errores de ruta relativa
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
      if (clientToEdit) {
        // Editar (PATCH)
        await api.patch(`/rest/v1/clientes/${clientToEdit.id}`, formData);
        toast({ title: "Cliente actualizado", description: "Los cambios se guardaron correctamente." });
      } else {
        // Crear (POST)
        // NOTA: Como tu backend satélite no tiene un POST /api/clients explícito en el código que vimos,
        // intentamos usar el endpoint de creación de pacientes si existe, o el genérico.
        // Si falla, es porque necesitamos agregar esa ruta en el backend.
        await api.post('/api/patients', formData); 
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error.response?.data?.error || "No se pudo guardar el cliente." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-bold text-white">{clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Nombre Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input 
                className="pl-9 bg-black/50 border-white/10 text-white focus:border-neon-main/50" 
                required 
                placeholder="Ej: María García"
                value={formData.nombre} 
                onChange={e => setFormData({...formData, nombre: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Teléfono</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input 
                className="pl-9 bg-black/50 border-white/10 text-white focus:border-neon-main/50" 
                placeholder="+54 9 11..."
                value={formData.telefono} 
                onChange={e => setFormData({...formData, telefono: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>DNI / Identificación</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input 
                className="pl-9 bg-black/50 border-white/10 text-white focus:border-neon-main/50" 
                placeholder="12345678"
                value={formData.dni} 
                onChange={e => setFormData({...formData, dni: e.target.value})} 
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 bg-white/5 p-3 rounded-lg border border-white/5">
            <Label className="cursor-pointer" htmlFor="active-mode">Cliente Activo</Label>
            <Switch 
              id="active-mode"
              checked={formData.activo} 
              onCheckedChange={c => setFormData({...formData, activo: c})} 
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 hover:text-white">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-neon-main text-black hover:bg-emerald-400 font-bold">
              <Save size={16} className="mr-2" /> 
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};