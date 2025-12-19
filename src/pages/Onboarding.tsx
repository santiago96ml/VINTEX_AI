import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Loader2, Sparkles, LogOut, 
  Paperclip, FileSpreadsheet, Image as ImageIcon, X 
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../lib/supabaseClient';

interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
  attachmentName?: string;
}

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([{ 
      role: 'assistant', 
      content: "¡Hola! Soy Vintex Architect. Puedo diseñar tu sistema analizando todas las hojas de tus archivos. Sube tus Excel o fotos para empezar." 
  }]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]); // MEJORA: Array de archivos
  const [loading, setLoading] = useState(false);
  const [assistantMsg, setAssistantMsg] = useState(""); // Fix para ReferenceError
  const [isBuilding, setIsBuilding] = useState(false);
  const [readyToBuild, setReadyToBuild] = useState(false);

  const API_URL = 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host';

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, assistantMsg]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(f => f.size <= 15 * 1024 * 1024);
      if (validFiles.length < selectedFiles.length) {
        toast({ variant: "destructive", title: "Archivos omitidos", description: "El máximo es 15MB por archivo." });
      }
      setFiles(prev => [...prev, ...validFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!input.trim() && files.length === 0) return;

    const attachmentNames = files.map(f => f.name).join(', ');
    setMessages(prev => [...prev, { role: 'user', content: input, attachmentName: attachmentNames }]);
    
    const currentInput = input;
    const currentFiles = [...files];
    setInput('');
    setFiles([]);
    setLoading(true);
    setAssistantMsg("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const formData = new FormData();
      formData.append('message', currentInput);
      currentFiles.forEach(f => formData.append('files', f)); // MEJORA: Múltiples archivos

      const response = await fetch(`${API_URL}/api/onboarding/interactive`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
        body: formData
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace('data: ', ''));
              if (data.chunk) {
                accumulated += data.chunk;
                setAssistantMsg(accumulated);
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].content = accumulated;
                  return newMsgs;
                });
              }
              if (data.final) if (data.is_ready) setReadyToBuild(true);
            } catch (e) {}
          }
        }
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (isBuilding) return (
    <div className="min-h-screen bg-tech-black flex flex-col items-center justify-center text-center p-4">
      <Loader2 className="w-20 h-20 text-neon-main animate-spin" />
      <h2 className="text-3xl font-bold text-white mt-8 mb-2">Construyendo tu Sistema</h2>
      <p className="text-gray-400">Estamos analizando todas las hojas de tus archivos...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-tech-black flex flex-col items-center justify-center p-4 relative">
      <button onClick={handleLogout} className="absolute top-6 right-6 text-gray-500 hover:text-white flex items-center gap-2 text-sm z-10"><LogOut size={16} /> Cerrar Sesión</button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        <div className="bg-[#111] p-4 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neon-main/10 flex items-center justify-center"><Bot className="text-neon-main" size={20} /></div>
            <div>
              <h2 className="font-bold text-white">Vintex Architect</h2>
              <p className="text-xs text-green-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/> En línea</p>
            </div>
          </div>
          {readyToBuild && (
            <button onClick={() => navigate('/complete')} className="bg-white text-black text-xs font-bold py-2 px-4 rounded-full flex items-center gap-2"><Sparkles size={14} className="text-purple-600" /> Construir Ahora</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-neon-main/20 text-neon-main' : 'bg-white/10 text-white'}`}>
                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`max-w-[80%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'assistant' ? 'bg-[#1A1A1A] text-gray-200 border border-white/5' : 'bg-neon-main text-black font-medium'}`}>{msg.content}</div>
                {msg.attachmentName && <div className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded">📎 {msg.attachmentName}</div>}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-[#111] border-t border-white/5">
          <div className="flex flex-wrap gap-2 mb-3">
            <AnimatePresence>
              {files.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex items-center gap-2 bg-[#222] text-gray-300 text-[10px] px-2 py-1 rounded border border-white/10">
                  {f.name.match(/\.(xlsx|csv)$/i) ? <FileSpreadsheet size={12} /> : <ImageIcon size={12} />}
                  <span className="max-w-[100px] truncate">{f.name}</span>
                  <button onClick={() => removeFile(i)} className="hover:text-red-400"><X size={10} /></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-white"><Paperclip size={20} /></button>
            <input type="file" ref={fileInputRef} className="hidden" multiple accept=".csv, .xlsx, .xls, image/*" onChange={handleFileSelect} />
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu respuesta..." className="flex-1 bg-black border border-white/10 rounded-xl px-4 text-white outline-none" disabled={loading} />
            <button type="submit" disabled={loading || (input.trim() === "" && files.length === 0)} className="p-4 bg-neon-main rounded-xl text-black disabled:opacity-50"><Send size={18} /></button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};