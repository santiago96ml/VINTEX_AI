import React from 'react';

// Componente de Logo (Placeholder estilizado)
const CompanyLogo = ({ name }: { name: string }) => (
  <div className="group flex items-center gap-3 cursor-pointer transition-all duration-300">
    {/* Icono Abstracto */}
    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 group-hover:border-neon-main/50 group-hover:bg-neon-main/10 flex items-center justify-center transition-all duration-300">
      <div className="w-3 h-3 rounded-full bg-gray-600 group-hover:bg-neon-main group-hover:shadow-[0_0_10px_#00FF99] transition-all duration-300" />
    </div>
    
    {/* Texto del Logo */}
    <span className="font-display font-bold text-lg text-gray-500 tracking-widest uppercase group-hover:text-white transition-colors duration-300">
      {name}
    </span>
  </div>
);

export const TrustedBy: React.FC = () => {
  const integrations = ["Tasy", "MV", "Totvs", "Salesforce", "SAP Health"];

  return (
    <section className="w-full py-10 border-y border-white/5 bg-tech-black relative z-20 overflow-hidden">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-8 md:gap-16">
        
        {/* Título de la sección */}
        <p className="text-xs text-neon-main font-mono uppercase tracking-widest whitespace-nowrap md:border-r border-white/10 md:pr-8 py-2">
          Sistemas integrados:
        </p>
        
        {/* Lista de Logos */}
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-12 gap-y-6 w-full opacity-60 hover:opacity-100 transition-opacity duration-500">
          {integrations.map((name) => (
            <CompanyLogo key={name} name={name} />
          ))}
        </div>

        {/* Degradados decorativos laterales (Efecto Fade) */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-tech-black to-transparent pointer-events-none md:hidden" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-tech-black to-transparent pointer-events-none md:hidden" />
      </div>
    </section>
  );
};