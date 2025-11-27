import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

export const Login: React.FC = () => {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center relative z-10 p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
           <div className="w-12 h-12 bg-neon-main rounded mx-auto flex items-center justify-center font-bold text-black text-2xl mb-4">V</div>
           <h2 className="text-3xl font-display font-bold text-white">Bienvenido de nuevo</h2>
           <p className="text-gray-500">Accede a tu panel de control neural</p>
        </div>

        <GlassCard className="!p-8 border-neon-main/20">
          <form className="space-y-6">
            <div>
              <label className="text-xs text-neon-main font-mono uppercase font-bold mb-2 block">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-neon-main transition-colors" size={18} />
                <input 
                  type="email" 
                  className="w-full bg-tech-input border-b-2 border-white/10 focus:border-neon-main rounded-t-lg py-3 pl-10 pr-4 text-white outline-none transition-all placeholder-gray-600"
                  placeholder="admin@clinica.com"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs text-neon-main font-mono uppercase font-bold mb-2 block">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-neon-main transition-colors" size={18} />
                <input 
                  type="password" 
                  className="w-full bg-tech-input border-b-2 border-white/10 focus:border-neon-main rounded-t-lg py-3 pl-10 pr-4 text-white outline-none transition-all placeholder-gray-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button className="w-full bg-neon-main hover:bg-neon-dark text-black font-bold py-3 rounded mt-4 transition-all flex items-center justify-center gap-2">
              Ingresar <ArrowRight size={18} />
            </button>
            
            <div className="text-center mt-4">
              <a href="#" className="text-xs text-gray-500 hover:text-white transition-colors">¿Olvidaste tu contraseña?</a>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};