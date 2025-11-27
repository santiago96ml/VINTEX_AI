import React, { useState } from 'react';
import { ArrowRight, User, Mail, Phone, Loader2, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

export const StartTrial: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // CORRECCIÓN 1: Array de beneficios definido
  const benefits = [
    "Prueba gratuita de 14 días (Premium)",
    "Sin tarjeta de crédito requerida",
    "Migración de base de datos incluida",
    "Soporte prioritario por WhatsApp",
    "Acceso total a la API de VINTEX"
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Opcional: Capturar datos del form
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    console.log("Datos del formulario:", data);

    // Simulación de POST
    setTimeout(() => {
      alert("Solicitud enviada exitosamente. Revisa la consola.");
      setLoading(false);
      // Aquí podrías redirigir o mostrar un mensaje de éxito en la UI
    }, 1500);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-cyber-gradient opacity-5 skew-y-3 transform origin-bottom-right pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
        
        {/* Lado Izquierdo: Copywriting */}
        <div className="flex-1 space-y-8">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
            Inicie su <br/><span className="text-neon-main bg-clip-text text-transparent bg-cyber-gradient">Transformación Digital</span>
          </h2>
          <p className="text-gray-muted text-lg max-w-lg">
            Únase a las clínicas de élite que ya han automatizado más de 30 millones de confirmaciones de turnos.
          </p>
          
          <ul className="space-y-4 mt-4">
            {/* CORRECCIÓN 2: Mapeo correcto sobre el array benefits */}
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

        {/* Lado Derecho: Formulario */}
        <div className="flex-1 w-full max-w-md">
          <GlassCard className="!p-8 border-neon-main/30 shadow-neon bg-tech-card/80 backdrop-blur-xl">
            <div className="mb-6 text-center md:text-left">
               <h3 className="text-xl font-bold text-white mb-1">Acceso Anticipado</h3>
               <p className="text-xs text-gray-500 uppercase tracking-widest">Cupos limitados para Q4 2025</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-mono text-neon-main mb-2 block uppercase font-bold tracking-wider">Nombre Completo</label>
                <div className="flex items-center bg-tech-input border border-gray-border rounded-lg px-4 py-3 focus-within:border-neon-main focus-within:shadow-neon transition-all group">
                  <User size={18} className="text-gray-500 mr-3 group-focus-within:text-neon-main transition-colors" />
                  <input 
                    name="name" // Importante para FormData
                    type="text" 
                    required 
                    className="bg-transparent w-full text-white focus:outline-none placeholder-gray-600 font-sans" 
                    placeholder="Dr. Juan Pérez" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-neon-main mb-2 block uppercase font-bold tracking-wider">Email Corporativo</label>
                <div className="flex items-center bg-tech-input border border-gray-border rounded-lg px-4 py-3 focus-within:border-neon-main focus-within:shadow-neon transition-all group">
                  <Mail size={18} className="text-gray-500 mr-3 group-focus-within:text-neon-main transition-colors" />
                  <input 
                    name="email" // Importante para FormData
                    type="email" 
                    required 
                    className="bg-transparent w-full text-white focus:outline-none placeholder-gray-600 font-sans" 
                    placeholder="contacto@clinica.com" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-neon-main mb-2 block uppercase font-bold tracking-wider">Teléfono</label>
                <div className="flex items-center bg-tech-input border border-gray-border rounded-lg px-4 py-3 focus-within:border-neon-main focus-within:shadow-neon transition-all group">
                  <Phone size={18} className="text-gray-500 mr-3 group-focus-within:text-neon-main transition-colors" />
                  <input 
                    name="phone" // Importante para FormData
                    type="tel" 
                    required 
                    className="bg-transparent w-full text-white focus:outline-none placeholder-gray-600 font-sans" 
                    placeholder="+54 9 11..." 
                  />
                </div>
              </div>

              <button 
                disabled={loading} 
                className="w-full bg-neon-main hover:bg-neon-dark text-tech-black font-bold py-4 mt-6 rounded-lg transition-all flex justify-center items-center gap-2 uppercase tracking-wide text-sm shadow-neon hover:shadow-neon-strong disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>Solicitar Acceso <ArrowRight size={18} /></>
                )}
              </button>
              
              <p className="text-[10px] text-center text-gray-500 mt-4">
                Al enviar este formulario aceptas nuestra política de privacidad y términos de uso. Datos encriptados end-to-end.
              </p>
            </form>
          </GlassCard>
        </div>
      </div>
    </section>
  );
};