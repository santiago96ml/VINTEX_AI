import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, CreditCard, Loader2, LogOut } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../lib/supabaseClient';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'survey' | 'payment' | 'building'>('survey');

  // 1. ESTADO PARA GUARDAR DATOS (Evita que se pierdan al cambiar de pantalla)
  const [formData, setFormData] = useState({
    companyName: '',
    description: ''
  });

const API_URL = 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('vintex_session');
    localStorage.removeItem('vintex_user');
    navigate('/login');
  };

  const handleSurveySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.description.trim()) {
        toast({ variant: "destructive", title: "Campos vacíos", description: "Por favor completa la información." });
        return;
    }
    setStep('payment'); 
  };

  const handlePaymentAndBuild = async () => {
    setLoading(true);
    setStep('building'); 

    try {
      console.log(`📡 Conectando a Backend en: ${API_URL}`); // Para depurar

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesión expirada. Por favor inicia sesión de nuevo.");

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
        // Intentar leer el error del backend si es posible
        const errText = await response.text();
        let errMsg = 'Error de conexión con el servidor.';
        try {
            const errJson = JSON.parse(errText);
            errMsg = errJson.error || errMsg;
        } catch (e) { console.warn("Respuesta no JSON:", errText); }
        
        throw new Error(errMsg);
      }

      toast({ title: "¡Éxito!", description: "Tu sistema se está construyendo..." });
      
      setTimeout(() => navigate('/dashboard'), 4000);

    } catch (error: any) {
      console.error("Error Onboarding:", error);
      toast({ variant: "destructive", title: "Error", description: error.message });
      setStep('payment'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tech-black flex items-center justify-center p-4 relative">
      
      <button 
        onClick={handleLogout} 
        className="absolute top-6 right-6 text-gray-500 hover:text-white flex items-center gap-2 text-sm transition-colors z-10"
      >
        <LogOut size={16} /> Cerrar Sesión
      </button>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl w-full">
        
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
                  placeholder="Ej: Somos una clínica dental..."
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