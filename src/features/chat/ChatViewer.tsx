import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, User, FileText, Image as ImageIcon, X } from 'lucide-react';
import { api } from '../../lib/api'; // Usamos nuestra instancia configurada
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; }
interface ChatViewerProps { onAnalysisComplete?: (data: { is_ready: boolean, summary: string }) => void; }

export const ChatViewer: React.FC<ChatViewerProps> = ({ onAnalysisComplete }) => {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome', role: 'assistant', content: '¡Hola! Soy Vintex Architect. Cuéntame sobre tu negocio o sube un Excel/Imagen para empezar.', timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
      if (totalSize > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Archivos muy grandes", description: "El límite es 10MB total." });
        return;
      }
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && files.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(), role: 'user',
      content: input + (files.length > 0 ? ` [${files.length} archivos adjuntos]` : ''),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', input);
      files.forEach(file => formData.append('files', file));

      // Usamos 'api' que gestiona headers automáticamente, pero para FormData dejamos que el navegador ponga el Content-Type
      const response = await api.post('/api/onboarding/interactive', formData, {
        headers: { 'Content-Type': 'multipart/form-data' } // Sobrescribimos solo para esta request
      });

      const data = response.data;
      const botMessage: Message = {
        id: Date.now().toString() + 'bot', role: 'assistant',
        content: data.reply || "He procesado tu solicitud.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setFiles([]);

      if (onAnalysisComplete && data.is_ready) {
        onAnalysisComplete({ is_ready: true, summary: JSON.stringify(data.updated_context) });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "No pude conectar con el servidor." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-neon-main text-black' : 'bg-gray-700 text-white'}`}>
                {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${msg.role === 'assistant' ? 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none' : 'bg-neon-main/10 text-neon-main border border-neon-main/20 rounded-tr-none'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && <div className="text-gray-500 text-xs ml-12 animate-pulse">Escribiendo...</div>}
        </div>
      </ScrollArea>

      <div className="p-4 bg-black/40 border-t border-white/10">
        {files.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-xs text-white shrink-0">
                {file.type.startsWith('image') ? <ImageIcon size={14} /> : <FileText size={14} />}
                <span className="truncate max-w-[100px]">{file.name}</span>
                <button onClick={() => setFiles(p => p.filter((_, idx) => idx !== i))} className="hover:text-red-400"><X size={14} /></button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,.csv,.xlsx,.xls" />
          <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} className="shrink-0 border-white/10 hover:bg-white/5 text-gray-400"><Paperclip size={20} /></Button>
          <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()} placeholder="Escribe o sube archivos..." className="bg-white/5 border-white/10 text-white focus-visible:ring-neon-main" />
          <Button onClick={sendMessage} disabled={isLoading || (!input.trim() && files.length === 0)} className="bg-neon-main text-black hover:bg-emerald-400 shrink-0"><Send size={18} /></Button>
        </div>
      </div>
    </div>
  );
};