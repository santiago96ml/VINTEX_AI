import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Bot, User } from 'lucide-react';
import { api } from '../../../../src/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/types/satellite';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  telefono: string;
  nombreCliente: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, telefono, nombreCliente }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && telefono) {
      setLoading(true);
      // Limpiamos el teléfono para que coincida con el backend
      const cleanPhone = telefono.replace(/\D/g, '');
      api.get<ChatMessage[]>(`/api/chat-history/${cleanPhone}`)
        .then(res => setMessages(res.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, telefono]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl h-[80vh] rounded-xl shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-neon-main" size={18} />
            Historial: {nombreCliente}
          </h2>
          <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
        </div>
        
        <ScrollArea className="flex-1 p-6">
          {loading ? (
            <div className="text-center text-gray-500 mt-10">Cargando conversación...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">No hay historial de chat disponible.</div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                    ${msg.message.role === 'assistant' ? 'bg-neon-main text-black' : 'bg-gray-700 text-white'}`}>
                    {msg.message.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className={`p-3 rounded-xl max-w-[80%] text-sm 
                    ${msg.message.role === 'assistant' ? 'bg-white/10 text-gray-200' : 'bg-neon-main/10 text-neon-main'}`}>
                    {msg.message.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};