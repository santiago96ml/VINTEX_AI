import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Loader2, AlertTriangle, UserPlus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Leemos la URL del backend
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email'),
      password: formData.get('password')
    };

    try {
      // Petición real al Backend (Supabase Auth)
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Credenciales inválidas');
      }

      // Login Exitoso
      console.log('✅ Usuario autenticado:', result.user);
      
      // Guardamos la sesión (Token)
      localStorage.setItem('vintex_session', JSON.stringify(result.session));
      localStorage.setItem('vintex_user', JSON.stringify(result.user));
      
      // Redirigir (Por ahora al Home, luego podrías crear /dashboard)
      navigate('/'); 
      // Opcional: Un toast o alerta bonita
      // alert(`Bienvenido, ${result.user.name || 'Usuario'}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center relative z-10 p-6 overflow-hidden">
      
      {/* Fondo animado */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-main/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-20"
      >
        <div className="text-center mb-8">
           <Link to="/" className="inline-block hover:scale-105 transition-transform">
             <div className="w-12 h-12 bg-gradient-to-br from-neon-main to-neon-teal rounded-xl mx-auto flex items-center justify-center font-bold text-black text-2xl mb-4 shadow-neon">V</div>
           </Link>
           <h2 className="text-3xl font-display font-bold text-white mb-2">Acceso Neural</h2>
           <p className="text-gray-500 text-sm">Gestiona tu clínica con inteligencia artificial</p>
        </div>

        <GlassCard className="!p-8 border-neon-main/20 shadow-2xl backdrop-blur-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-3 text-red-400 text-xs"
              >
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* EMAIL */}
            <div>
              <label className="text-[10px] text-neon-main font-mono uppercase font-bold mb-1.5 block tracking-widest ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-neon-main transition-colors" size={18} />
                <input 
                  name="email"
                  type="email" 
                  required
                  className="w-full bg-tech-input border border-white/5 focus:border-neon-main rounded-lg py-3 pl-12 pr-4 text-white outline-none transition-all placeholder-gray-600 focus:shadow-[0_0_20px_rgba(0,255,153,0.1)]"
                  placeholder="ejemplo@clinica.com"
                />
              </div>
            </div>
            
            {/* PASSWORD */}
            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="text-[10px] text-neon-main font-mono uppercase font-bold tracking-widest">Contraseña</label>
                <a href="#" className="text-[10px] text-gray-500 hover:text-white transition-colors">¿Olvidaste tu clave?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-neon-main transition-colors" size={18} />
                <input 
                  name="password"
                  type="password" 
                  required
                  className="w-full bg-tech-input border border-white/5 focus:border-neon-main rounded-lg py-3 pl-12 pr-4 text-white outline-none transition-all placeholder-gray-600 focus:shadow-[0_0_20px_rgba(0,255,153,0.1)]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* BOTÓN LOGIN */}
            <button 
              disabled={loading}
              className="w-full bg-neon-main hover:bg-neon-dark text-black font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm shadow-neon hover:shadow-neon-strong hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Ingresar <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* DIVISOR */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#121212] px-2 text-gray-500 font-mono">¿Aún no tienes cuenta?</span>
            </div>
          </div>

          {/* BOTÓN REGISTRO (Estilo Secundario) */}
          <Link to="/register">
            <button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-medium py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm group">
              <UserPlus size={18} className="text-gray-400 group-hover:text-neon-main transition-colors" />
              Solicitar Prueba Gratuita
            </button>
          </Link>

        </GlassCard>
      </motion.div>
    </div>
  );
};