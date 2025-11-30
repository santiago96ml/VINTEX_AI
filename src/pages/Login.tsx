import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { SocialButtons } from '../features/auth/SocialButtons';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host';

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
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Credenciales inválidas');

      localStorage.setItem('vintex_session', JSON.stringify(result.session));
      localStorage.setItem('vintex_user', JSON.stringify(result.user));
      navigate('/'); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center p-4 relative overflow-hidden bg-tech-black">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-main/5 rounded-full blur-[120px] -z-10" />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[450px]">
        
        <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 shadow-2xl">
          
          <div className="text-center mb-8">
             <div className="w-10 h-10 bg-neon-main rounded-lg mx-auto flex items-center justify-center font-bold text-black text-xl mb-4 shadow-[0_0_15px_rgba(0,255,153,0.4)]">V</div>
             <h2 className="text-2xl font-bold text-white mb-1">Bienvenido de nuevo</h2>
             <p className="text-gray-400 text-sm">Ingresa a tu panel de control</p>
          </div>

          <SocialButtons />

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <span className="relative bg-[#0A0A0A] px-3 text-[10px] uppercase tracking-widest text-gray-500 font-mono">O con email</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-3 text-red-400 text-xs mb-4">
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            <div className="relative group">
                <Mail className="absolute left-5 top-4 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
                <input 
                  name="email" type="email" required 
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-full py-4 pl-14 pr-6 text-white outline-none focus:border-neon-main/50 transition-all placeholder-gray-600 text-sm"
                  placeholder="Correo electrónico"
                />
            </div>
            
            <div className="relative group">
                <Lock className="absolute left-5 top-4 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
                <input 
                  name="password" type="password" required 
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-full py-4 pl-14 pr-6 text-white outline-none focus:border-neon-main/50 transition-all placeholder-gray-600 text-sm"
                  placeholder="Contraseña"
                />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-neon-main hover:bg-neon-dark text-black font-bold py-4 rounded-full transition-all flex items-center justify-center gap-2 mt-2 text-[15px]"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Iniciar Sesión"}
            </button>
          </form>

          <div className="text-center mt-8 text-sm">
            <span className="text-gray-500">¿No tienes cuenta? </span>
            <Link to="/register" className="text-neon-main font-medium hover:underline">
              Regístrate
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
};