import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabaseClient';

import { ParticleNetwork } from './components/canvas/ParticleNetwork';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Toaster } from "@/components/ui/toaster"

// Importación de páginas
import { Home } from './pages/Home';
import { Solutions } from './pages/Solutions';
import { Technology } from './pages/Technology';
import { SuccessStories } from './pages/SuccessStories';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Demo } from './pages/Demo';
import { UserDashboard } from './pages/dashboard/UserDashboard'; 
import { Onboarding } from './pages/Onboarding'; // Asegúrate de importar esto

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- AUTH GUARD: El Portero Inteligente ---
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Rutas públicas donde NO se fuerza login
      const publicRoutes = ['/', '/login', '/register', '/soluciones', '/tecnologia', '/casos-exito', '/demo'];
      // Verificamos si la ruta actual es pública (exacta o empieza con...)
      const isPublicRoute = publicRoutes.some(path => location.pathname === path || location.pathname.startsWith(path + '/'));

      if (!session) {
        // Si NO hay usuario y trata de entrar a ruta privada -> Login
        if (!isPublicRoute && location.pathname !== '/') {
           navigate('/login');
        }
      } else {
        // SI HAY USUARIO: Verificamos si ya completó el registro (tiene clínica)
        // Usamos .maybeSingle() para evitar el error 406 si no existe
        const { data: clinic } = await supabase
          .from('web_clinica')
          .select('id')
          .eq('ID_USER', session.user.id)
          .maybeSingle(); 

        const isOnboardingPage = location.pathname === '/onboarding';
        const isDashboardPage = location.pathname.startsWith('/dashboard');
        // Si está en home o login estando logueado
        const isAuthEntryPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';

        if (clinic) {
          // USUARIO VIEJO (Tiene clínica):
          // Si intenta ir a onboarding o login -> Mandar al Dashboard
          if (isOnboardingPage || isAuthEntryPage) {
            navigate('/dashboard');
          }
        } else {
          // USUARIO NUEVO (No tiene clínica):
          // Si intenta ir a Dashboard o está en Home/Login -> Mandar a Onboarding
          if (isDashboardPage || isAuthEntryPage) {
            navigate('/onboarding');
          }
        }
      }
      setLoading(false);
    };

    checkSession();

    // Escuchar cambios de sesión en vivo
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) checkSession();
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  if (loading) return <div className="min-h-screen bg-tech-black flex items-center justify-center text-neon-main">Cargando Vintex AI...</div>;

  return <>{children}</>;
};

// Componente Layout para ocultar Navbar/Footer en Dashboard y Onboarding
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideLayoutPaths = ['/dashboard', '/onboarding'];
  const shouldHideLayout = hideLayoutPaths.some(path => location.pathname.startsWith(path));

  return (
    <>
      {!shouldHideLayout && <Navbar />}
      {children}
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
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard/*" element={<UserDashboard />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthGuard>
        <main className="relative bg-tech-black text-gray-main min-h-screen font-sans selection:bg-neon-main selection:text-black overflow-x-hidden">
          <ParticleNetwork />
          <Layout>
            <AnimatedRoutes />
          </Layout>
          <Toaster />
        </main>
      </AuthGuard>
    </Router>
  );
}

export default App;