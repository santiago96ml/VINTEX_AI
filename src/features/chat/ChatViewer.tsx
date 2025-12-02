import React from 'react';
import { User, Bot } from 'lucide-react';

export const ChatViewer: React.FC<{ messages: any[] }> = ({ messages }) => {
  return (
    <div className="flex flex-col gap-4 h-96 overflow-y-auto p-4 bg-tech-black/50 rounded-lg border border-white/5">
      {messages.length === 0 && <p className="text-gray-500 text-center">No hay historial.</p>}
      
      {messages.map((msg) => {
        const isUser = msg.message.type === 'human';
        let content = msg.message.content;
        let timestamp = '';

        if (isUser) {
           if (content.includes('Fecha y hora actual:')) {
             const parts = content.split('Fecha y hora actual:');
             content = parts[0]; 
             timestamp = parts[1]?.split('\n')[0] || '';
           }
           content = content.replace("Mensaje del paciente en texto:", "").trim();
        } else {
           try {
             const json = JSON.parse(content);
             content = json.output?.mensaje_1 || json.output?.mensaje_2 || json.output?.mensaje_3 || content;
           } catch (e) { }
        }

        return (
          <div key={msg.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-neon-main text-black' : 'bg-gray-700 text-white'}`}>
              {isUser ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${isUser ? 'bg-neon-main/10 text-white border border-neon-main/30' : 'bg-white/5 text-gray-300 border border-white/10'}`}>
              <p className="whitespace-pre-wrap">{content}</p>
              {timestamp && <span className="text-[10px] opacity-50 mt-1 block">{timestamp}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};