import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, User, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../../../src/lib/api'; // Usamos tu instancia de axios configurada
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SatelliteClient } from '@/types/satellite';
import { useToast } from '@/hooks/use-toast';

export const PatientsView = () => {
  const [patients, setPatients] = useState<SatelliteClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Tu backend optimizado carga todo en una sola petición
        const { data } = await api.get<{ clientes: SatelliteClient[] }>('/api/initial-data');
        setPatients(data.clientes || []);
      } catch (e) {
        console.error("Error cargando clientes:", e);
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los pacientes del satélite." });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.dni && p.dni.includes(searchTerm))
  );

  if (loading) {
    return <div className="flex justify-center p-10 animate-pulse text-neon-main">Conectando con base de datos clínica...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input 
            placeholder="Buscar por nombre o DNI..." 
            className="pl-9 bg-[#0a0a0a] border-white/10 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300"><Filter size={16} className="mr-2"/> Filtros</Button>
          <Button className="bg-neon-main text-black hover:bg-emerald-400 font-bold"><Plus size={18} className="mr-2"/> Nuevo Cliente</Button>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">DNI</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-neon-main">
                        <User size={14} />
                      </div>
                      {patient.nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{patient.dni || '-'}</td>
                  <td className="px-6 py-4 text-gray-400">{patient.telefono || '-'}</td>
                  <td className="px-6 py-4">
                    {patient.activo ? 
                      <span className="text-emerald-400 flex items-center gap-1 text-xs"><CheckCircle size={12}/> Activo</span> : 
                      <span className="text-red-400 flex items-center gap-1 text-xs"><XCircle size={12}/> Inactivo</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-500 hover:text-white"><MoreHorizontal size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};