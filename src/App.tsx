import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout & UI
import { ParticleNetwork } from './components/canvas/ParticleNetwork';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { Home } from './pages/Home';
import { Solutions } from './pages/Solutions';
import { Technology } from './pages/Technology';
import { SuccessStories } from './pages/SuccessStories';
import { Login } from './pages/Login';
import { Demo } from './pages/Demo';

// Componente para scroll top al cambiar de ruta
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <main className="relative bg-tech-black text-gray-main min-h-screen font-sans selection:bg-neon-main selection:text-black overflow-x-hidden">
        
        {/* Fondo Global */}
        <ParticleNetwork />
        
        {/* Navegación Global */}
        <Navbar />
        
        {/* Sistema de Rutas con Animaciones de Salida/Entrada */}
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/soluciones" element={<Solutions />} />
            <Route path="/tecnologia" element={<Technology />} />
            <Route path="/casos-exito" element={<SuccessStories />} />
            <Route path="/login" element={<Login />} />
            <Route path="/demo" element={<Demo />} />
          </Routes>
        </AnimatePresence>

        {/* Footer Global (Opcional: podrías ocultarlo en Login) */}
        <Footer />
        
      </main>
    </Router>
  );
}

export default App;