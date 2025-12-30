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
// ✅ IMPORTACIÓN NOMBRADA (Corrige el error de SyntaxError)
import { SocialButtons } from '@/features/auth/SocialButtons';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

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
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error de acceso",
        description: error.message || "Credenciales incorrectas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black selection:bg-neon-main selection:text-black font-sans text-white overflow-hidden relative flex flex-col">
      <div className="fixed inset-0 z-0 pointer-events-none"><ParticleNetwork /></div>
      <Navbar />
      <main className="flex-grow relative z-10 container mx-auto px-6 py-24 flex items-center justify-center">
        <GlassCard className="w-full max-w-md p-8 backdrop-blur-xl border-white/10 shadow-2xl shadow-neon-main/5 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-2">Bienvenido</h1>
            <p className="text-gray-400 text-sm">Ingresa a Vintex AI</p>
          </div>
          
          <div className="mb-6"><SocialButtons /></div>
          
          <div className="relative my-6">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
             <div className="relative flex justify-center text-xs uppercase"><span className="bg-black/50 px-2 text-gray-500 font-mono backdrop-blur-sm">O usa tu email</span></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-neon-main">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-focus-within:text-neon-main transition-colors" />
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="pl-10 bg-white/5 border-white/10 text-white focus:border-neon-main/50" placeholder="nombre@empresa.com"/>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-neon-main">Contraseña</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-focus-within:text-neon-main transition-colors" />
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required className="pl-10 bg-white/5 border-white/10 text-white focus:border-neon-main/50" placeholder="••••••••"/>
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-neon-main to-cyan-400 text-black font-bold py-6 mt-4 hover:shadow-neon-main/20" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <>Ingresar <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-400">¿Nuevo aquí? <Link to="/register" className="text-white hover:text-neon-main font-semibold">Crear cuenta</Link></div>
        </GlassCard>
      </main>
      <Footer />
    </div>
  );
}