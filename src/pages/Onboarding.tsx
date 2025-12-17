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
  attachmentName?: string; // Para mostrar si el mensaje tenía archivo
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
      content: "¡Hola! Soy Vintex Architect. Puedo diseñar tu sistema analizando tus datos. Cuéntame sobre tu negocio o sube un archivo Excel/CSV con tus productos o clientes para empezar." 
    }
  ]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null); // Estado para el archivo adjunto
  const [loading, setLoading] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [readyToBuild, setReadyToBuild] = useState(false); // La IA nos dirá cuando esté lista

  // URL del Backend
  const API_URL = 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host';

  // --- 1. DETECTOR DE SEÑAL DE FINALIZACIÓN (REALTIME) ---
  useEffect(() => {
    if (!isBuilding) return;

    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      console.log("📡 Escuchando señal de finalización...");

      const channel = supabase
        .channel('db-provisioning')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'web_clinica',
            filter: `ID_USER=eq.${session.user.id}`
          },
          (payload) => {
            console.log("⚡ SEÑAL RECIBIDA:", payload.new);
            if (payload.new.status === 'active') {
              toast({ title: "¡Sistema Listo!", description: "Redirigiendo a tu panel..." });
              setTimeout(() => navigate('/dashboard'), 1000);
            }
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };

    checkStatus();
  }, [isBuilding, navigate, toast]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // --- MANEJO DE ARCHIVOS ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Validar tamaño (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Archivo muy grande", description: "El máximo es 10MB." });
        return;
      }
      setFile(selectedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- ENVIAR MENSAJE (MODO INTERACTIVO) ---
  const handleSend = async () => {
    if (!input.trim() && !file) return;

    // 1. Mostrar mensaje del usuario inmediatamente (Optimistic UI)
    const newMsg: Message = { 
        role: 'user', 
        content: input,
        attachmentName: file?.name 
    };
    setMessages(prev => [...prev, newMsg]);
    
    // Guardamos referencia local para limpiar inputs mientras se envía
    const currentInput = input;
    const currentFile = file;
    
    setInput('');
    clearFile();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesión expirada");

      // 2. Preparar FormData (Texto + Archivo)
      const formData = new FormData();
      formData.append('message', currentInput);
      if (currentFile) {
        formData.append('file', currentFile);
      }

      // 3. Enviar al endpoint INTERACTIVO
      const response = await fetch(`${API_URL}/api/onboarding/interactive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
          // NO poner Content-Type, fetch lo pone automático con el boundary correcto para FormData
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error en el chat");

      // 4. Procesar respuesta de la IA
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);

      // 5. ¿La IA sugiere una plantilla o está lista?
      if (data.is_ready) {
        setReadyToBuild(true);
        toast({ 
            title: "¡Estructura Definida!", 
            description: "La IA tiene suficiente información para construir tu sistema.",
            className: "bg-green-600 text-white border-none"
        });
      }

    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: error.message });
      // Restaurar input si falló (opcional)
      setInput(currentInput);
    } finally {
      setLoading(false);
    }
  };

  // --- FINALIZAR Y CONSTRUIR (TRIGGER N8N) ---
  const handleFinish = async () => {
    setIsBuilding(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesión no válida");

      // Recopilamos el resumen de la conversación
      const conversationSummary = messages
        .map(m => `${m.role.toUpperCase()}: ${m.content} ${m.attachmentName ? `[Archivo: ${m.attachmentName}]` : ''}`)
        .join('\n');

      const schemaConfig = { appName: "Proyecto Generado", type: "interactive_ai" };

      const response = await fetch(`${API_URL}/api/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ schemaConfig, conversationSummary })
      });

      if (!response.ok) throw new Error("Error iniciando construcción");

      toast({ title: "Construyendo...", description: "El Arquitecto está cimentando la base de datos..." });

    } catch (error: any) {
      console.error(error);
      setIsBuilding(false);
      toast({ variant: "destructive", title: "Error", description: "No se pudo conectar con el servidor." });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('vintex_session');
    localStorage.removeItem('vintex_user');
    navigate('/login');
  };

  // --- VISTA DE CARGA (Building Mode) ---
  if (isBuilding) {
    return (
      <div className="min-h-screen bg-tech-black flex flex-col items-center justify-center text-center p-4">
        <div className="relative">
          <div className="absolute inset-0 bg-neon-main blur-xl opacity-20 animate-pulse"></div>
          <Loader2 className="w-20 h-20 text-neon-main animate-spin relative z-10" />
        </div>
        <h2 className="text-3xl font-bold text-white mt-8 mb-2">Construyendo tu Sistema</h2>
        <p className="text-gray-400 max-w-md mb-4">
          Estamos creando las tablas, configurando permisos y diseñando la interfaz basada en tu conversación...
        </p>
        <p className="text-xs text-gray-500 animate-pulse">
          Esto puede tomar unos segundos...
        </p>
      </div>
    );
  }

  // --- VISTA PRINCIPAL (CHAT) ---
  return (
    <div className="min-h-screen bg-tech-black flex flex-col items-center justify-center p-4 md:p-8 relative">
      <button 
        onClick={handleLogout} 
        className="absolute top-6 right-6 text-gray-500 hover:text-white flex items-center gap-2 text-sm transition-colors z-10"
      >
        <LogOut size={16} /> Cerrar Sesión
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]"
      >
        {/* HEADER */}
        <div className="bg-[#111] p-4 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neon-main/10 flex items-center justify-center">
              <Bot className="text-neon-main" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-white">Vintex Architect</h2>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/> En línea
              </p>
            </div>
          </div>
          
          {/* BOTÓN MÁGICO DE CONSTRUIR (Solo aparece cuando la IA dice "is_ready") */}
          {readyToBuild && (
            <motion.button 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleFinish}
              className="bg-white hover:bg-gray-200 text-black text-xs font-bold py-2 px-4 rounded-full transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              <Sparkles size={14} className="text-purple-600" /> Construir Ahora
            </motion.button>
          )}
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: msg.role === 'assistant' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'assistant' ? 'bg-neon-main/20 text-neon-main' : 'bg-white/10 text-white'
              }`}>
                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              
              <div className={`max-w-[80%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Burbuja de Texto */}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'assistant' 
                    ? 'bg-[#1A1A1A] text-gray-200 rounded-tl-none border border-white/5' 
                    : 'bg-neon-main text-black font-medium rounded-tr-none'
                }`}>
                  {msg.content}
                </div>

                {/* Burbuja de Archivo (Si existe) */}
                {msg.attachmentName && (
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10 text-xs text-gray-400">
                        {msg.attachmentName.endsWith('.csv') || msg.attachmentName.endsWith('.xlsx') 
                            ? <FileSpreadsheet size={14} /> 
                            : <ImageIcon size={14} />}
                        <span>{msg.attachmentName}</span>
                    </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-neon-main/20 text-neon-main flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-[#1A1A1A] p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
              </div>
            </div>
          )}
        </div>

        {/* INPUT AREA */}
        <div className="p-4 bg-[#111] border-t border-white/5">
          {/* Preview del Archivo Seleccionado */}
          <AnimatePresence>
            {file && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-2 bg-[#222] text-gray-300 text-xs px-3 py-2 rounded-lg mb-3 w-fit border border-white/10"
                >
                    <span className="text-neon-main">
                        {file.name.match(/\.(xlsx|csv|xls)$/i) ? <FileSpreadsheet size={16} /> : <ImageIcon size={16} />}
                    </span>
                    <span className="max-w-[200px] truncate">{file.name}</span>
                    <button onClick={clearFile} className="hover:text-red-400 ml-2">
                        <X size={14} />
                    </button>
                </motion.div>
            )}
          </AnimatePresence>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative flex items-center gap-2"
          >
            {/* Botón de Adjuntar */}
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Adjuntar archivo (Excel, CSV, Imagen)"
            >
                <Paperclip size={20} />
            </button>
            <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                accept=".csv, .xlsx, .xls, image/*"
                onChange={handleFileSelect}
            />

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={file ? "Añade un comentario sobre el archivo..." : "Escribe tu respuesta..."}
              className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-xl py-4 px-4 text-white focus:border-neon-main/50 outline-none placeholder-gray-600 transition-all"
              disabled={loading}
            />
            
            <button 
              type="submit"
              disabled={loading || (!input.trim() && !file)}
              className="p-4 bg-neon-main rounded-xl text-black hover:bg-neon-main/80 disabled:opacity-50 disabled:hover:bg-neon-main transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};