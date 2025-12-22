import React, { useState, useEffect } from 'react';
import { User, Activity, MoreVertical } from 'lucide-react';
import { api } from '../../../../src/lib/api'; // Usamos tu instancia de axios configurada
import { Button } from '@/components/ui/button';
import { SatelliteDoctor } from '@/types/satellite';

export const DoctorsView = () => {
  const [doctors, setDoctors] = useState<SatelliteDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<{ doctores: SatelliteDoctor[] }>('/api/initial-data');
        setDoctors(data.doctores || []);
      } catch (e) {
        console.error("Error fetching doctors", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="text-center p-10 animate-pulse text-gray-500">Cargando staff médico...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Activity className="text-neon-main"/> Doctores Activos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doc) => (
          <div key={doc.id} className="bg-[#0a0a0a] border border-white/10 p-5 rounded-xl hover:border-neon-main/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: doc.color || '#00E599' }} />
            <div className="flex justify-between items-start mb-4 pl-2">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-300 font-bold">
                <User size={20} />
              </div>
              <button className="text-gray-500 hover:text-white"><MoreVertical size={16} /></button>
            </div>
            <div className="pl-2">
              <h3 className="text-lg font-bold text-white mb-1">{doc.nombre}</h3>
              <p className="text-sm text-gray-400">{doc.especialidad}</p>
              <div className="mt-2 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded inline-block">
                Disponible
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};