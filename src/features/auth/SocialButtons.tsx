import React from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Smartphone } from 'lucide-react';

export const SocialButtons: React.FC = () => {
  
  const handleSocialLogin = async (provider: 'google' | 'apple' | 'azure' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          // Redirige al usuario aquí después del login
          redirectTo: `${window.location.origin}/dashboard`, 
        },
      });
      if (error) throw error;
    } catch (error: any) {
      alert(`Error con ${provider}: ${error.message}`);
    }
  };

  const handlePhoneLogin = () => {
    // La lógica de teléfono requiere un flujo de OTP (código SMS)
    // Por ahora mostramos un mensaje, pero Supabase lo soporta nativamente.
    alert("Para implementar Login con Teléfono, necesitas configurar un proveedor SMS en Supabase (ej. Twilio).");
  };

  // Iconos SVG personalizados para las marcas
  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4" />
      <path d="M12.24 24.0008C15.4765 24.0008 18.2058 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.24 24.0008Z" fill="#34A853" />
      <path d="M5.50253 14.3003C5.00309 12.8099 5.00309 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05" />
      <path d="M12.24 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.0344664 12.24 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.24 4.74966Z" fill="#EA4335" />
    </svg>
  );

  const MicrosoftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0H10.8696V10.8696H0V0Z" fill="#F25022"/>
      <path d="M12.1304 0H23V10.8696H12.1304V0Z" fill="#7FBA00"/>
      <path d="M0 12.1304H10.8696V23H0V12.1304Z" fill="#00A4EF"/>
      <path d="M12.1304 12.1304H23V23H12.1304V12.1304Z" fill="#FFB900"/>
    </svg>
  );

  const AppleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 384 512" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z"/>
    </svg>
  );

  const buttonClass = "w-full h-12 rounded-full bg-[#1A1A1A] border border-white/10 hover:border-white/30 hover:bg-[#252525] text-white font-medium flex items-center justify-center gap-3 transition-all mb-3 text-[15px]";

  return (
    <div className="w-full mb-6">
      <button onClick={() => handleSocialLogin('google')} className={buttonClass}>
        <GoogleIcon /> Continuar con Google
      </button>
      
      <button onClick={() => handleSocialLogin('apple')} className={buttonClass}>
        <AppleIcon /> Continuar con Apple
      </button>
      
      <button onClick={() => handleSocialLogin('azure')} className={buttonClass}>
        <MicrosoftIcon /> Continuar con Microsoft
      </button>
      
      <button onClick={handlePhoneLogin} className={buttonClass}>
        <Smartphone size={20} className="text-white" /> Continuar con el teléfono
      </button>
    </div>
  );
};