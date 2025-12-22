import React, { useState, useEffect } from 'react';
import { User, Activity, Calendar, MoreVertical, Plus } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '@/components/ui/button';

interface Doctor {
  id: string;
  name?: string;
  specialty?: string;
  status?: string;
  // Soporte para nombres dinámicos de columnas (si la IA generó otros nombres)
  nombre?: string;
  especialidad?: string;
}

export const DoctorsView = ({ tableName }: { tableName: string }) => {
  // Inicializamos con array vacío [] para evitar error de .map
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        // Si no hay tabla definida, usamos mock para evitar crash
        if (!tableName) {
          setDoctors([]);
          return;
        }

        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(20);

        if (error) {
          console.warn("Tabla no encontrada o error de permisos:", error.message);
          setDoctors([]); // Fallback seguro
        } else {
          setDoctors(data || []);
        }
      } catch (e) {
        console.error("Error crítico:", e);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [tableName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-neon-main animate-pulse">
        Cargando equipo médico...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="text-neon-main" />
          Doctores
        </h2>
        <Button className="bg-neon-main text-black hover:bg-emerald-400">
          <Plus size={18} className="mr-2" /> Nuevo Doctor
        </Button>
      </div>

      {/* Grid de Doctores */}
      {doctors.length === 0 ? (
        <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-xl">
          No hay doctores registrados aún.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* AQUÍ ESTABA EL ERROR: Usamos optional chaining (?.) y fallback */}
          {doctors?.map((doc, index) => (
            <div key={doc.id || index} className="bg-[#0a0a0a] border border-white/10 p-5 rounded-xl hover:border-neon-main/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-300 font-bold group-hover:bg-neon-main/20 group-hover:text-neon-main transition-colors">
                  <User size={20} />
                </div>
                <button className="text-gray-500 hover:text-white"><MoreVertical size={16} /></button>
              </div>
              
              {/* Soporte para columnas en inglés o español según lo que creó la IA */}
              <h3 className="text-lg font-bold text-white mb-1">
                {doc.name || doc.nombre || 'Doctor Sin Nombre'}
              </h3>
              <p className="text-sm text-neon-main mb-4">
                {doc.specialty || doc.especialidad || 'General'}
              </p>
              
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                <Button variant="outline" size="sm" className="w-full text-xs border-white/10 hover:bg-white/5">
                  <Calendar size={14} className="mr-1" /> Agenda
                </Button>
                <Button variant="outline" size="sm" className="w-full text-xs border-white/10 hover:bg-white/5">
                  Perfil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};