import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { GlassCard } from '@/components/ui/GlassCard';
import { ParticleNetwork } from '@/components/canvas/ParticleNetwork';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import { SocialButtons } from '@/features/auth/SocialButtons';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast({
        title: "¡Bienvenido de nuevo!",
        description: "Has iniciado sesión correctamente.",
        className: "bg-green-500/10 border-green-500/20 text-white",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales incorrectas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Lógica para Google (por si SocialButtons necesita props o lógica extra)
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error con Google",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black selection:bg-neon-main selection:text-black font-sans text-white overflow-hidden relative flex flex-col">
      {/* Fondo Animado idéntico a Registro */}
      <div className="fixed inset-0 z-0">
        <ParticleNetwork />
      </div>

      <Navbar />

      <main className="flex-grow relative z-10 container mx-auto px-6 py-24 flex items-center justify-center">
        <GlassCard className="w-full max-w-md p-8 backdrop-blur-xl border-white/10 shadow-2xl shadow-neon-main/5 animate-in fade-in zoom-in-95 duration-500">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-2">
              Bienvenido a Vintex AI
            </h1>
            <p className="text-gray-400 text-sm">
              Inicia sesión para acceder a tu panel de control
            </p>
          </div>

          {/* Botones Sociales (Google) */}
          <div className="mb-6">
            <SocialButtons />
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/50 px-2 text-gray-500 font-mono backdrop-blur-sm">
                  O continúa con email
                </span>
              </div>
            </div>
          </div>

          {/* Formulario de Login */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-neon-main">
                Email Corporativo
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-focus-within:text-neon-main transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nombre@empresa.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-neon-main/50 focus:ring-neon-main/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-neon-main">
                  Contraseña
                </Label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-gray-400 hover:text-white transition-colors hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-focus-within:text-neon-main transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-neon-main/50 focus:ring-neon-main/20 transition-all"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-neon-main to-cyan-400 hover:from-neon-main/90 hover:to-cyan-400/90 text-black font-bold py-6 shadow-lg shadow-neon-main/20 transition-all duration-300 group mt-4"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/register" className="text-white hover:text-neon-main font-semibold transition-colors">
              Crear cuenta gratis
            </Link>
          </div>
        </GlassCard>
      </main>

      <Footer />
    </div>
  );
}