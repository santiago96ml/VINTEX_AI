import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Sparkles, Terminal } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { api } from '../lib/api'; // Usamos la instancia configurada
import { Button } from '@/components/ui/button';
import { ChatViewer } from '../features/chat/ChatViewer';
import { useToast } from '@/hooks/use-toast';

export const Onboarding = () => {
  const [step, setStep] = useState<'chat' | 'building' | 'complete'>('chat');
  const [buildLog, setBuildLog] = useState<string[]>([]);
  const [isReadyToBuild, setIsReadyToBuild] = useState(false);
  const [summary, setSummary] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const logContainerRef = useRef<HTMLDivElement>(null);

  const handleAnalysisComplete = (data: { is_ready: boolean, summary: string }) => {
    if (data.is_ready) {
      setIsReadyToBuild(true);
      setSummary(data.summary);
    }
  };

  const handleStartBuild = async () => {
    setStep('building');
    setBuildLog(["🚀 Iniciando secuencia de construcción...", "📡 Conectando con Vintex Architect..."]);
    
    try {
      // Usamos 'api' que ya tiene el token y la URL correcta
      await api.post('/api/onboarding/complete', { conversationSummary: summary });
    } catch (error) {
      setBuildLog(prev => [...prev, "❌ Error crítico al iniciar construcción."]);
      toast({ variant: "destructive", title: "Error", description: "No se pudo iniciar la construcción." });
      setStep('chat');
    }
  };

  // Realtime Logs
  useEffect(() => {
    if (step !== 'building') return;

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase.channel('build_updates')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'web_clinica', filter: `ID_USER=eq.${user.id}` },
          (payload) => {
            const newData = payload.new;
            if (newData.build_log) {
              setBuildLog(prev => (prev[prev.length - 1] === newData.build_log ? prev : [...prev, newData.build_log]));
            }
            if (newData.status === 'active') {
              setStep('complete');
              setTimeout(() => navigate('/dashboard'), 2000);
            }
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };
    setupSubscription();
  }, [step, navigate]);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
  }, [buildLog]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <header className="h-16 border-b border-white/10 flex items-center px-8 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-neon-main animate-pulse" />
          <span className="font-bold tracking-tight">Vintex <span className="text-gray-500">Architect</span></span>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {step === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col h-full max-w-5xl mx-auto w-full p-4 md:p-8">
              <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
                <ChatViewer onAnalysisComplete={handleAnalysisComplete} />
                {isReadyToBuild && (
                  <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center items-end h-40 z-20">
                    <Button onClick={handleStartBuild} size="lg" className="bg-neon-main text-black hover:bg-emerald-400 font-bold px-8 shadow-[0_0_30px_rgba(0,229,153,0.4)] animate-bounce-slow">
                      <Sparkles className="mr-2 h-5 w-5" /> Construir mi Sistema Ahora <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {step === 'building' && (
            <motion.div key="building" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="w-full max-w-2xl bg-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-800">
                  <div className="flex items-center gap-2"><Terminal size={16} className="text-gray-400" /><span className="text-xs font-mono text-gray-400">root@vintex:~# build</span></div>
                  <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/20" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" /><div className="w-2.5 h-2.5 rounded-full bg-green-500/50 animate-pulse" /></div>
                </div>
                <div ref={logContainerRef} className="h-[400px] p-6 font-mono text-sm overflow-y-auto space-y-2 bg-black/90 backdrop-blur">
                  {buildLog.map((log, i) => (
                    <motion.div key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={`flex items-start gap-3 ${log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-neon-main' : 'text-gray-300'}`}>
                      <span className="text-gray-600">➜</span><span>{log}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div key="complete" className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-neon-main text-black flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(0,229,153,0.5)]"><Sparkles size={40} /></div>
              <h2 className="text-4xl font-bold mb-2">¡Sistema Listo!</h2>
              <p className="text-gray-400">Redirigiendo a tu dashboard...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};