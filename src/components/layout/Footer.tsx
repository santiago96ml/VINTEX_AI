import React from 'react';
import { Twitter, Linkedin, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 bg-tech-black border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-10">
          
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-neon-main to-neon-teal rounded-lg flex items-center justify-center font-bold text-black font-display">
                V
              </div>
              <span className="text-xl font-bold font-display text-white">
                VINTEX <span className="text-neon-main">AI</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm max-w-xs text-center md:text-left">
              Automatización clínica de próxima generación para el futuro de la salud.
            </p>
          </div>

          {/* Socials */}
          <div className="flex gap-6">
            {[Twitter, Linkedin, Github].map((Icon, i) => (
              <a key={i} href="#" className="text-gray-500 hover:text-neon-main transition-colors">
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <p>© 2024 VINTEX AI. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-400">Privacidad</a>
            <a href="#" className="hover:text-gray-400">Términos</a>
            <a href="#" className="hover:text-gray-400">Seguridad</a>
          </div>
        </div>
      </div>
    </footer>
  );
};