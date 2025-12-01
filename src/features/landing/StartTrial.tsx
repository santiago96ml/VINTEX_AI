import React, { useState, useRef } from 'react';
import { ArrowRight, User, Mail, Phone, Loader2, CheckCircle2, AlertCircle, Check } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

export const StartTrial: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host';

  const benefits = ["Prueba gratuita de 14 días", "Sin tarjeta de crédito", "Migración incluida", "Soporte WhatsApp", "API Completa"];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone')
    };

    try {
      const response = await fetch(`${API_URL}/api/start-trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Error al conectar');

      setStatus('success');
      formRef.current?.reset(); 

    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden" id="contacto">
      <div className="absolute inset-0 bg-cyber-gradient opacity-5 skew-y-3 transform origin-bottom-right pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
        
        {/* Info Izquierda */}
        <div className="flex-1 space-y-8">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
            Inicie su <br/><span className="text-neon-main bg-clip-text text-transparent bg-cyber-gradient">Transformación Digital</span>
          </h2>
          <p className="text-gray-muted text-lg max-w-lg">Únase a las clínicas de élite.</p>
          <ul className="space-y-4 mt-4">
            {benefits.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-main font-medium">
                <div className="bg-neon-main/10 rounded-full p-1"><CheckCircle2 size={16} className="text-neon-main" /></div> {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Formulario */}
        <div className="flex-1 w-full max-w-md">
          <GlassCard className="!p-8 border-neon-main/30 shadow-neon bg-tech-card/80">
            {status === 'success' ? (
              <div className="text-center py-10 animate-in fade-in zoom-in">
                <div className="w-20 h-20 bg-neon-main/10 text-neon-main rounded-full flex items-center justify-center mx-auto mb-6 border border-neon-main/50">
                  <Check size={40} />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">¡Solicitud Recibida!</h3>
                <p className="text-gray-400 text-sm mb-6">Revisa tu correo para acceder.</p>
                <button onClick={() => setStatus('idle')} className="text-neon-main text-sm font-bold hover:underline">Volver</button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                   <label className="text-[10px] font-mono text-neon-main uppercase font-bold tracking-wider ml-1">Nombre</label>
                   <div className="flex items-center bg-tech-input border border-gray-border rounded-lg px-4 py-3 focus-within:border-neon-main transition-all group">
                     <User size={18} className="text-gray-500 mr-3 group-focus-within:text-neon-main transition-colors" />
                     <input name="name" required className="bg-transparent w-full text-white outline-none text-sm" placeholder="Dr. Juan Pérez" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-mono text-neon-main uppercase font-bold tracking-wider ml-1">Email</label>
                   <div className="flex items-center bg-tech-input border border-gray-border rounded-lg px-4 py-3 focus-within:border-neon-main transition-all group">
                     <Mail size={18} className="text-gray-500 mr-3 group-focus-within:text-neon-main transition-colors" />
                     <input name="email" type="email" required className="bg-transparent w-full text-white outline-none text-sm" placeholder="contacto@clinica.com" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-mono text-neon-main uppercase font-bold tracking-wider ml-1">Teléfono</label>
                   <div className="flex items-center bg-tech-input border border-gray-border rounded-lg px-4 py-3 focus-within:border-neon-main transition-all group">
                     <Phone size={18} className="text-gray-500 mr-3 group-focus-within:text-neon-main transition-colors" />
                     <input name="phone" type="tel" required className="bg-transparent w-full text-white outline-none text-sm" placeholder="+54 9 11..." />
                   </div>
                </div>

                {status === 'error' && (
                  <div className="flex items-start gap-3 text-red-400 text-xs bg-red-950/20 p-4 rounded-lg border border-red-900/50">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" /> <span>{errorMessage}</span>
                  </div>
                )}

                <button disabled={loading} className="w-full bg-neon-main hover:bg-neon-dark text-tech-black font-bold py-4 mt-4 rounded-lg transition-all flex justify-center items-center gap-2 uppercase tracking-wide text-sm shadow-neon">
                  {loading ? <Loader2 className="animate-spin" /> : <>Solicitar Acceso <ArrowRight size={18} /></>}
                </button>
              </form>
            )}
          </GlassCard>
        </div>
      </div>
    </section>
  );
};