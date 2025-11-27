import React from 'react';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-main/10 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-main/30 bg-neon-main/5 text-neon-main text-xs font-mono mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-main opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-main"></span>
          </span>
          VINTEX AI 2.0 // SYSTEM ONLINE
        </motion.div>

        <h1 className="text-5xl md:text-8xl font-bold font-display tracking-tight leading-[1.1] mb-6 text-white">
          Infraestructura Neural <br />
          <span className="bg-cyber-gradient bg-clip-text text-transparent drop-shadow-lg">
            Para Salud Digital
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-muted max-w-2xl mx-auto mb-10 font-light leading-relaxed">
          Elimine el 40% del ausentismo clínico. Orquestación automática de pacientes mediante IA, sin intervención humana.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          <button className="group relative px-8 py-4 bg-neon-main text-tech-black font-bold text-lg rounded-none skew-x-[-10deg] hover:shadow-neon transition-all">
            <div className="skew-x-[10deg] flex items-center gap-2">
              Prueba Gratuita 15 Días <ArrowRight size={20} />
            </div>
          </button>
          
          <button className="flex items-center gap-3 text-gray-main hover:text-neon-main transition-colors font-medium">
            <PlayCircle size={24} /> Ver Demo Interactiva
          </button>
        </div>
      </div>
    </section>
  );
};