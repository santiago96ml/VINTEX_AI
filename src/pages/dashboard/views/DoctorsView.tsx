import React, { useState } from 'react';
// CORRECCIÓN: Se eliminó 'UserMd' de la importación
import { Plus, Edit2, CheckCircle, XCircle } from 'lucide-react';

export const DoctorsView = ({ doctores, satelliteFetch, reload }: any) => {
  const [editingDoc, setEditingDoc] = useState<any>(null);
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingDoc.id ? `/doctores/${editingDoc.id}` : '/doctores';
    const method = editingDoc.id ? 'PATCH' : 'POST';
    
    // Asignar color gris por defecto si no se elige
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
        <button onClick={() => setEditingDoc({ activo: true, color: '#00ff9f' })} className="btn-primary bg-neon-main text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-neon-hover">
          <Plus size={18}/> Nuevo Doctor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctores.map((doc: any) => (
          <div key={doc.id} className="bg-tech-card p-5 rounded-xl border border-gray-800 relative group overflow-hidden hover:border-gray-700 transition-all">
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
            
            <div className="mt-4 pt-3 border-t border-gray-800 text-xs text-gray-500 flex justify-between">
                <span>Jornada:</span>
                <span className="font-mono text-gray-300">{doc.horario_inicio?.slice(0,5)} - {doc.horario_fin?.slice(0,5)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE EDICIÓN */}
      {editingDoc && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setEditingDoc(null)}>
          <div className="bg-tech-card w-full max-w-md p-6 rounded-2xl border border-gray-800 shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">
                {editingDoc.id ? 'Editar Profesional' : 'Nuevo Profesional'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Nombre Completo</label>
                <input required className="dark-input" placeholder="Dr. Juan Pérez" value={editingDoc.nombre || ''} onChange={e => setEditingDoc({...editingDoc, nombre: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Especialidad</label>
                <input className="dark-input" placeholder="Odontología" value={editingDoc.especialidad || ''} onChange={e => setEditingDoc({...editingDoc, especialidad: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                   <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Color Agenda</label>
                   <div className="flex items-center gap-3 mt-1 bg-tech-input p-2 rounded-lg border border-gray-700">
                     <input type="color" className="h-8 w-8 bg-transparent border-0 cursor-pointer p-0" value={editingDoc.color || '#00ff9f'} onChange={e => setEditingDoc({...editingDoc, color: e.target.value})} />
                     <span className="text-xs text-gray-400 font-mono">{editingDoc.color || '#00ff9f'}</span>
                   </div>
                </div>
                <div className="flex items-center pt-5">
                   <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-800 rounded-lg transition-colors">
                     <input type="checkbox" className="w-5 h-5 rounded border-gray-600 text-neon-main focus:ring-neon-main bg-gray-700" checked={!!editingDoc.activo} onChange={e => setEditingDoc({...editingDoc, activo: e.target.checked})} />
                     <span className="text-sm text-white font-medium">Disponible</span>
                   </label>
                </div>
              </div>
              
              {/* Horarios */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Inicio Jornada</label>
                    <input type="time" className="dark-input" value={editingDoc.horario_inicio || '08:00'} onChange={e => setEditingDoc({...editingDoc, horario_inicio: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Fin Jornada</label>
                    <input type="time" className="dark-input" value={editingDoc.horario_fin || '18:00'} onChange={e => setEditingDoc({...editingDoc, horario_fin: e.target.value})} />
                 </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-800">
                <button type="button" onClick={() => setEditingDoc(null)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 font-medium transition-colors">Cancelar</button>
                <button type="submit" className="bg-neon-main text-black font-bold px-6 py-2 rounded-lg hover:bg-neon-hover transition-colors shadow-lg shadow-neon-main/20">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};