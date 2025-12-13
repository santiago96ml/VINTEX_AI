import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, FileText, CreditCard, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'survey' | 'payment' | 'building'>('survey');

  // ESTADO PARA GUARDAR LOS DATOS (Evita el error de null)
  const [formData, setFormData] = useState({
    companyName: '',
    description: ''
  });

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-master.vintex.net.br';

  const handleSurveySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.description.trim()) {
        toast({ variant: "destructive", title: "Campos vacíos", description: "Por favor completa la información de tu empresa." });
        return;
    }
    setStep('payment'); 
  };

  const handlePaymentAndBuild = async () => {
    setLoading(true);
    setStep('building'); 

    try {
      const sessionStr = localStorage.getItem('vintex_session');
      // Intento de recuperación de sesión si localStorage falla (ej: Google Login fresco)
      // Aunque AuthGuard ya garantiza sesión, esto es un fallback de seguridad.
      if (!sessionStr) {
         throw new Error("Sesión no detectada. Por favor recarga la página.");
      }
      const session = JSON.parse(sessionStr);

      // Usamos los datos del estado (formData) en lugar de buscar en el DOM
      const businessData = {
        companyName: formData.companyName,
        description: formData.description,
        requirements: "Gestión de turnos y clientes"
      };

      const response = await fetch(`${API_URL}/api/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(businessData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error iniciando la automatización');
      }

      toast({ title: "¡Todo listo!", description: "Tu sistema se está construyendo." });
      
      // Damos tiempo a n8n para que cree la fila en web_clinica
      setTimeout(() => navigate('/dashboard'), 4000);

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
                <input 
                  required 
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-4 text-white focus:border-neon-main outline-none placeholder-gray-600" 
                  placeholder="Ej: Clínica San Lucas"
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-2">¿A qué se dedican? (Para la IA)</label>
                <textarea 
                  required 
                  rows={4} 
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-4 text-white focus:border-neon-main outline-none placeholder-gray-600" 
                  placeholder="Ej: Somos una clínica dental con 3 doctores, necesitamos gestionar citas y expedientes..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
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