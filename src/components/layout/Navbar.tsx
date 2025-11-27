import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const navLinks = [
    { name: 'Soluciones', path: '/soluciones' },
    { name: 'Tecnología', path: '/tecnologia' },
    { name: 'Casos de Éxito', path: '/casos-exito' },
    { name: 'Contacto', path: '/demo' } // Redirigimos contacto a Demo para conversión
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
      scrolled || isOpen
        ? "bg-tech-black/90 backdrop-blur-md border-white/5 py-4 shadow-neon/10" 
        : "bg-transparent py-6"
    )}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer group select-none">
          <div className="w-8 h-8 bg-neon-main rounded flex items-center justify-center font-bold text-tech-black font-display text-xl group-hover:shadow-neon transition-all">
            V
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-white">
            VINTEX <span className="text-neon-main">AI</span>
          </span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={cn(
                "text-sm font-medium transition-colors uppercase tracking-wide font-display hover:text-neon-main",
                location.pathname === item.path ? "text-neon-main" : "text-gray-muted"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-white hover:text-neon-main transition-colors">
            Login
          </Link>
          <Link to="/demo">
            <button className="px-5 py-2 rounded bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-neon-main hover:text-tech-black hover:border-neon-main transition-all duration-300 shadow-lg hover:shadow-neon">
              Agendar Demo
            </button>
          </Link>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button 
          className="md:hidden text-white hover:text-neon-main transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-tech-black border-b border-white/10 p-6 flex flex-col gap-6 animate-in slide-in-from-top-5">
           {navLinks.map((item) => (
            <Link 
              key={item.name} 
              to={item.path}
              onClick={() => setIsOpen(false)}
              className="text-lg font-display text-white hover:text-neon-main"
            >
              {item.name}
            </Link>
          ))}
          <div className="h-px bg-white/10 w-full" />
          <Link to="/login" onClick={() => setIsOpen(false)} className="text-center text-gray-400">Login</Link>
          <Link to="/demo" onClick={() => setIsOpen(false)}>
             <button className="w-full py-3 bg-neon-main text-black font-bold rounded">Agendar Demo</button>
          </Link>
        </div>
      )}
    </nav>
  );
};