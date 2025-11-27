import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className,
  hoverEffect = true 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        // Base: Fondo tech-card con 60% opacidad, borde sutil blanco
        "relative overflow-hidden rounded-2xl border border-white/5 bg-tech-card/60 backdrop-blur-xl p-6",
        "transition-all duration-500",
        // Hover: Borde Neon y Sombra Neon
        hoverEffect && "hover:border-neon-main/50 hover:shadow-neon hover:-translate-y-1",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};