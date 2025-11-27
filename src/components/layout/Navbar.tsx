import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react'; // Agregué X para cerrar menú móvil si lo necesitas
import { cn } from '../../lib/utils';

export const Navbar: React.FC = () => {
  // CORRECCIÓN 1: Desestructuración correcta del estado
  const [scrolled, setScrolled] = useState(false);
  
  // Definimos los links aquí para poder mapearlos
  const navLinks = ['Soluciones', 'Tecnología', 'Casos de Éxito', 'Contacto'];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // CORRECCIÓN 2: Array de dependencias vacío cerrado correctamente

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
      scrolled 
        ? "bg-tech-black/80 backdrop-blur-md border-white/5 py-4 shadow-neon/10" 
        : "bg-transparent py-6"
    )}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center gap-2 cursor-pointer group select-none">
          <div className="w-8 h-8 bg-neon-main rounded flex items-center justify-center font-bold text-tech-black font-display text-xl group-hover:shadow-neon transition-all">
            V
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-white">
            VINTEX <span className="text-neon-main">AI</span>
          </span>
        </div>

        {/* LINKS DE ESCRITORIO */}
        <div className="hidden md:flex items-center gap-8">
          {/* CORRECCIÓN 3: Mapeo sobre el array navLinks */}
          {navLinks.map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
              className="text-sm font-medium text-gray-muted hover:text-neon-main transition-colors uppercase tracking-wide font-display"
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA (Call to Action) */}
        <div className="hidden md:flex items-center gap-4">
          <button className="text-sm font-medium text-white hover:text-neon-main transition-colors">
            Login
          </button>
          <button className="px-5 py-2 rounded bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-neon-main hover:text-tech-black hover:border-neon-main transition-all duration-300 shadow-lg hover:shadow-neon">
            Agendar Demo
          </button>
        </div>

        {/* BOTÓN MOBILE */}
        <button className="md:hidden text-white hover:text-neon-main transition-colors">
          <Menu />
        </button>
      </div>
    </nav>
  );
};