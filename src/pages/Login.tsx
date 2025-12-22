import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { setApiUrl } from '../lib/api'; // Importamos la nueva función
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { GlassCard } from '../components/ui/GlassCard';

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Autenticación con Supabase (Capa Auth Global)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.session) throw new Error('No session created');

      // 2. CONSULTAR AL MOTOR MAESTRO: "¿Quién es este usuario?"
      // Usamos la URL original del .env para esta pregunta inicial
      const masterUrl = import.meta.env.VITE_API_URL || 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host/';
      
      const initResponse = await fetch(`${masterUrl}/api/config/init-session`, {
        headers: {
          'Authorization': `Bearer ${data.session.access_token}`
        }
      });

      if (!initResponse.ok) throw new Error('Error inicializando sesión en el motor.');

      const config = await initResponse.json();

      // 3. LÓGICA DE REDIRECCIÓN O CAMBIO DE ENCHUFE
      
      // CASO A: Redirección a Frontend Dedicado (URL externa)
      if (config.redirect && config.url) {
        toast({ title: "Redirigiendo...", description: "Accediendo a tu entorno dedicado." });
        window.location.href = config.url;
        return;
      }

      // CASO B: Backend Satélite (Mismo Frontend, distinta API)
      if (config.backendUrl) {
        console.log("🔌 Conectando a infraestructura:", config.backendUrl);
        setApiUrl(config.backendUrl); // Guardamos la nueva URL
      }

      // 4. NAVEGACIÓN
      if (config.hasClinic) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error de acceso",
        description: error.message || "Credenciales incorrectas.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-neon-main/30">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20 flex flex-col items-center justify-center min-h-[80vh]">
        
        {/* Decorative Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-main/10 rounded-full blur-[100px] -z-10" />

        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Bienvenido de nuevo</h1>
            <p className="text-gray-400">Accede a tu ecosistema digital</p>
          </div>

          <GlassCard className="p-8 border-white/10 backdrop-blur-xl">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nombre@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:border-neon-main/50 focus:ring-neon-main/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link to="#" className="text-xs text-neon-main hover:text-neon-main/80">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/40 border-white/10 text-white focus:border-neon-main/50 focus:ring-neon-main/20"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-neon-main text-black hover:bg-emerald-400 font-medium h-11"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              ¿Aún no tienes cuenta?{' '}
              <Link to="/register" className="text-neon-main hover:underline">
                Crear cuenta
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};