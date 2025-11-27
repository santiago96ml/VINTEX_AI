import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Server, Zap, Lock, Cpu, Globe } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { StartTrial } from '../features/landing/StartTrial';

export const Technology: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="pt-32 min-h-screen relative z-10"
    >
      <div className="container mx-auto px-6 mb-20">
        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 text-center">
          Stack <span className="text-neon-main">Tecnológico</span>
        </h1>
        <p className="text-center text-gray-muted max-w-2xl mx-auto mb-16">
          Seguridad de grado militar combinada con latencia ultra-baja. Diseñado para manejar datos sensibles de salud (HIPAA & GDPR).
        </p>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-auto md:h-[600px] max-w-6xl mx-auto">
          
          {/* Card 1: API Latency (Grande) */}
          <GlassCard className="md:col-span-2 md:row-span-1 bg-tech-card/80 flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-neon-main mb-2">
                <Zap className="animate-pulse" /> <span className="font-mono text-sm tracking-widest">REAL-TIME LATENCY</span>
              </div>
              <span className="text-4xl font-display font-bold text-white">&lt;50ms</span>
            </div>
            {/* Gráfico Simulado */}
            <div className="flex items-end gap-1 h-32 mt-4 opacity-50 group-hover:opacity-100 transition-opacity">
              {[40, 70, 45, 90, 60, 80, 50, 95, 30, 65, 55, 85, 45, 75, 60, 90].map((h, i) => (
                <div key={i} className="flex-1 bg-neon-main rounded-t-sm transition-all duration-300 group-hover:bg-neon-teal" style={{ height: `${h}%` }} />
              ))}
            </div>
          </GlassCard>

          {/* Card 2: Security (Cuadrada) */}
          <GlassCard className="md:col-span-1 md:row-span-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-neon-main/5 z-0" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-neon-main/30 shadow-[0_0_15px_rgba(0,255,153,0.2)]">
                <Lock size={32} className="text-neon-main" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">AES-256</h3>
              <p className="text-gray-500 text-xs uppercase tracking-wider">End-to-End Encryption</p>
            </div>
          </GlassCard>

          {/* Card 3: Neural Net (Cuadrada) */}
          <GlassCard className="md:col-span-1 md:row-span-1 bg-black relative overflow-hidden group">
             {/* Simulación visual de red neuronal */}
             <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-60 transition-opacity">
                <svg viewBox="0 0 100 100" className="w-full h-full stroke-neon-main fill-neon-main">
                  <circle cx="20" cy="20" r="2" /> <circle cx="80" cy="20" r="2" />
                  <circle cx="50" cy="50" r="2" /> <circle cx="20" cy="80" r="2" /> <circle cx="80" cy="80" r="2" />
                  <line x1="20" y1="20" x2="50" y2="50" strokeWidth="0.5" />
                  <line x1="80" y1="20" x2="50" y2="50" strokeWidth="0.5" />
                  <line x1="20" y1="80" x2="50" y2="50" strokeWidth="0.5" />
                  <line x1="80" y1="80" x2="50" y2="50" strokeWidth="0.5" />
                </svg>
             </div>
             <div className="absolute bottom-6 left-6 z-10">
               <h3 className="text-lg font-bold text-white flex items-center gap-2"><Cpu size={16}/> Neural Core</h3>
             </div>
          </GlassCard>

          {/* Card 4: Global Infra (Larga) */}
          <GlassCard className="md:col-span-2 md:row-span-1 flex items-center gap-6">
             <div className="p-4 bg-white/5 rounded-lg border border-white/10">
               <Globe size={32} className="text-white" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-white">Infraestructura Distribuida</h3>
               <p className="text-gray-400 text-sm mt-1">Nodos en AWS, Azure y On-Premise para garantizar uptime del 99.99%.</p>
             </div>
          </GlassCard>

        </div>
      </div>
      <StartTrial />
    </motion.div>
  );
};