import React, { useState } from 'react';
import { Plus, Edit2, CheckCircle, XCircle } from 'lucide-react';

export const DoctorsView = ({ doctores, satelliteFetch, reload }: any) => {
  const [editingDoc, setEditingDoc] = useState<any>(null); // null = modo lista, {} = modo crear, {id...} = modo editar
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingDoc.id ? `/doctores/${editingDoc.id}` : '/doctores';
    const method = editingDoc.id ? 'PATCH' : 'POST';
    
    // Asegurar color gris por defecto si no se elige uno, para cumplir con el backend
    const payload = {
        ...editingDoc,
        color: editingDoc.color || '#6B7280'
    };
    
    await satelliteFetch(url, { method, body: JSON.stringify(payload) });
    setEditingDoc(null);
    reload();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 bg-tech-card p-4 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold text-white">Equipo Médico</h2>
        <button onClick={() => setEditingDoc({ activo: true, color: '#00ff9f' })} className="btn-primary">
          <Plus size={18}/> Nuevo Doctor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctores.map((doc: any) => (
          <div key={doc.id} className="bg-tech-card p-5 rounded-xl border border-gray-800 relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: doc.color }} />
            
            <div className="flex justify-between items-start">
              <div className="ml-3">
                <h3 className="font-bold text-lg text-white">{doc.nombre}</h3>
                <p className="text-sm text-gray-400">{doc.especialidad || 'General'}</p>
                <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${doc.activo ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                   {doc.activo ? <CheckCircle size={10}/> : <XCircle size={10}/>} {doc.activo ? 'Activo' : 'Inactivo'}
                </div>
              </div>
              <button onClick={() => setEditingDoc(doc)} className="text-gray-500 hover:text-white bg-gray-800 p-2 rounded-lg transition-colors">
                <Edit2 size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE EDICIÓN SIMPLE */}
      {editingDoc && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-tech-card w-full max-w-md p-6 rounded-2xl border border-gray-800 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">{editingDoc.id ? 'Editar Profesional' : 'Nuevo Profesional'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400">Nombre Completo</label>
                <input required className="dark-input" value={editingDoc.nombre || ''} onChange={e => setEditingDoc({...editingDoc, nombre: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-400">Especialidad</label>
                <input className="dark-input" value={editingDoc.especialidad || ''} onChange={e => setEditingDoc({...editingDoc, especialidad: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                   <label className="text-xs text-gray-400">Color Agenda</label>
                   <div className="flex items-center gap-2 mt-1">
                     <input type="color" className="h-9 w-9 bg-transparent border-0 cursor-pointer" value={editingDoc.color || '#00ff9f'} onChange={e => setEditingDoc({...editingDoc, color: e.target.value})} />
                     <span className="text-xs text-gray-500 font-mono">{editingDoc.color}</span>
                   </div>
                </div>
                <div className="flex items-center">
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input type="checkbox" checked={editingDoc.activo} onChange={e => setEditingDoc({...editingDoc, activo: e.target.checked})} />
                     <span className="text-sm text-white">Disponible en Agenda</span>
                   </label>
                </div>
              </div>
              
              {/* Horarios (Requeridos por Backend) */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-gray-400">Inicio Jornada</label>
                    <input type="time" className="dark-input" value={editingDoc.horario_inicio || '08:00'} onChange={e => setEditingDoc({...editingDoc, horario_inicio: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-xs text-gray-400">Fin Jornada</label>
                    <input type="time" className="dark-input" value={editingDoc.horario_fin || '18:00'} onChange={e => setEditingDoc({...editingDoc, horario_fin: e.target.value})} />
                 </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setEditingDoc(null)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};