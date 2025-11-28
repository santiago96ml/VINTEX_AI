import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { SocialButtons } from '../features/auth/SocialButtons';

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
      password: formData.get('password'),
      fullName: 'Usuario Nuevo' 
    };

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        navigate('/login');
      } else {
        const err = await response.json();
        alert(err.error || "Error al registrarse");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-10 flex items-center justify-center p-4 relative overflow-hidden bg-tech-black">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-main/5 rounded-full blur-[150px] -z-10" />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[450px]">
        <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 shadow-2xl">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Crea tu cuenta</h2>
            <p className="text-gray-400 text-sm">Obtén acceso completo a la plataforma VINTEX AI</p>
          </div>

          <SocialButtons />

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <span className="relative bg-[#0A0A0A] px-3 text-[10px] uppercase tracking-widest text-gray-500 font-mono">
              O con email
            </span>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative group">
               <Mail className="absolute left-5 top-4 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
               <input 
                 name="email" 
                 type="email" 
                 required 
                 className="w-full bg-[#1A1A1A] border border-white/10 rounded-full py-4 pl-14 pr-6 text-white outline-none focus:border-neon-main/50 transition-all placeholder-gray-600 text-sm"
                 placeholder="Correo electrónico"
               />
            </div>
            
            <div className="relative group">
               <Lock className="absolute left-5 top-4 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
               <input 
                 name="password" 
                 type="password" 
                 required 
                 className="w-full bg-[#1A1A1A] border border-white/10 rounded-full py-4 pl-14 pr-6 text-white outline-none focus:border-neon-main/50 transition-all placeholder-gray-600 text-sm"
                 placeholder="Contraseña"
               />
            </div>
            
            <button 
              disabled={loading}
              className="w-full bg-white hover:bg-gray-200 text-black font-bold py-4 rounded-full transition-all flex items-center justify-center mt-2 text-[15px]"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Continuar"}
            </button>
          </form>

          <div className="text-center mt-8 text-sm">
            <span className="text-gray-500">¿Ya tienes cuenta? </span>
            <Link to="/login" className="text-neon-main font-medium hover:underline">
              Inicia sesión
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
};