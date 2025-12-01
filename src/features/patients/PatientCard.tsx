import React from 'react';
import { MessageSquare, FileText, Bot, AlertCircle } from 'lucide-react';

export const PatientCard = ({ patient, actions }: any) => {
  return (
    <div className="group bg-[#16171a] border border-white/5 p-4 rounded-xl hover:border-neon-main/50 transition-all hover:shadow-neon flex justify-between items-center">
      
      {/* Info Paciente */}
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-white font-bold truncate">{patient.nombre}</h4>
          {patient.solicitud_de_secretaria && (
            <span className="flex items-center gap-1 text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/50 animate-pulse">
              <AlertCircle size={10} /> Solicita Atención
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 font-mono">
          DNI: {patient.dni} | Tel: {patient.telefono}
        </p>
      </div>

      {/* Botonera de Acciones */}
      <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
        
        {/* Toggle Bot */}
        <button 
          onClick={() => actions.toggleBot(patient)}
          className={`p-2 rounded-lg border transition-colors ${
            patient.activo 
              ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20' 
              : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
          }`}
          title={patient.activo ? "Desactivar IA" : "Activar IA"}
        >
          <Bot size={16} />
        </button>

        {/* Ver Chat */}
        <button 
          onClick={() => actions.openChat(patient)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-neon-main hover:bg-neon-main/10 transition-all"
        >
          <MessageSquare size={16} />
        </button>

        {/* Archivos */}
        <button 
          onClick={() => actions.openFiles(patient)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition-all"
        >
          <FileText size={16} />
        </button>
      </div>
    </div>
  );
};