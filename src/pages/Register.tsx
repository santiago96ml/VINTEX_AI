import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Apple, Chrome, Smartphone, Lock, Mail } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { useNavigate, Link } from 'react-router-dom';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'), // Pedimos password real
      fullName: 'Nuevo Usuario'         // Simplificación visual
    };

    try {
      const response = await fetch(`${API_URL}/register`, { // Endpoint correcto
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        navigate('/login'); // Éxito -> Login
      } else {
        alert("Error al registrarse");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const SocialButton = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <button className="w-full py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium flex items-center justify-center gap-3 transition-all mb-3 text-sm">
      <Icon size={18} />
      {text}
    </button>
  );

  // Icono de Microsoft simple
  const MicrosoftIcon = () => (
    <svg width="18" height="18" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0H10.8696V10.8696H0V0Z" fill="#F25022"/>
      <path d="M12.1304 0H23V10.8696H12.1304V0Z" fill="#7FBA00"/>
      <path d="M0 12.1304H10.8696V23H0V12.1304Z" fill="#00A4EF"/>
      <path d="M12.1304 12.1304H23V23H12.1304V12.1304Z" fill="#FFB900"/>
    </svg>
  );

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-main/5 rounded-full blur-[120px] -z-10" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <GlassCard className="!p-10 !rounded-3xl border-white/10 shadow-2xl bg-[#0A0A0A]/90">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-bold text-white mb-2">Crea tu cuenta</h2>
            <p className="text-gray-400 text-sm">Obtén acceso completo a la plataforma VINTEX AI</p>
          </div>

          <SocialButton icon={Chrome} text="Continuar con Google" />
          <SocialButton icon={Apple} text="Continuar con Apple" />
          <SocialButton icon={MicrosoftIcon} text="Continuar con Microsoft" />
          <SocialButton icon={Smartphone} text="Continuar con el teléfono" />

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center"><span className="bg-[#0A0A0A] px-3 text-gray-500 text-xs uppercase font-mono">O con email</span></div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative group">
               <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
               <input 
                 name="email" 
                 type="email" 
                 required 
                 className="w-full bg-transparent border border-white/20 rounded-full py-3 px-12 text-white outline-none focus:border-neon-main transition-colors placeholder-gray-500"
                 placeholder="Correo electrónico"
               />
            </div>
            
            <div className="relative group">
               <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
               <input 
                 name="password" 
                 type="password" 
                 required 
                 className="w-full bg-transparent border border-white/20 rounded-full py-3 px-12 text-white outline-none focus:border-neon-main transition-colors placeholder-gray-500"
                 placeholder="Contraseña"
               />
            </div>
            
            <button 
              disabled={loading}
              className="w-full bg-white text-black font-bold py-3.5 rounded-full hover:bg-gray-200 transition-all flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Continuar"}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link to="/login" className="text-xs text-gray-500 hover:text-white transition-colors">
              ¿Ya tienes cuenta? <span className="text-neon-main underline">Inicia sesión</span>
            </Link>
          </div>

        </GlassCard>
      </motion.div>
    </div>
  );
};