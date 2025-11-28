import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Mail, Phone, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

export const Demo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch(`${API_URL}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Error al agendar');
      setStatus('success');
      e.currentTarget.reset();
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pt-32 pb-20 relative z-10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* INFO IZQUIERDA */}
          <div className="flex-1 lg:sticky lg:top-32">
            <span className="text-neon-main font-mono text-sm uppercase tracking-widest">// Discovery Call</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mt-4 mb-6">
              Agenda tu Sesión <span className="text-neon-gradient">Estratégica</span>
            </h1>
            <p className="text-gray-muted text-lg mb-8 leading-relaxed">
              Conectemos 15 minutos para analizar la infraestructura de tu clínica y ver si VINTEX AI es el fit adecuado.
            </p>
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-neon-main/20 flex items-center justify-center text-neon-main">
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold">Disponibilidad Actual</h4>
                  <p className="text-sm text-gray-400">Sincronizado con Calendly</p>
                </div>
              </div>
              <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-neon-main w-3/4 animate-pulse" />
              </div>
              <p className="text-xs text-right text-neon-main mt-2 font-mono">Alta Demanda</p>
            </div>
          </div>

          {/* FORMULARIO DERECHA */}
          <div className="flex-1 w-full">
            <GlassCard className="border-neon-main/20 shadow-neon !p-8">
              {status === 'success' ? (
                <div className="text-center py-16 animate-in zoom-in">
                  <div className="w-20 h-20 bg-neon-main/10 text-neon-main rounded-full flex items-center justify-center mx-auto mb-6 border border-neon-main">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">¡Reunión Solicitada!</h3>
                  <p className="text-gray-400">Te hemos enviado un correo con el enlace de Google Meet.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Nombre</label>
                      <div className="flex items-center bg-tech-input border border-white/10 rounded p-3 focus-within:border-neon-main transition-colors">
                        <User size={16} className="text-gray-500 mr-2" />
                        <input name="firstName" required className="bg-transparent w-full text-white outline-none" placeholder="Nombre" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Apellido</label>
                      <div className="flex items-center bg-tech-input border border-white/10 rounded p-3 focus-within:border-neon-main transition-colors">
                        <User size={16} className="text-gray-500 mr-2" />
                        <input name="lastName" required className="bg-transparent w-full text-white outline-none" placeholder="Apellido" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Email</label>
                    <div className="flex items-center bg-tech-input border border-white/10 rounded p-3 focus-within:border-neon-main transition-colors">
                      <Mail size={16} className="text-gray-500 mr-2" />
                      <input name="email" type="email" required className="bg-transparent w-full text-white outline-none" placeholder="tu@email.com" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Teléfono</label>
                    <div className="flex items-center bg-tech-input border border-white/10 rounded p-3 focus-within:border-neon-main transition-colors">
                      <Phone size={16} className="text-gray-500 mr-2" />
                      <input name="phone" type="tel" required className="bg-transparent w-full text-white outline-none" placeholder="+54 9..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-neon-main font-bold uppercase tracking-wider">Día Preferido</label>
                      <div className="flex items-center bg-tech-input border border-white/10 rounded p-3 focus-within:border-neon-main transition-colors">
                        <input name="date" type="date" required className="bg-transparent w-full text-white outline-none invert-calendar-icon" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neon-main font-bold uppercase tracking-wider">Hora</label>
                      <div className="flex items-center bg-tech-input border border-white/10 rounded p-3 focus-within:border-neon-main transition-colors">
                        <Clock size={16} className="text-gray-500 mr-2" />
                        <input name="time" type="time" required className="bg-transparent w-full text-white outline-none invert-time-icon" />
                      </div>
                    </div>
                  </div>

                  <button disabled={loading} className="w-full py-4 bg-neon-main hover:bg-neon-dark text-black font-bold uppercase tracking-widest rounded shadow-neon transition-all flex justify-center gap-2 mt-4">
                    {loading ? <Loader2 className="animate-spin" /> : <>Agendar Llamada <ArrowRight size={18} /></>}
                  </button>
                </form>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </motion.div>
  );
};