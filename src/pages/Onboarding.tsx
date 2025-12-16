import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, LogOut } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../lib/supabaseClient';

interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "¡Hola! Soy el Arquitecto de Vintex AI. Voy a diseñar tu sistema a medida. Para empezar, ¿cuál es el nombre de tu empresa y a qué se dedican?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  // ✅ URL ACTUALIZADA: Apunta a tu servidor Hostinger (Easypanel)
 const API_URL = 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host';

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('vintex_session');
    localStorage.removeItem('vintex_user');
    navigate('/login');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesión expirada");

      const response = await fetch(`${API_URL}/api/onboarding/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // TypeScript ahora sabe que session no es null
        },
        body: JSON.stringify({ 
          messages: [...messages, newMsg].filter(m => m.role !== 'system') 
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error en el chat");

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);

    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setIsBuilding(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Verificación de seguridad explícita para TypeScript
      if (!session) throw new Error("Sesión no válida.");

      // Recopilamos toda la conversación como "Contexto" para que n8n genere el SQL
      const conversationSummary = messages
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n');

      // Configuración base (el nombre real lo sacará n8n del resumen)
      const schemaConfig = {
        appName: "Nuevo Proyecto", 
        type: "custom_ai_generated"
      };

      const response = await fetch(`${API_URL}/api/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // Aquí estaba el error, ahora está protegido
        },
        body: JSON.stringify({ schemaConfig, conversationSummary })
      });

      if (!response.ok) throw new Error("Error iniciando construcción");

      toast({ title: "¡Entendido!", description: "Estoy construyendo tu base de datos y web..." });
      
      // Damos tiempo a n8n para procesar antes de ir al dashboard
      setTimeout(() => navigate('/dashboard'), 4000);

    } catch (error: any) {
      console.error(error);
      setIsBuilding(false);
      toast({ variant: "destructive", title: "Error", description: "No se pudo conectar con el Arquitecto." });
    }
  };

  if (isBuilding) {
    return (
      <div className="min-h-screen bg-tech-black flex flex-col items-center justify-center text-center p-4">
        <div className="relative">
          <div className="absolute inset-0 bg-neon-main blur-xl opacity-20 animate-pulse"></div>
          <Loader2 className="w-20 h-20 text-neon-main animate-spin relative z-10" />
        </div>
        <h2 className="text-3xl font-bold text-white mt-8 mb-2">Diseñando Arquitectura</h2>
        <p className="text-gray-400 max-w-md">
          La IA está creando tus tablas, relaciones y panel de control basándose en nuestra conversación.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tech-black flex flex-col items-center justify-center p-4 md:p-8 relative">
      
      {/* Botón de Salida de Emergencia */}
      <button 
        onClick={handleLogout} 
        className="absolute top-6 right-6 text-gray-500 hover:text-white flex items-center gap-2 text-sm transition-colors z-10"
      >
        <LogOut size={16} /> Cerrar Sesión
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]"
      >
        {/* Header */}
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
          
          {/* Botón para finalizar manualmente si la charla se extiende */}
          {messages.length > 3 && (
            <button 
              onClick={handleFinish}
              className="bg-white hover:bg-gray-200 text-black text-xs font-bold py-2 px-4 rounded-full transition-colors flex items-center gap-2"
            >
              <Sparkles size={14} /> Construir Ahora
            </button>
          )}
        </div>

        {/* Chat Area */}
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
              
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'assistant' 
                  ? 'bg-[#1A1A1A] text-gray-200 rounded-tl-none border border-white/5' 
                  : 'bg-neon-main text-black font-medium rounded-tr-none'
              }`}>
                {msg.content}
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

        {/* Input Area */}
        <div className="p-4 bg-[#111] border-t border-white/5">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative flex items-center"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe tu negocio..."
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-4 pl-6 pr-14 text-white focus:border-neon-main/50 outline-none placeholder-gray-600 transition-all"
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 bg-neon-main rounded-lg text-black hover:bg-neon-main/80 disabled:opacity-50 disabled:hover:bg-neon-main transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};