import React from 'react';
import { motion } from 'framer-motion';
import { Target, Lightbulb, Cpu, ShieldCheck, Rocket } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { cn } from '../../lib/utils';

export const AboutSection: React.FC = () => {
  return (
    <section className="py-32 relative z-10 overflow-hidden" id="nosotros">
      
      {/* Fondo Decorativo Sutil */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />
      <div className="absolute top-1/4 -right-64 w-[500px] h-[500px] bg-neon-teal/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6">
        
        {/* 1. HEADER: La Manifiesto */}
        <div className="max-w-4xl mx-auto text-center mb-24">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-neon-main font-mono text-sm tracking-widest uppercase mb-4 block"
          >
            // Sobre VINTEX AI
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold font-display text-white mb-8 leading-tight"
          >
            No somos otra agencia de software. <br />
            <span className="text-gray-500">Somos arquitectos de</span> <span className="text-neon-gradient">eficiencia clínica.</span>
          </motion.h2>
          <p className="text-xl text-gray-400 leading-relaxed">
            Nacimos en 2024 con una obsesión: eliminar el trabajo administrativo manual que roba tiempo a los doctores. 
            Creemos que la tecnología no debe ser una barrera, sino un exoesqueleto que potencia la medicina.
          </p>
        </div>

        {/* 2. GRID DE VALORES (Misión / Visión / Método) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            {
              icon: Target,
              title: "Nuestra Misión",
              text: "Democratizar la automatización de alto nivel. Que una clínica pequeña tenga la misma potencia tecnológica que un hospital de red.",
              color: "text-neon-main"
            },
            {
              icon: Lightbulb,
              title: "Nuestra Visión",
              text: "Un futuro donde el 'ausentismo' sea una palabra obsoleta y donde los doctores solo se preocupen por curar.",
              color: "text-yellow-400"
            },
            {
              icon: Cpu,
              title: "Tecnología",
              text: "No usamos plantillas. Desarrollamos algoritmos propios de IA predictiva y redes neuronales optimizadas para latencia cero.",
              color: "text-purple-400"
            }
          ].map((item, i) => (
            <GlassCard key={i} className="hover:border-neon-main/30 group">
              <div className={cn("w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", item.color)}>
                <item.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
            </GlassCard>
          ))}
        </div>

        {/* 3. HISTORIA / EVOLUCIÓN (Layout Zig-Zag) */}
        <div className="space-y-24">
          
          {/* Bloque 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 order-2 md:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-main/20 blur-2xl rounded-full -z-10" />
                <GlassCard className="!p-0 overflow-hidden border-neon-main/20 rotate-3 hover:rotate-0 transition-transform duration-500">
                  {/* Placeholder visual abstracto */}
                  <div className="h-64 bg-tech-card flex items-center justify-center relative">
                    <div className="grid grid-cols-6 gap-2 opacity-20">
                      {[...Array(24)].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded bg-neon-main animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                    <ShieldCheck size={64} className="text-white absolute z-10" />
                  </div>
                </GlassCard>
              </div>
            </div>
            <div className="flex-1 order-1 md:order-2 space-y-6">
              <h3 className="text-3xl font-bold font-display text-white">Seguridad como Cimiento</h3>
              <p className="text-gray-400 text-lg">
                Entendemos la sensibilidad de los datos médicos. Por eso, VINTEX AI no nació de un hackathon, sino de un diseño riguroso de ciberseguridad.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckIcon /> Encriptación AES-256 de extremo a extremo.
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckIcon /> Servidores locales para cumplimiento de soberanía de datos.
                </li>
              </ul>
            </div>
          </div>

          {/* Bloque 2 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h3 className="text-3xl font-bold font-display text-white">Velocidad Hipersónica</h3>
              <p className="text-gray-400 text-lg">
                En el tiempo que te toma leer esta frase, nuestro motor ya confirmó 15 citas, reprogramó 2 cancelaciones y envió recordatorios a 50 pacientes.
              </p>
              <div className="flex gap-4 pt-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-neon-main font-mono">0.05s</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Latencia</p>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-neon-main font-mono">24/7</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Uptime</p>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                 <div className="absolute inset-0 bg-neon-teal/20 blur-2xl rounded-full -z-10" />
                 <GlassCard className="!p-0 overflow-hidden border-neon-teal/20 -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="h-64 bg-tech-card flex items-center justify-center relative overflow-hidden">
                    {/* Efecto de velocidad */}
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Rocket size={64} className="text-white z-10" />
                    </div>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="absolute h-px w-full bg-white/20 top-[20%] left-0 animate-[scan_2s_linear_infinite]" style={{ top: `${i * 20}%`, animationDuration: `${1 + i * 0.5}s` }} />
                    ))}
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

// Icono helper pequeño
const CheckIcon = () => (
  <div className="w-5 h-5 rounded-full bg-neon-main/20 flex items-center justify-center text-neon-main shrink-0">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  </div>
);