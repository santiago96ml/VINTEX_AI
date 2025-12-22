import React, { useState, useEffect } from 'react';
import { Activity, Plus, Edit, User } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { SatelliteDoctor } from '@/types/satellite';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export const DoctorsView = () => {
  const [doctors, setDoctors] = useState<SatelliteDoctor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<SatelliteDoctor | null>(null);
  const [formData, setFormData] = useState({ nombre: '', especialidad: '', color: '#00E599' });
  const { toast } = useToast();

  const loadDocs = async () => {
    try {
      const { data } = await api.get('/api/initial-data');
      setDoctors(data.doctores || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadDocs(); }, []);

  // Cargar datos al editar
  useEffect(() => {
    if (editingDoc) {
      setFormData({ nombre: editingDoc.nombre, especialidad: editingDoc.especialidad, color: editingDoc.color });
    } else {
      setFormData({ nombre: '', especialidad: '', color: '#00E599' });
    }
  }, [editingDoc, isModalOpen]);

  const handleSave = async () => {
    try {
      if (editingDoc) {
        // Editar
        await api.patch(`/api/doctores/${editingDoc.id}`, formData);
        toast({ title: "Doctor Actualizado" });
      } else {
        // Crear
        await api.post('/api/doctores', { ...formData, activo: true });
        toast({ title: "Doctor Agregado" });
      }
      setIsModalOpen(false);
      loadDocs();
    } catch (e: any) {
      console.error(e);
      // Nota: Si el backend no tiene estos endpoints, mostrará error.
      toast({ variant: "destructive", title: "Error", description: "No se pudieron guardar los cambios." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Activity className="text-neon-main"/> Equipo Médico</h2>
        <Button onClick={() => { setEditingDoc(null); setIsModalOpen(true); }} className="bg-neon-main text-black"><Plus size={18} className="mr-2"/> Agregar Doctor</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doc) => (
          <div key={doc.id} className="bg-[#0a0a0a] border border-white/10 p-5 rounded-xl hover:border-neon-main/30 transition-all relative overflow-hidden group">
            <div className="absolute left-0 top-0 w-1 h-full" style={{ backgroundColor: doc.color }}></div>
            <div className="flex justify-between items-start pl-3">
              <div>
                <h3 className="text-lg font-bold text-white">{doc.nombre}</h3>
                <p className="text-neon-main text-sm">{doc.especialidad}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white" 
                onClick={() => { setEditingDoc(doc); setIsModalOpen(true); }}>
                <Edit size={16}/>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
          <DialogHeader><DialogTitle>{editingDoc ? 'Editar Doctor' : 'Nuevo Doctor'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input placeholder="Ej: Dr. Smith" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="bg-black/50 border-white/10"/>
            </div>
            <div className="space-y-2">
              <Label>Especialidad</Label>
              <Input placeholder="Ej: Cardiología" value={formData.especialidad} onChange={e => setFormData({...formData, especialidad: e.target.value})} className="bg-black/50 border-white/10"/>
            </div>
            <div className="space-y-2">
              <Label>Color (Identificador)</Label>
              <Input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="bg-black/50 border-white/10 h-10 w-full"/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-white/10 text-gray-300">Cancelar</Button>
            <Button onClick={handleSave} className="bg-neon-main text-black">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};