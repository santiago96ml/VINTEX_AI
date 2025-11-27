import React from 'react';
import { X, Check, AlertTriangle, Cpu } from 'lucide-react';
// import { GlassCard } from '../../components/ui/GlassCard'; // Lo comenté porque no se usa en este bloque

export const ComparisonSection: React.FC = () => {
  // 1. Datos para el lado del CAOS (Lo que queremos evitar)
  const chaosItems = [
    "Pérdida de Leads por demora",
    "Agendamiento manual propenso a errores",
    "Atención limitada a horario comercial",
    "Datos dispersos en Excel/Papel",
    "Seguimiento inexistente"
  ];

  // 2. Datos para el lado de VINTEX (La solución)
  const vintexItems = [
    "Captura y calificación instantánea",
    "Agendamiento automático 24/7",
    "Respuestas con IA en < 2 segundos",
    "Centralización total en CRM",
    "Reactividad y seguimiento automático"
  ];

  return (
    <section className="py-24 bg-tech-black relative z-10">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-center mb-16">
          Evolución <span className="text-neon-main">Inevitable</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-5xl mx-auto">
          {/* LADO IZQUIERDO: CAOS (Rojo) */}
          <div className="p-8 md:p-12 bg-red-950/10 border border-red-900/30 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none relative overflow-hidden group hover:bg-red-950/20 transition-colors duration-500">
            <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay" />
            
            <div className="flex items-center gap-3 mb-8 text-red-500">
              <AlertTriangle />
              <h3 className="text-xl font-bold font-display uppercase tracking-widest">Caos Manual</h3>
            </div>
            
            <ul className="space-y-6">
              {/* CORRECCIÓN: Ahora mapeamos sobre el array chaosItems */}
              {chaosItems.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-500 line-through decoration-red-900/50">
                  <X size={18} className="text-red-800 flex-shrink-0" /> 
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* LADO DERECHO: VINTEX (Verde Neón) */}
          <div className="p-8 md:p-12 bg-tech-card border border-neon-main/30 rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none relative shadow-neon transform md:scale-105 z-10 transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-neon-main text-tech-black text-xs font-bold px-2 py-1 rounded-sm">VINTEX OS</span>
            </div>
            
            <div className="flex items-center gap-3 mb-8 text-neon-main">
              <Cpu className="animate-pulse-slow" />
              <h3 className="text-xl font-bold font-display uppercase tracking-widest">Automatización IA</h3>
            </div>
            
            <ul className="space-y-6">
              {/* CORRECCIÓN: Ahora mapeamos sobre el array vintexItems */}
              {vintexItems.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white font-medium">
                  <div className="p-1 bg-neon-main/20 rounded-full text-neon-main flex-shrink-0">
                    <Check size={14} strokeWidth={3} />
                  </div> 
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};