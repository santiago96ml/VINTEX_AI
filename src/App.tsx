import React from 'react';
import { ParticleNetwork } from './components/canvas/ParticleNetwork';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './features/landing/Hero';
import { TrustedBy } from './features/landing/TrustedBy';
import { ComparisonSection } from './features/landing/ComparisonSection';
import { FeaturesGrid } from './features/landing/FeaturesGrid';
import { StartTrial } from './features/landing/StartTrial';

// Nota: DashboardPreview y Pricing se mantienen o eliminan según necesidad estricta, 
// aquí priorizo lo solicitado explícitamente en el prompt actual.

function App() {
  return (
    <main className="relative bg-tech-black text-gray-main min-h-screen font-sans selection:bg-neon-main selection:text-black overflow-x-hidden">
      
      {/* 1. Capa Fondo Canvas (Lightweight) */}
      <ParticleNetwork />
      
      {/* 2. Navegación Sticky */}
      <Navbar />
      
      <div className="relative z-10 flex flex-col gap-0">
        
        {/* Hero Masivo */}
        <Hero />
        
        {/* Logos/Trust */}
        <TrustedBy />
        
        {/* Tabla Comparativa (Red vs Green) */}
        <ComparisonSection />
        
        {/* Grid de 6 Servicios (Nina Structure) */}
        <FeaturesGrid />
        
        {/* Formulario de Captura Final */}
        <StartTrial />
        
        <Footer />
        
      </div>
    </main>
  );
}

export default App;