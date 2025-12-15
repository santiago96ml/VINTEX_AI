import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { SocialButtons } from '../features/auth/SocialButtons';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // CORRECCIÓN DE CONEXIÓN
  const API_URL = 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host';

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      full_name: formData.get('fullName'),
      email: formData.get('email'),
      password: formData.get('password')
    };

    try {
      console.log("Enviando registro a:", `${API_URL}/api/register`);
      
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al registrarse.');
      }

      if (result.session) {
          localStorage.setItem('vintex_session', JSON.stringify(result.session));
          localStorage.setItem('vintex_user', JSON.stringify(result.user));
          navigate('/onboarding');
      } else {
          navigate('/login');
      }

    } catch (err: any) {
      console.error("Error de registro:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center p-4 relative overflow-hidden bg-tech-black">
      {/* ... (Resto del diseño igual) ... */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-neon-main/5 rounded-full blur-[120px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-[450px]"
      >
        <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 shadow-2xl backdrop-blur-xl">
          
          <div className="text-center mb-8">
             <h2 className="text-3xl font-bold text-white mb-2">Crear Cuenta</h2>
             <p className="text-gray-400 text-sm">Comienza tu prueba gratuita hoy</p>
          </div>

          <SocialButtons />

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <span className="relative bg-[#0A0A0A] px-3 text-[10px] uppercase tracking-widest text-gray-500 font-mono">Registro Manual</span>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-3 text-red-400 text-xs animate-pulse">
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            <div className="relative group">
                <User className="absolute left-5 top-4 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
                <input 
                  name="fullName" 
                  type="text" 
                  required 
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-full py-4 pl-14 pr-6 text-white outline-none focus:border-neon-main/50 transition-all placeholder-gray-600 text-sm" 
                  placeholder="Nombre completo" 
                />
            </div>

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
                  placeholder="Contraseña segura" 
                />
            </div>

            <button 
              disabled={loading} 
              className="w-full bg-white hover:bg-gray-200 text-black font-bold py-4 rounded-full transition-all flex items-center justify-center gap-2 mt-4 text-[15px]"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Registrarse"} <ArrowRight size={18} />
            </button>
          </form>

          <div className="text-center mt-8 text-sm border-t border-white/5 pt-6">
            <span className="text-gray-500">¿Ya tienes cuenta? </span>
            <Link to="/login" className="text-neon-main font-medium hover:underline">Inicia Sesión</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};