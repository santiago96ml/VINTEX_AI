import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { ParticleNetwork } from './components/canvas/ParticleNetwork';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Importación de páginas
import { Home } from './pages/Home';
import { Solutions } from './pages/Solutions';
import { Technology } from './pages/Technology';
import { SuccessStories } from './pages/SuccessStories';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Demo } from './pages/Demo';
import { UserDashboard } from './pages/dashboard/UserDashboard'; 

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Componente Layout para manejar la lógica de mostrar/ocultar Navbar y Footer
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  // Definimos las rutas donde NO queremos que aparezca el Navbar/Footer
  const hideLayoutPaths = ['/dashboard'];

  // Verificamos si la ruta actual empieza con alguna de las rutas excluidas
  const shouldHideLayout = hideLayoutPaths.some(path => location.pathname.startsWith(path));

  return (
    <>
      {/* Solo mostramos Navbar si NO estamos en dashboard */}
      {!shouldHideLayout && <Navbar />}
      
      {children}
      
      {/* Solo mostramos Footer si NO estamos en dashboard */}
      {!shouldHideLayout && <Footer />}
    </>
  );
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
        
        {/* Envolvemos las rutas con el Layout condicional */}
        <Layout>
          <AnimatedRoutes />
        </Layout>
        
      </main>
    </Router>
  );
}

export default App;