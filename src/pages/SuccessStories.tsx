import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { StartTrial } from '../features/landing/StartTrial';

export const SuccessStories: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="pt-32 min-h-screen relative z-10"
    >
      <div className="container mx-auto px-6">
        
        {/* HEADER CASO PRINCIPAL */}
        <div className="text-center mb-20">
          <div className="inline-block px-3 py-1 bg-neon-main/10 border border-neon-main/30 rounded-full text-neon-main text-xs font-mono mb-4">
            CASE STUDY: PROVIDA COMPLEXO MÉDICO
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-8">
            Resultados que <span className="text-neon-gradient">Hablan</span>
          </h1>
        </div>

        {/* KPI CARDS ANIMADAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            { label: "Reducción de Ausentismo", value: "39%", color: "text-neon-main" },
            { label: "Citas Gestionadas", value: "30M+", color: "text-white" },
            { label: "Satisfacción Paciente", value: "4.8/5", color: "text-yellow-400" }
          ].map((kpi, i) => (
            <GlassCard key={i} className="text-center py-12 border-neon-main/20">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className={`text-6xl font-display font-bold mb-4 ${kpi.color}`}
              >
                {kpi.value}
              </motion.div>
              <p className="text-gray-400 font-mono uppercase tracking-widest text-sm">{kpi.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* TESTIMONIALS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <GlassCard className="relative p-8 md:p-12">
            <Quote className="absolute top-8 right-8 text-white/5 w-16 h-16" />
            <p className="text-lg text-gray-300 italic leading-relaxed mb-6 relative z-10">
              "La implementación de Vintex AI redujo nuestra carga administrativa en un 60%. Ahora nuestros recepcionistas se enfocan en la experiencia presencial del paciente, no en el teléfono."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full" />
              <div>
                <h4 className="text-white font-bold">Dr. Roberto Fernández</h4>
                <p className="text-neon-main text-xs uppercase font-bold">Director Médico, Provida</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="relative p-8 md:p-12 bg-tech-card/30">
             <Quote className="absolute top-8 right-8 text-white/5 w-16 h-16" />
             <p className="text-lg text-gray-300 italic leading-relaxed mb-6 relative z-10">
               "Lo que más nos sorprendió fue la velocidad de integración. En 2 semanas ya teníamos el sistema confirmando turnos automáticamente vía WhatsApp."
             </p>
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-gray-700 rounded-full" />
               <div>
                 <h4 className="text-white font-bold">Lic. Ana M. Torres</h4>
                 <p className="text-gray-500 text-xs uppercase font-bold">Gerente de Operaciones</p>
               </div>
             </div>
          </GlassCard>
        </div>
      </div>
      <StartTrial />
    </motion.div>
  );
};