import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../components/ui/GlassCard';

export const DashboardPreview: React.FC = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      
      {/* Luz de fondo ambiental detrás del dashboard */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-neon-main/20 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-6 perspective-1000">
        <motion.div
          initial={{ opacity: 0, rotateX: 20, y: 100 }}
          whileInView={{ opacity: 1, rotateX: 10, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, type: "spring", bounce: 0.2 }}
          style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
          className="relative max-w-5xl mx-auto"
        >
          {/* MARCO DE LA VENTANA (BROWSER MOCKUP) */}
          <div className="relative rounded-xl bg-[#0F0F0F] border border-white/10 shadow-neon-lg overflow-hidden group hover:rotate-x-0 transition-transform duration-700 ease-out">
            
            {/* Header de la ventana (Puntos estilo Mac) */}
            <div className="h-10 border-b border-white/5 bg-tech-card flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              <div className="ml-4 px-3 py-1 rounded bg-black/40 text-[10px] text-gray-500 font-mono border border-white/5">
                vintex-dashboard.app
              </div>
            </div>

            {/* CONTENIDO INTERNO DEL DASHBOARD (Falso UI con CSS) */}
            <div className="flex h-[500px] md:h-[600px]">
              
              {/* Sidebar */}
              <div className="w-64 border-r border-white/5 bg-tech-card/50 p-6 hidden md:flex flex-col gap-6">
                <div className="h-8 w-24 bg-white/5 rounded animate-pulse" />
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 w-full rounded hover:bg-white/5 flex items-center px-2 transition-colors cursor-pointer">
                      <div className="w-4 h-4 rounded-full bg-white/10 mr-3" />
                      <div className="h-2 w-20 bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Área Principal */}
              <div className="flex-1 bg-tech-black p-6 md:p-10 relative">
                {/* Header Interno */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                    <div className="h-8 w-64 bg-white/20 rounded" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-neon-main/20 border border-neon-main/50" />
                </div>

                {/* Grid de Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[1, 2, 3].map((i) => (
                    <GlassCard key={i} className="!p-5 !bg-tech-card">
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-8 w-8 rounded bg-neon-main/10 flex items-center justify-center text-neon-main">
                          $
                        </div>
                        <span className="text-neon-main text-xs font-mono">+12%</span>
                      </div>
                      <div className="h-6 w-24 bg-white/20 rounded mb-2" />
                      <div className="h-3 w-16 bg-white/10 rounded" />
                    </GlassCard>
                  ))}
                </div>

                {/* Gráfico Grande Simulado */}
                <GlassCard className="!p-0 overflow-hidden h-64 relative flex items-end justify-between px-6 pb-0 pt-10">
                   {/* Barras del gráfico */}
                   {[40, 70, 45, 90, 60, 80, 50, 95, 30, 65].map((h, i) => (
                      <div 
                        key={i} 
                        className="w-full mx-1 bg-gradient-to-t from-neon-main/5 to-neon-main/40 hover:from-neon-main/20 hover:to-neon-main/80 transition-all duration-300 rounded-t-sm"
                        style={{ height: `${h}%` }}
                      />
                   ))}
                   {/* Línea decorativa */}
                   <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                </GlassCard>

              </div>
            </div>

            {/* Reflejo de cristal sobre la pantalla */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20" />
            
          </div>
        </motion.div>
      </div>
    </section>
  );
};