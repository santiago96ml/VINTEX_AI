import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, FileText, CreditCard, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'survey' | 'payment' | 'building'>('survey');

  // URL del Backend Maestro
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-master.vintex.net.br';

  const handleSurveySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep('payment'); // Pasar al pago tras llenar datos
  };

  const handlePaymentAndBuild = async () => {
    setLoading(true);
    setStep('building'); // Mostrar pantalla de "Construyendo"

    try {
      // Recuperar sesión guardada en Login/Register
      const sessionStr = localStorage.getItem('vintex_session');
      if (!sessionStr) throw new Error("No hay sesión. Regístrate primero.");
      const session = JSON.parse(sessionStr);

      // Datos del formulario (puedes usar estados para capturarlos)
      const businessData = {
        companyName: (document.getElementById('companyName') as HTMLInputElement).value,
        description: (document.getElementById('description') as HTMLTextAreaElement).value,
        requirements: "Gestión de turnos y clientes"
      };

      // LLAMADA AL BACKEND MAESTRO
      const response = await fetch(`${API_URL}/api/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(businessData)
      });

      if (!response.ok) throw new Error('Error iniciando la automatización');

      toast({ title: "¡Pago exitoso!", description: "Tu sistema se está creando..." });
      
      // Esperar unos segundos para efecto visual o redirigir
      setTimeout(() => navigate('/dashboard'), 3000);

    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: error.message });
      setStep('payment'); // Volver atrás si falla
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tech-black flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl w-full">
        
        {/* PASO 1: CUESTIONARIO */}
        {step === 'survey' && (
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 flex gap-3 items-center">
              <Building2 className="text-neon-main" /> Configura tu Espacio
            </h2>
            <form onSubmit={handleSurveySubmit} className="space-y-6">
              <div>
                <label className="text-gray-400 block mb-2">Nombre de tu Empresa</label>
                <input id="companyName" required className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-4 text-white focus:border-neon-main outline-none" placeholder="Ej: Clínica San Lucas" />
              </div>
              <div>
                <label className="text-gray-400 block mb-2">¿A qué se dedican? (Para la IA)</label>
                <textarea id="description" required rows={4} className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-4 text-white focus:border-neon-main outline-none" placeholder="Somos una clínica dental con 3 doctores..." />
              </div>
              <button type="submit" className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors">
                Continuar al Pago
              </button>
            </form>
          </div>
        )}

        {/* PASO 2: PAGO (Simulado) */}
        {step === 'payment' && (
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 text-center">
            <CreditCard className="w-16 h-16 text-neon-main mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Suscripción Pro</h2>
            <p className="text-gray-400 mb-8">$29.99 / mes - Cancela cuando quieras</p>
            
            <button onClick={handlePaymentAndBuild} disabled={loading} className="w-full bg-neon-main hover:bg-neon-main/80 text-black font-bold py-4 rounded-xl transition-colors flex justify-center items-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : "Pagar y Crear Sistema"}
            </button>
          </div>
        )}

        {/* PASO 3: CONSTRUYENDO */}
        {step === 'building' && (
          <div className="text-center">
            <Loader2 className="w-20 h-20 text-neon-main animate-spin mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">La IA está trabajando...</h2>
            <p className="text-gray-400">Diseñando base de datos, configurando servidores y aplicando permisos.</p>
          </div>
        )}

      </motion.div>
    </div>
  );
};