import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { ParticleNetwork } from './components/canvas/ParticleNetwork';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Importación de tus páginas
import { Home } from './pages/Home';
import { Solutions } from './pages/Solutions';
import { Technology } from './pages/Technology';
import { SuccessStories } from './pages/SuccessStories';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Demo } from './pages/Demo';
// 1. IMPORTA EL DASHBOARD
import { UserDashboard } from './pages/dashboard/UserDashboard'; 

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/soluciones" element={<Solutions />} />
        <Route path="/tecnologia" element={<Technology />} />
        <Route path="/casos-exito" element={<SuccessStories />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 2. AGREGA ESTA RUTA NUEVA */}
        <Route path="/dashboard" element={<UserDashboard />} />
        
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <main className="relative bg-tech-black text-gray-main min-h-screen font-sans selection:bg-neon-main selection:text-black overflow-x-hidden">
        <ParticleNetwork />
        {/* Opcional: Podrías querer ocultar el Navbar en el dashboard */}
        <Navbar /> 
        <AnimatedRoutes />
        {/* Opcional: Podrías querer ocultar el Footer en el dashboard */}
        <Footer />
      </main>
    </Router>
  );
}

export default App;