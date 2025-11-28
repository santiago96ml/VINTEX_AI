import React, { useState } from 'react';
import { ArrowRight, User, Mail, Phone, Loader2, CheckCircle2, AlertCircle, Check } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

export const StartTrial: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // URL de tu Backend (localhost para desarrollo)
  const API_URL = 'http://localhost:3000/api';

  const benefits = [
    "Prueba gratuita de 14 días (Premium)",
    "Sin tarjeta de crédito requerida",
    "Migración de base de datos incluida",
    "Soporte prioritario por WhatsApp",
    "Acceso total a la API de VINTEX"
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    // 1. GUARDAMOS LA REFERENCIA AL FORMULARIO AQUÍ (Antes del await)
    // Esto evita el error "Cannot read properties of null (reading 'reset')"
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const data = {
      fullName: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string
    };

    try {
      console.log(`📡 Enviando datos a: ${API_URL}/start-trial`);

      const response = await fetch(`${API_URL}/start-trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al conectar con el servidor');
      }

      // Si todo sale bien:
      setStatus('success');
      
      // 2. USAMOS LA VARIABLE GUARDADA PARA LIMPIAR
      form.reset(); 

    } catch (error: any) {
      console.error("❌ Error de conexión:", error);
      setStatus('error');
      
      if (error.message && error.message.includes('Failed to fetch')) {
        setErrorMessage('No se pudo conectar con el servidor. Asegúrate de que el Backend esté corriendo en el puerto 3000.');
      } else {
        setErrorMessage(error.message || 'Ocurrió un error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden" id="contacto">
      <div className="absolute inset-0 bg-cyber-gradient opacity-5 skew-y-3 transform origin-bottom-right pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
        
        {/* Lado Izquierdo: Beneficios */}
        <div className="flex-1 space-y-8">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
            Inicie su <br/><span className="text-neon-main bg-clip-text text-transparent bg-cyber-gradient">Transformación Digital</span>
          </h2>
          <p className="text-gray-muted text-lg max-w-lg">
            Únase a las clínicas de élite que ya han automatizado más de 30 millones de confirmaciones de turnos.
          </p>
          <ul className="space-y-4 mt-4">
            {benefits.map((item, index) => (
              <li key={index} className="flex items-center gap-3 text-gray-main font-medium">
                <div className="bg-neon-main/10 rounded-full p-1">
                  <CheckCircle2 size={16} className="text-neon-main" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Lado Derecho: Formulario Interactivo */}
        <div className="flex-1 w-full max-w-md">
          <GlassCard className="!p-8 border-neon-main/30 shadow-neon bg-tech-card/80 backdrop-blur-xl transition-all duration-300">
            {status === 'success' ? (
              <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-neon-main/10 text-neon-main rounded-full flex items-center justify-center mx-auto mb-6 border border-neon-main/50 shadow-[0_0_30px_rgba(0,255,153,0.3)]">
                  <Check size={40} />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">¡Solicitud Recibida!</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Tus credenciales han sido generadas. Revisa tu correo electrónico para acceder al dashboard.
                </p>
                <button 
                  onClick={() => setStatus('idle')} 
                  className="text-neon-main text-sm font-bold hover:underline underline-offset-4"
                >
                  Enviar otra solicitud
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 text-center md:text-left">
                  <h3 className="text-xl font-bold text-white mb-1">Acceso Anticipado</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Cupos limitados para Q4 2025</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-neon-main uppercase font-bold tracking-wider ml-1">Nombre Completo</label>
                    <div className="flex items-center bg-tech-input border border-gray-border rounded-lg px-4 py-3 focus-within:border-neon-main focus-within:shadow-[0_0_15px_rgba(0,255,153,0.1)] transition-all group">
                      <User size={18} className="text-gray-500 mr-3 group-focus-within:text-neon-main transition-colors" />
                      <input name="name" type="text" required className="bg-transparent w-full text-white focus:outline-none placeholder-gray-600 font-sans text-sm" placeholder="Dr. Juan Pérez" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-neon-main uppercase font-bold tracking-wider ml-1">Email Corporativo</label>
                    <div className="flex items-center bg-tech-input border border-gray-border rounded-lg px-4 py-3 focus-within:border-neon-main focus-within:shadow-[0_0_15px_rgba(0,255,153,0.1)] transition-all group">
                      <Mail size={18} className="text-gray-500 mr-3 group-focus-within:text-neon-main transition-colors" />
                      <input name="email" type="email" required className="bg-transparent w-full text-white focus:outline-none placeholder-gray-600 font-sans text-sm" placeholder="contacto@clinica.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-neon-main uppercase font-bold tracking-wider ml-1">Teléfono</label>
                    <div className="flex items-center bg-tech-input border border-gray-border rounded-lg px-4 py-3 focus-within:border-neon-main focus-within:shadow-[0_0_15px_rgba(0,255,153,0.1)] transition-all group">
                      <Phone size={18} className="text-gray-500 mr-3 group-focus-within:text-neon-main transition-colors" />
                      <input name="phone" type="tel" required className="bg-transparent w-full text-white focus:outline-none placeholder-gray-600 font-sans text-sm" placeholder="+54 9 11..." />
                    </div>
                  </div>

                  {status === 'error' && (
                    <div className="flex items-start gap-3 text-red-400 text-xs bg-red-950/20 p-4 rounded-lg border border-red-900/50 animate-in fade-in slide-in-from-top-2">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{errorMessage}</span>
                    </div>
                  )}

                  <button 
                    disabled={loading} 
                    className="w-full bg-neon-main hover:bg-neon-dark text-tech-black font-bold py-4 mt-4 rounded-lg transition-all flex justify-center items-center gap-2 uppercase tracking-wide text-sm shadow-neon hover:shadow-neon-strong hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <>Solicitar Acceso <ArrowRight size={18} /></>}
                  </button>
                </form>
              </>
            )}
          </GlassCard>
        </div>
      </div>
    </section>
  );
};