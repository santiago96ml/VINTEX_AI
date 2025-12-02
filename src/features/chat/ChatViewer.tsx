import React, { useEffect, useRef } from 'react';
import { User, Bot } from 'lucide-react';

interface ChatViewerProps {
  messages: any[];
}

export const ChatViewer: React.FC<ChatViewerProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al fondo cuando llegan mensajes nuevos
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className="flex flex-col gap-4 h-full overflow-y-auto p-4 bg-tech-bg/50 scroll-smooth"
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
          <p>No hay historial de chat disponible.</p>
        </div>
      )}
      
      {messages.map((msg, index) => {
        // Lógica de parseo idéntica a tu versión JS Vanilla
        const isUser = msg.message.type === 'human';
        let content = msg.message.content;
        let timestamp = '';

        if (isUser) {
           // Limpiar metadatos del prompt de n8n
           if (content.includes('Fecha y hora actual:')) {
             const parts = content.split('Fecha y hora actual:');
             content = parts[0]; 
             // Intentar extraer hora si existe
             timestamp = parts[1]?.split('\n')[0] || '';
           }
           content = content.replace("Mensaje del paciente en texto:", "").trim();
        } else {
           // Intentar parsear JSON si la respuesta del bot es estructurada
           try {
             const json = JSON.parse(content);
             content = json.output?.mensaje_1 || json.output?.mensaje_2 || json.output?.mensaje_3 || content;
           } catch (e) {
             // Si falla, es texto plano, lo dejamos como está
           }
        }

        // Si después de limpiar no queda nada, no renderizamos burbuja vacía
        if (!content) return null;

        return (
          <div key={msg.id || index} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2`}>
            {/* AVATAR */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${isUser ? 'bg-neon-main text-black' : 'bg-gray-700 text-white'}`}>
              {isUser ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* BURBUJA */}
            <div className={`p-3 rounded-2xl max-w-[80%] text-sm shadow-sm ${
                isUser 
                  ? 'bg-neon-main/10 text-gray-100 border border-neon-main/30 rounded-tr-none' 
                  : 'bg-tech-card text-gray-300 border border-gray-700 rounded-tl-none'
              }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
              {timestamp && (
                <span className={`text-[10px] opacity-50 mt-1 block text-right ${isUser ? 'text-neon-main' : 'text-gray-500'}`}>
                  {timestamp}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};