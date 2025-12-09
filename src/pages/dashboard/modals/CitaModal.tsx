import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch"; // Asegúrate de tener este componente UI o usa un checkbox
import { useToast } from "@/hooks/use-toast"; // O tu hook de notificaciones
import axios from 'axios';

// Tipos (ajustar según tu proyecto)
interface Doctor { id: number; nombre: string; }
interface Cliente { id: number; nombre: string; dni?: string; }
interface CitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: Date;
  doctores: Doctor[];
  clientes: Cliente[];
}

const API_URL = import.meta.env.VITE_API_URL;

export default function CitaModal({ isOpen, onClose, onSuccess, selectedDate, doctores, clientes }: CitaModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isNewClient, setIsNewClient] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    doctor_id: '',
    cliente_id: '',
    fecha: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    hora: '09:00',
    duracion: 30,
    descripcion: '',
    // Campos Nuevo Cliente
    new_client_name: '',
    new_client_dni: '',
    new_client_telefono: ''
  });

  // Resetear form al abrir
  useEffect(() => {
    if (isOpen && selectedDate) {
      setFormData(prev => ({
        ...prev,
        fecha: selectedDate.toISOString().split('T')[0]
      }));
    }
  }, [isOpen, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const fechaHoraISO = `${formData.fecha}T${formData.hora}:00.000Z`; // Ajustar timezone según necesidad

      // Payload dinámico
      const payload: any = {
        doctor_id: Number(formData.doctor_id),
        fecha_hora: fechaHoraISO,
        duracion_minutos: Number(formData.duracion),
        descripcion: formData.descripcion,
        estado: 'programada'
      };

      if (isNewClient) {
        // Lógica Atómica Backend: Mandamos datos del cliente, no ID
        payload.new_client_name = formData.new_client_name;
        payload.new_client_dni = formData.new_client_dni;
        payload.new_client_telefono = formData.new_client_telefono;
      } else {
        payload.cliente_id = Number(formData.cliente_id);
      }

      await axios.post(`${API_URL}/api/citas`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      toast({ title: "Éxito", description: "Cita agendada correctamente" });
      onSuccess();
      onClose();

    } catch (error: any) {
      // MANEJO DE ERROR 409 (RACE CONDITION / OCUPADO)
      if (error.response?.status === 409) {
        toast({ 
          variant: "destructive", 
          title: "Horario No Disponible", 
          description: "El doctor ya tiene una cita en ese horario exacto o superpuesto." 
        });
      } else {
        toast({ 
          variant: "destructive", 
          title: "Error", 
          description: error.response?.data?.error || "No se pudo crear la cita" 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Cita</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selección de Doctor */}
          <div className="space-y-2">
            <Label>Doctor</Label>
            <Select 
              onValueChange={(val) => setFormData({...formData, doctor_id: val})}
              required
            >
              <SelectTrigger><SelectValue placeholder="Seleccionar doctor" /></SelectTrigger>
              <SelectContent>
                {doctores.map(doc => (
                  <SelectItem key={doc.id} value={String(doc.id)}>{doc.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggle Nuevo Cliente */}
          <div className="flex items-center space-x-2 py-2">
            <Switch 
              checked={isNewClient} 
              onCheckedChange={setIsNewClient} 
              id="new-client-mode"
            />
            <Label htmlFor="new-client-mode">Es un paciente nuevo (Sin registro)</Label>
          </div>

          {/* Lógica Condicional de Cliente */}
          {isNewClient ? (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-md border">
              <div className="col-span-2">
                <Label>Nombre Completo *</Label>
                <Input 
                  value={formData.new_client_name}
                  onChange={e => setFormData({...formData, new_client_name: e.target.value})}
                  required 
                />
              </div>
              <div>
                <Label>DNI</Label>
                <Input 
                  value={formData.new_client_dni}
                  onChange={e => setFormData({...formData, new_client_dni: e.target.value})}
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input 
                  value={formData.new_client_telefono}
                  onChange={e => setFormData({...formData, new_client_telefono: e.target.value})}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Paciente Registrado</Label>
              <Select 
                onValueChange={(val) => setFormData({...formData, cliente_id: val})}
                required={!isNewClient}
              >
                <SelectTrigger><SelectValue placeholder="Buscar paciente..." /></SelectTrigger>
                <SelectContent>
                  {clientes.map(cli => (
                    <SelectItem key={cli.id} value={String(cli.id)}>
                      {cli.nombre} {cli.dni ? `(${cli.dni})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha</Label>
              <Input 
                type="date" 
                value={formData.fecha} 
                onChange={e => setFormData({...formData, fecha: e.target.value})}
                required 
              />
            </div>
            <div>
              <Label>Hora</Label>
              <Input 
                type="time" 
                value={formData.hora} 
                onChange={e => setFormData({...formData, hora: e.target.value})}
                required 
              />
            </div>
          </div>

          <div>
             <Label>Descripción / Motivo</Label>
             <Textarea 
                value={formData.descripcion}
                onChange={e => setFormData({...formData, descripcion: e.target.value})}
             />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Agendando...' : 'Confirmar Cita'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}