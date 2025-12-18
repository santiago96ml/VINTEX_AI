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
  
  // --- ESTADOS ---
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "¡Hola! Soy Vintex Architect. Puedo diseñar tu sistema analizando tus datos. Cuéntame sobre tu negocio o sube archivos Excel/CSV para empezar." 
    }
  ]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [readyToBuild, setReadyToBuild] = useState(false);
  
  // 1. Corregimos el error definiendo assistantMsg como estado
  const [assistantMsg, setAssistantMsg] = useState("");

  const API_URL = 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host';

  // Detector de finalización
  useEffect(() => {
    if (!isBuilding) return;
    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const channel = supabase
        .channel('db-provisioning')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'web_clinica', filter: `ID_USER=eq.${session.user.id}` },
          (payload) => {
            if (payload.new.status === 'active') {
              toast({ title: "¡Sistema Listo!", description: "Redirigiendo..." });
              setTimeout(() => navigate('/dashboard'), 1000);
            }
          }
        ).subscribe();
      return () => { supabase.removeChannel(channel); };
    };
    checkStatus();
  }, [isBuilding, navigate, toast]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, assistantMsg]); // Agregamos assistantMsg al scroll

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 15 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Archivo muy grande", description: "El máximo es 15MB." });
        return;
      }
      setFile(selectedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- ENVIAR MENSAJE CON STREAMING ---
  const handleSend = async () => {
    if (!input.trim() && !file) return;

    const userMsg: Message = { role: 'user', content: input, attachmentName: file?.name };
    setMessages(prev => [...prev, userMsg]);
    
    const currentInput = input;
    const currentFile = file;
    setInput('');
    clearFile();
    setLoading(true);
    setAssistantMsg(""); // Limpiamos el acumulador de streaming

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesión expirada");

      const formData = new FormData();
      formData.append('message', currentInput);
      if (currentFile) {
        // Mantenemos 'files' en plural para el backend de nodos
        formData.append('files', currentFile); 
      }

      const response = await fetch(`${API_URL}/api/onboarding/interactive`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: formData
      });

      if (!response.ok) throw new Error("Fallo en la conexión con el Arquitecto");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      // Creamos la burbuja de la IA que se irá llenando
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
                accumulatedText += data.chunk;
                setAssistantMsg(accumulatedText); // Actualizamos estado para la condición de carga
                
                // Actualizamos el contenido de la última burbuja en el chat
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastIndex = newMessages.length - 1;
                  if (newMessages[lastIndex].role === 'assistant') {
                    newMessages[lastIndex].content = accumulatedText;
                  }
                  return newMessages;
                });
              }

              if (data.final) {
                if (data.is_ready) setReadyToBuild(true);
              }
            } catch (e) { /* Fragmento incompleto */ }
          }
        }
      }

    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      setInput(currentInput);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setIsBuilding(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const conversationSummary = messages
        .map(m => `${m.role.toUpperCase()}: ${m.content} ${m.attachmentName ? `[Archivo: ${m.attachmentName}]` : ''}`)
        .join('\n');

      const response = await fetch(`${API_URL}/api/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ conversationSummary })
      });

      if (!response.ok) throw new Error("Error iniciando construcción");
      toast({ title: "Construyendo...", description: "Configurando base de datos..." });
    } catch (error: any) {
      setIsBuilding(false);
      toast({ variant: "destructive", title: "Error", description: "Fallo al iniciar construcción" });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (isBuilding) {
    return (
      <div className="min-h-screen bg-tech-black flex flex-col items-center justify-center text-center p-4">
        <Loader2 className="w-20 h-20 text-neon-main animate-spin" />
        <h2 className="text-3xl font-bold text-white mt-8 mb-2">Construyendo tu Sistema</h2>
        <p className="text-gray-400 max-w-md">Estamos creando las tablas y configurando permisos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tech-black flex flex-col items-center justify-center p-4 relative">
      <button onClick={handleLogout} className="absolute top-6 right-6 text-gray-500 hover:text-white flex items-center gap-2 text-sm z-10">
        <LogOut size={16} /> Cerrar Sesión
      </button>

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
            <motion.button initial={{ scale: 0.8 }} animate={{ scale: 1 }} onClick={handleFinish} className="bg-white hover:bg-gray-200 text-black text-xs font-bold py-2 px-4 rounded-full flex items-center gap-2">
              <Sparkles size={14} className="text-purple-600" /> Construir Ahora
            </motion.button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-neon-main/20 text-neon-main' : 'bg-white/10 text-white'}`}>
                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`max-w-[80%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'assistant' ? 'bg-[#1A1A1A] text-gray-200 border border-white/5' : 'bg-neon-main text-black font-medium'}`}>
                  {msg.content}
                </div>
                {msg.attachmentName && (
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10 text-xs text-gray-400">
                        {msg.attachmentName.match(/\.(xlsx|csv)$/i) ? <FileSpreadsheet size={14} /> : <ImageIcon size={14} />}
                        <span>{msg.attachmentName}</span>
                    </div>
                )}
              </div>
            </div>
          ))}
          
          {/* USAMOS EL ESTADO PARA LA CONDICIÓN DE CARGA */}
          {loading && assistantMsg === "" && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-neon-main/20 text-neon-main flex items-center justify-center"><Bot size={16} /></div>
              <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5 flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#111] border-t border-white/5">
          <AnimatePresence>
            {file && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center gap-2 bg-[#222] text-gray-300 text-xs px-3 py-2 rounded-lg mb-3 w-fit border border-white/10">
                    <span className="text-neon-main">{file.name.match(/\.(xlsx|csv|xls)$/i) ? <FileSpreadsheet size={16} /> : <ImageIcon size={16} />}</span>
                    <span className="max-w-[200px] truncate">{file.name}</span>
                    <button onClick={clearFile} className="hover:text-red-400 ml-2"><X size={14} /></button>
                </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <Paperclip size={20} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv, .xlsx, .xls, image/*" onChange={handleFileSelect} />
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={file ? "Añade un comentario sobre el archivo..." : "Escribe tu respuesta..."} className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-xl py-4 px-4 text-white focus:border-neon-main/50 outline-none" disabled={loading} />
            <button type="submit" disabled={loading || (!input.trim() && !file)} className="p-4 bg-neon-main rounded-xl text-black hover:bg-neon-main/80 disabled:opacity-50 transition-colors">
              <Send size={18} />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};