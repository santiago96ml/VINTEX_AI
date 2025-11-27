import React from 'react';
import { Calendar, MessageSquare, Video, RefreshCw, BarChart2, HeartPulse } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

// Definimos los datos de los servicios aquí
const services = [
  {
    icon: Calendar,
    title: "Agendamiento Neural",
    desc: "Sincronización inteligente que elimina huecos en la agenda. Recordatorios automáticos vía WhatsApp para reducir el ausentismo."
  },
  {
    icon: MessageSquare,
    title: "Asistente IA 24/7",
    desc: "Chatbot entrenado con NLP capaz de triaje básico, responder dudas frecuentes y calificar pacientes potenciales mientras duermes."
  },
  {
    icon: Video,
    title: "Telemedicina Encriptada",
    desc: "Consultas remotas en alta definición con seguridad de grado militar. Integrado directamente en la historia clínica."
  },
  {
    icon: HeartPulse,
    title: "Historia Clínica Digital",
    desc: "Acceso centralizado a diagnósticos y tratamientos. UX optimizada para que los médicos pasen menos tiempo escribiendo."
  },
  {
    icon: RefreshCw,
    title: "Automatización de Flujos",
    desc: "Desde la captación del lead hasta el seguimiento post-consulta. Automatiza facturación, recetas y encuestas de satisfacción."
  },
  {
    icon: BarChart2,
    title: "Analytics Predictivo",
    desc: "Tableros de control en tiempo real. Prevé la demanda estacional y optimiza los recursos de tu clínica con datos duros."
  }
];

export const FeaturesGrid: React.FC = () => {
  return (
    <section className="py-32 bg-tech-black bg-grid-pattern relative">
      {/* Fondo degradado sutil para dar profundidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-tech-black via-transparent to-tech-black pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-20">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Arquitectura <span className="bg-clip-text text-transparent bg-cyber-gradient">Modular</span>
          </h2>
          <p className="text-gray-muted max-w-2xl text-lg">
            Seleccione los módulos que su clínica necesita. Escalabilidad nativa desde consultorios privados hasta redes hospitalarias complejas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <GlassCard key={i} className="group hover:bg-white/5 bg-tech-card border border-white/5 hover:border-neon-main/30 transition-all duration-300">
              <div className="w-12 h-12 bg-tech-black border border-white/10 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-neon-main group-hover:border-neon-main/50 transition-all mb-6 shadow-lg group-hover:shadow-neon">
                <s.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-display group-hover:text-neon-main transition-colors">
                {s.title}
              </h3>
              <p className="text-gray-muted text-sm leading-relaxed">
                {s.desc}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};