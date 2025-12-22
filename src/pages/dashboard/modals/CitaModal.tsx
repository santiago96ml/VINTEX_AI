import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { api } from '../../../lib/api';

// Tipos
interface Doctor { id: number; nombre: string; }
interface Cliente { id: number; nombre: string; dni?: string; }

// SOLUCIÓN ERROR 2: Agregamos initialData e initialDoctorId a la interfaz
interface CitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: Date;
  doctores: Doctor[];
  clientes: Cliente[];
  initialData?: any;      // Datos de la cita para editar
  initialDoctorId?: number; // ID del doctor preseleccionado
}

export default function CitaModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  selectedDate, 
  doctores, 
  clientes,
  initialData, 
  initialDoctorId 
}: CitaModalProps) {
  
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isNewClient, setIsNewClient] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    doctor_id: '',
    cliente_id: '',
    fecha: '',
    hora: '09:00',
    duracion: 30,
    descripcion: '',
    // Campos Nuevo Cliente
    new_client_name: '',
    new_client_dni: '',
    new_client_telefono: ''
  });

  // Lógica de Inicialización (Reset o Carga de Datos)
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // MODO EDICIÓN: Rellenar con datos existentes
        const fechaObj = new Date(initialData.fecha_hora);
        setFormData({
          doctor_id: String(initialData.doctor_id),
          cliente_id: String(initialData.cliente_id),
          fecha: fechaObj.toISOString().split('T')[0],
          hora: fechaObj.toTimeString().slice(0, 5),
          duracion: initialData.duracion_minutos || 30,
          descripcion: initialData.descripcion || '',
          new_client_name: '',
          new_client_dni: '',
          new_client_telefono: ''
        });
        setIsNewClient(false);
      } else {
        // MODO CREACIÓN: Resetear formulario
        setFormData({
          doctor_id: initialDoctorId ? String(initialDoctorId) : '',
          cliente_id: '',
          fecha: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          hora: selectedDate ? selectedDate.toTimeString().slice(0, 5) : '09:00',
          duracion: 30,
          descripcion: '',
          new_client_name: '',
          new_client_dni: '',
          new_client_telefono: ''
        });
        setIsNewClient(false);
      }
    }
  }, [isOpen, selectedDate, initialData, initialDoctorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fechaHoraISO = `${formData.fecha}T${formData.hora}:00.000Z`;

      const payload: any = {
        doctor_id: Number(formData.doctor_id),
        fecha_hora: fechaHoraISO,
        duracion_minutos: Number(formData.duracion),
        descripcion: formData.descripcion,
        estado: initialData ? initialData.estado : 'programada'
      };

      if (isNewClient && !initialData) {
        payload.new_client_name = formData.new_client_name;
        payload.new_client_dni = formData.new_client_dni;
        payload.new_client_telefono = formData.new_client_telefono;
      } else {
        payload.cliente_id = Number(formData.cliente_id);
      }

      // Decidir si es Crear (POST) o Editar (PATCH/PUT)
      if (initialData && initialData.id) {
        await api.patch(`/api/citas/${initialData.id}`, payload);
        toast({ title: "Actualizado", description: "Cita modificada correctamente" });
      } else {
        await api.post('/api/citas', payload);
        toast({ title: "Éxito", description: "Cita agendada correctamente" });
      }

      onSuccess();
      onClose();

    } catch (error: any) {
      if (error.response?.status === 409) {
        toast({ 
          variant: "destructive", 
          title: "Horario No Disponible", 
          description: "El doctor ya tiene una cita en ese horario." 
        });
      } else {
        toast({ 
          variant: "destructive", 
          title: "Error", 
          description: error.response?.data?.error || "No se pudo guardar la cita" 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-tech-card border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Cita' : 'Nueva Cita'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Selección de Doctor */}
          <div className="space-y-2">
            <Label className="text-gray-300">Doctor</Label>
            <Select 
              value={formData.doctor_id}
              onValueChange={(val) => setFormData({...formData, doctor_id: val})}
              required
            >
              <SelectTrigger className="dark-input"><SelectValue placeholder="Seleccionar doctor" /></SelectTrigger>
              <SelectContent>
                {doctores.map(doc => (
                  <SelectItem key={doc.id} value={String(doc.id)}>{doc.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggle Nuevo Cliente (Solo visible si no estamos editando) */}
          {!initialData && (
            <div className="flex items-center space-x-2 py-2">
              <Switch 
                checked={isNewClient} 
                onCheckedChange={setIsNewClient} 
                id="new-client-mode"
              />
              <Label htmlFor="new-client-mode" className="text-gray-300">Es un paciente nuevo (Sin registro)</Label>
            </div>
          )}

          {/* Selección de Cliente */}
          {isNewClient ? (
            <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-md border border-white/10">
              <div className="col-span-2">
                <Label className="text-gray-300">Nombre Completo *</Label>
                <Input 
                  className="dark-input mt-1"
                  value={formData.new_client_name}
                  onChange={e => setFormData({...formData, new_client_name: e.target.value})}
                  required 
                />
              </div>
              <div>
                <Label className="text-gray-300">DNI</Label>
                <Input 
                  className="dark-input mt-1"
                  value={formData.new_client_dni}
                  onChange={e => setFormData({...formData, new_client_dni: e.target.value})}
                />
              </div>
              <div>
                <Label className="text-gray-300">Teléfono</Label>
                <Input 
                  className="dark-input mt-1"
                  value={formData.new_client_telefono}
                  onChange={e => setFormData({...formData, new_client_telefono: e.target.value})}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-gray-300">Paciente Registrado</Label>
              <Select 
                value={formData.cliente_id}
                onValueChange={(val) => setFormData({...formData, cliente_id: val})}
                required={!isNewClient}
                disabled={!!initialData} // No permitir cambiar el paciente al editar por seguridad
              >
                <SelectTrigger className="dark-input"><SelectValue placeholder="Buscar paciente..." /></SelectTrigger>
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
              <Label className="text-gray-300">Fecha</Label>
              <Input 
                type="date" 
                className="dark-input mt-1 invert-calendar-icon"
                value={formData.fecha} 
                onChange={e => setFormData({...formData, fecha: e.target.value})}
                required 
              />
            </div>
            <div>
              <Label className="text-gray-300">Hora</Label>
              <Input 
                type="time"
                className="dark-input mt-1 invert-time-icon" 
                value={formData.hora} 
                onChange={e => setFormData({...formData, hora: e.target.value})}
                required 
              />
            </div>
          </div>

          <div>
             <Label className="text-gray-300">Descripción / Motivo</Label>
             <Textarea 
                className="dark-input mt-1 bg-tech-input"
                value={formData.descripcion}
                onChange={e => setFormData({...formData, descripcion: e.target.value})}
             />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-white/10 text-gray-300 hover:bg-white/10 hover:text-white">Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-neon-main text-black hover:bg-neon-hover font-bold">
              {loading ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Confirmar Cita')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}