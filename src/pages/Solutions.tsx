import React from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Clock, RefreshCw } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { StartTrial } from '../features/landing/StartTrial';

export const Solutions: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      className="pt-32 min-h-screen relative z-10"
    >
      <div className="container mx-auto px-6 mb-24">
        <div className="text-center mb-16">
          <span className="text-neon-main font-mono text-sm uppercase tracking-widest">// Soluciones Modulares</span>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 mb-6">
            Flujos Clínicos <span className="bg-cyber-gradient bg-clip-text text-transparent">Autónomos</span>
          </h1>
          <p className="text-gray-muted max-w-2xl mx-auto text-lg">
            Nuestros agentes de IA no solo responden; ejecutan acciones complejas dentro de su CRM/EHR existente.
          </p>
        </div>

        {/* 3 TARJETAS HOLOGRÁFICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            {
              icon: CalendarCheck,
              title: "Confirmación Omnicanal",
              desc: "WhatsApp, Email y SMS orquestados para lograr una tasa de confirmación del 92%."
            },
            {
              icon: RefreshCw,
              title: "Reprogramación Inteligente",
              desc: "Si un paciente cancela, la IA ofrece el hueco instantáneamente a la lista de espera."
            },
            {
              icon: Clock,
              title: "Lista de Espera Dinámica",
              desc: "Algoritmos de prioridad que rellenan huecos de agenda en menos de 5 minutos."
            }
          ].map((item, i) => (
            <GlassCard key={i} className="group hover:bg-neon-main/5 transition-all duration-500">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neon-main mb-6 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(0,255,153,0.3)] transition-all">
                <item.icon size={28} />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </GlassCard>
          ))}
        </div>

        {/* CICLO DEL PACIENTE ANIMADO */}
        <div className="max-w-4xl mx-auto bg-tech-card/50 rounded-3xl border border-white/5 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-main to-transparent opacity-30" />
          <h2 className="text-3xl font-display font-bold text-white text-center mb-12">El Ciclo Neural</h2>
          
          <div className="relative">
            {/* Línea conectora vertical */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-white/10 md:-translate-x-1/2" />
            
            {[
              { title: "Cita Agendada", sub: "Integración directa con ERP" },
              { title: "Recordatorio IA", sub: "T-minus 24h vía WhatsApp" },
              { title: "Confirmación/Cambio", sub: "NLP procesa la respuesta" },
              { title: "Encuesta Post-Cita", sub: "NPS y Google Reviews automático" }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className={`relative flex items-center gap-6 mb-12 ${i % 2 !== 0 ? 'md:flex-row-reverse text-right' : ''}`}
              >
                {/* Dot Central */}
                <div className="absolute left-6 md:left-1/2 w-4 h-4 bg-tech-black border-2 border-neon-main rounded-full md:-translate-x-1/2 z-10 shadow-[0_0_10px_#00FF99]" />
                
                <div className={`flex-1 pl-16 md:pl-0 ${i % 2 !== 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-neon-main/30 transition-colors">
                    <h4 className="text-white font-bold font-display text-lg">{step.title}</h4>
                    <p className="text-sm text-gray-500 font-mono">{step.sub}</p>
                  </div>
                </div>
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      <StartTrial />
    </motion.div>
  );
};