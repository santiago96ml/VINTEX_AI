import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, User } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Patient {
  id: string;
  full_name?: string;
  nombre?: string; // Soporte para español
  email?: string;
  phone?: string;
  status?: string;
  last_visit?: string;
}

export const PatientsView = ({ tableName }: { tableName: string }) => {
  // 1. Inicialización SEGURA con array vacío
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        if (!tableName) {
          setPatients([]); 
          return;
        }

        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(50);

        if (error) {
          console.warn(`Error cargando tabla ${tableName}:`, error.message);
          setPatients([]);
        } else {
          setPatients(data || []);
        }
      } catch (e) {
        console.error("Error crítico en PatientsView:", e);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [tableName]);

  // 2. Filtrado SEGURO
  // Usamos el operador ?. y || [] para asegurar que nunca falle
  const filteredPatients = (patients || []).filter(p => {
    const name = p.full_name || p.nombre || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-neon-main animate-pulse">
        Cargando base de datos de pacientes...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header y Filtros */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input 
            placeholder="Buscar paciente..." 
            className="pl-9 bg-[#0a0a0a] border-white/10 text-white focus-visible:ring-neon-main"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5">
            <Filter size={16} className="mr-2" /> Filtros
          </Button>
          <Button className="bg-neon-main text-black hover:bg-emerald-400 font-bold">
            <Plus size={18} className="mr-2" /> Nuevo Paciente
          </Button>
        </div>
      </div>

      {/* Tabla de Pacientes */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron pacientes.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-gray-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Última Visita</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPatients.map((patient, i) => (
                  <tr key={patient.id || i} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold">
                          {(patient.full_name || patient.nombre || 'U').charAt(0)}
                        </div>
                        <span className="font-medium text-white">
                          {patient.full_name || patient.nombre || 'Sin Nombre'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {patient.email || patient.phone || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {patient.status || 'Activo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-500 hover:text-white p-2 rounded hover:bg-white/10">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};