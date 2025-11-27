import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

export const Demo: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen pt-32 pb-20 relative z-10"
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* LADO IZQUIERDO: BENEFICIOS */}
          <div className="flex-1 lg:sticky lg:top-32">
            <span className="text-neon-main font-mono text-sm uppercase tracking-widest">// Schedule Demo</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mt-4 mb-6">
              Vea el futuro de su clínica en <span className="text-neon-gradient">tiempo real</span>
            </h1>
            <p className="text-gray-muted text-lg mb-8 leading-relaxed">
              Agende una demostración personalizada de 30 minutos con un arquitecto de soluciones de VINTEX. Analizaremos sus cuellos de botella actuales y le mostraremos cómo nuestra IA los disuelve.
            </p>
            
            <div className="space-y-4">
              {[
                "Auditoría rápida de procesos actuales",
                "Demo en vivo del dashboard de IA",
                "Proyección de ROI a 6 meses",
                "Setup del entorno de prueba"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-white">
                  <CheckCircle2 className="text-neon-main" size={20} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LADO DERECHO: FORMULARIO */}
          <div className="flex-1 w-full">
            <GlassCard className="border-neon-main/20 shadow-neon">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-xs text-gray-500 uppercase font-bold">Nombre</label>
                     <input type="text" className="w-full bg-tech-input border border-white/10 rounded p-3 text-white focus:border-neon-main outline-none" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs text-gray-500 uppercase font-bold">Apellido</label>
                     <input type="text" className="w-full bg-tech-input border border-white/10 rounded p-3 text-white focus:border-neon-main outline-none" />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs text-gray-500 uppercase font-bold">Email Corporativo</label>
                   <input type="email" className="w-full bg-tech-input border border-white/10 rounded p-3 text-white focus:border-neon-main outline-none" />
                </div>

                <div className="space-y-2">
                   <label className="text-xs text-gray-500 uppercase font-bold">Software de Gestión Actual (ERP)</label>
                   <select className="w-full bg-tech-input border border-white/10 rounded p-3 text-white focus:border-neon-main outline-none">
                     <option>Seleccionar...</option>
                     <option>SAP Health</option>
                     <option>Salesforce Health Cloud</option>
                     <option>MV</option>
                     <option>Tasy</option>
                     <option>Otro / Excel</option>
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-xs text-gray-500 uppercase font-bold">Tamaño de la Clínica</label>
                   <select className="w-full bg-tech-input border border-white/10 rounded p-3 text-white focus:border-neon-main outline-none">
                     <option>1-5 Doctores</option>
                     <option>5-20 Doctores</option>
                     <option>20+ Doctores (Enterprise)</option>
                   </select>
                </div>

                <button className="w-full py-4 bg-neon-main hover:bg-neon-dark text-black font-bold uppercase tracking-widest rounded shadow-[0_0_20px_rgba(0,255,153,0.4)] transition-all">
                  Confirmar Reunión
                </button>
              </form>
            </GlassCard>
          </div>

        </div>
      </div>
    </motion.div>
  );
};