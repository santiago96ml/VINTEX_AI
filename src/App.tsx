import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabaseClient'; // Asegúrate de tener este cliente exportado

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
// IMPORTA LA PÁGINA QUE FALTABA
import { Onboarding } from './pages/Onboarding';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- COMPONENTE AUTH GUARD (EL PORTERO) ---
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Lista de rutas públicas donde NO debe ejecutarse la redirección
      const publicRoutes = ['/', '/login', '/register', '/soluciones', '/tecnologia', '/casos-exito', '/demo'];
      const isPublicRoute = publicRoutes.includes(location.pathname);

      if (!session) {
        // Si no hay sesión y trata de entrar a dashboard u onboarding, mandar a login
        if (!isPublicRoute) {
          navigate('/login');
        }
      } else {
        // SI HAY SESIÓN: Verificar si ya completó el onboarding (tiene clínica)
        const { data: clinic } = await supabase
          .from('web_clinica')
          .select('id')
          .eq('ID_USER', session.user.id)
          .single();

        const isOnboardingPage = location.pathname === '/onboarding';
        const isDashboardPage = location.pathname.startsWith('/dashboard');

        if (clinic) {
          // CASO A: Ya tiene clínica (Usuario Antiguo/Configurado)
          // Si intenta ir a onboarding o login, lo mandamos al dashboard
          if (isOnboardingPage || location.pathname === '/login' || location.pathname === '/register') {
            navigate('/dashboard');
          }
        } else {
          // CASO B: NO tiene clínica (Usuario Nuevo)
          // Si intenta ir al dashboard, lo forzamos a ir a onboarding
          if (isDashboardPage) {
            navigate('/onboarding');
          }
          // Si acaba de loguearse (está en login/register o home), mandar a onboarding
          if (location.pathname === '/login' || location.pathname === '/register') {
            navigate('/onboarding');
          }
        }
      }
      setLoading(false);
    };

    checkSession();

    // Escuchar cambios en tiempo real (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        // Si se desconecta, no forzar nada, dejar que el usuario navegue o vaya a home
      } else {
        checkSession(); // Si se conecta, volver a verificar estado
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  // Pantalla de carga mientras verifica
  if (loading) return <div className="min-h-screen bg-tech-black flex items-center justify-center text-neon-main">Cargando...</div>;

  return <>{children}</>;
};

// Componente Layout para manejar la lógica de mostrar/ocultar Navbar y Footer
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  // Ocultar Navbar/Footer en Dashboard y en Onboarding
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
        {/* RUTA AGREGADA PARA EL CUESTIONARIO */}
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
      {/* Envolvemos todo en AuthGuard para proteger las rutas */}
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