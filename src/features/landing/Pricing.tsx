import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { cn } from '../../lib/utils';

// Datos de los planes
const plans = [
  {
    name: "Starter",
    price: { monthly: 99, yearly: 79 },
    description: "Para consultorios individuales que buscan modernizarse.",
    features: ["Gestión de 1 Doctor", "Agenda Inteligente", "Recordatorios por Email", "Soporte Básico"],
    missing: ["IA Predictiva", "Confirmación por WhatsApp", "Dashboard Financiero"],
    popular: false
  },
  {
    name: "Clinic AI",
    price: { monthly: 249, yearly: 199 },
    description: "La suite completa para clínicas de alto rendimiento.",
    features: ["Hasta 5 Doctores", "IA Predictiva de Ausentismo", "Bot de WhatsApp (Confirmaciones)", "Dashboard en Tiempo Real", "Soporte Prioritario 24/7"],
    missing: [],
    popular: true // Este es el que destacaremos
  },
  {
    name: "Enterprise",
    price: { monthly: "Custom", yearly: "Custom" },
    description: "Soluciones a medida para redes hospitalarias.",
    features: ["Doctores Ilimitados", "API Personalizada", "Gestor de Cuenta Dedicado", "On-premise Deployment", "SLA del 99.99%"],
    missing: [],
    popular: false
  }
];

export const Pricing: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="py-32 relative z-10" id="precios">
      <div className="container mx-auto px-6">
        
        {/* Header con Toggle */}
        <div className="flex flex-col items-center mb-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">
            Planes <span className="text-neon-gradient">Escalables</span>
          </h2>
          <p className="text-gray-muted text-lg mb-10 max-w-xl">
            Comience con la prueba gratuita de 15 días. Cancele en cualquier momento.
          </p>

          {/* Toggle Switch Personalizado */}
          <div 
            onClick={() => setIsYearly(!isYearly)}
            className="flex items-center p-1 bg-tech-card border border-white/10 rounded-full cursor-pointer relative w-64 h-12 select-none"
          >
            {/* Fondo deslizante (Pill) */}
            <motion.div 
              className="absolute bg-white/10 rounded-full h-10 w-[48%]"
              animate={{ x: isYearly ? "100%" : "0%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            
            <div className={cn("flex-1 text-sm font-medium z-10 transition-colors", !isYearly ? "text-white" : "text-gray-500")}>
              Mensual
            </div>
            <div className={cn("flex-1 text-sm font-medium z-10 transition-colors flex justify-center gap-2", isYearly ? "text-white" : "text-gray-500")}>
              Anual <span className="text-xs text-neon-main font-bold">-20%</span>
            </div>
          </div>
        </div>

        {/* Grid de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
          {plans.map((plan) => (
            <GlassCard 
              key={plan.name}
              // Si es popular, le damos borde neón y sombra
              className={cn(
                "flex flex-col relative", 
                plan.popular ? "border-neon-main/50 shadow-neon bg-tech-card/80 scale-105 z-10" : "opacity-80 hover:opacity-100"
              )}
              hoverEffect={false} // Desactivamos el efecto hover estándar para controlar nosotros el estilo
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neon-main text-black text-xs font-bold px-4 py-1 rounded-full shadow-[0_0_20px_rgba(0,255,153,0.5)] tracking-wider">
                  MÁS ELEGIDO
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-display text-white">
                    {typeof plan.price.monthly === 'number' 
                      ? `$${isYearly ? plan.price.yearly : plan.price.monthly}`
                      : plan.price.monthly}
                  </span>
                  {typeof plan.price.monthly === 'number' && (
                    <span className="text-gray-500">/mes</span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-4 h-10">{plan.description}</p>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                    <div className="mt-0.5 min-w-[16px]">
                      <Check size={16} className="text-neon-main" />
                    </div>
                    {feature}
                  </div>
                ))}
                {plan.missing.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                    <div className="mt-0.5 min-w-[16px]">
                      <X size={16} />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>

              <button className={cn(
                "w-full py-3 rounded-lg font-bold transition-all duration-300",
                plan.popular 
                  ? "bg-neon-main text-black hover:shadow-neon hover:scale-[1.02]" 
                  : "bg-white/5 border border-white/10 hover:bg-white/10 text-white"
              )}>
                {plan.name === "Enterprise" ? "Contactar Ventas" : "Comenzar Ahora"}
              </button>
            </GlassCard>
          ))}
        </div>

      </div>
    </section>
  );
};