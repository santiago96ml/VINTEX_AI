import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Loader2 } from 'lucide-react';
import { ChatViewer } from '../../../features/chat/ChatViewer'; // Asegúrate de que esta ruta sea correcta

export const ChatModal = ({ patient, onClose, satelliteFetch }: any) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChat = async () => {
      if (!patient?.telefono) {
        setLoading(false);
        return;
      }
      try {
        const data = await satelliteFetch(`/chat-history/${patient.telefono}`);
        if (data) setMessages(data);
      } catch (error) {
        console.error("Error cargando chat", error);
      } finally {
        setLoading(false);
      }
    };
    loadChat();
  }, [patient, satelliteFetch]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#1a1c20] w-full max-w-2xl h-[80vh] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="p-4 border-b border-gray-800 bg-tech-card flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold flex items-center gap-2">
              <MessageSquare className="text-neon-main" size={20} /> Historial de Chat
            </h3>
            <p className="text-sm text-gray-400">Paciente: {patient.nombre}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24}/></button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-hidden relative bg-[#0F0F0F]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-neon-main">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : messages.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
              <MessageSquare size={48} className="mb-2 opacity-20" />
              <p>No hay historial de chat para este número.</p>
            </div>
          ) : (
            <ChatViewer messages={messages} />
          )}
        </div>
      </div>
    </div>
  );
};