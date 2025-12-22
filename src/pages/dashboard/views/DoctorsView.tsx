import React, { useState, useEffect } from 'react';
import { Activity, Plus, Edit, Trash } from 'lucide-react';
import { api } from '../../../../src/lib/api';
import { Button } from '@/components/ui/button';
import { SatelliteDoctor } from '@/types/satellite';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export const DoctorsView = () => {
  const [doctors, setDoctors] = useState<SatelliteDoctor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', especialidad: '', color: '#00E599' });
  const { toast } = useToast();

  const loadDocs = async () => {
    const { data } = await api.get('/api/initial-data');
    setDoctors(data.doctores || []);
  };

  useEffect(() => { loadDocs(); }, []);

  const handleSave = async () => {
    try {
      // Intentamos crear doctor. Si el backend no tiene la ruta, dará 404.
      await api.post('/api/doctors', { ...formData, activo: true });
      toast({ title: "Doctor Agregado" });
      setIsModalOpen(false);
      loadDocs();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "El backend no permite crear doctores desde aquí." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Activity className="text-neon-main"/> Equipo Médico</h2>
        <Button onClick={() => setIsModalOpen(true)} className="bg-neon-main text-black"><Plus size={18} className="mr-2"/> Agregar Doctor</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doc) => (
          <div key={doc.id} className="bg-[#0a0a0a] border border-white/10 p-5 rounded-xl flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-white">{doc.nombre}</h3>
              <p className="text-neon-main text-sm">{doc.especialidad}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white"><Edit size={16}/></Button>
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
          <DialogHeader><DialogTitle>Nuevo Doctor</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <Input placeholder="Nombre Dr/Dra" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="bg-black/50 border-white/10"/>
            <Input placeholder="Especialidad" value={formData.especialidad} onChange={e => setFormData({...formData, especialidad: e.target.value})} className="bg-black/50 border-white/10"/>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} className="bg-neon-main text-black">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};