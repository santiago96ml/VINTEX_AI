import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

export const SocialButtons = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      
      // 🟢 CORRECCIÓN: Forzamos que Google nos devuelva en la sala de la IA
      // Si el usuario es nuevo -> Cae perfecto en Onboarding.
      // Si es viejo -> El AuthGuard de App.tsx lo moverá al Dashboard después.
      const redirectUrl = `${window.location.origin}/onboarding`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl, 
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 mb-6">
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google" 
            className="w-5 h-5" 
          />
        )}
        <span>Continuar con Google</span>
      </button>
    </div>
  );
};