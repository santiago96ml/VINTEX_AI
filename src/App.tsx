import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabaseClient';
import { Loader2 } from 'lucide-react'; 

import { ParticleNetwork } from './components/canvas/ParticleNetwork';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Toaster } from "@/components/ui/toaster"

import { Home } from './pages/Home';
import { Solutions } from './pages/Solutions';
import { Technology } from './pages/Technology';
import { SuccessStories } from './pages/SuccessStories';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Demo } from './pages/Demo';
import { UserDashboard } from './pages/dashboard/UserDashboard'; 
import { Onboarding } from './pages/Onboarding'; 

const API_URL = 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- AUTH GUARD (Sin Bucles Infinitos) ---
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función única de verificación
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const publicRoutes = ['/', '/login', '/register', '/soluciones', '/tecnologia', '/casos-exito', '/demo'];
        const isPublicRoute = publicRoutes.some(path => location.pathname === path || location.pathname.startsWith(path + '/'));

        if (!session) {
          if (!isPublicRoute) navigate('/login');
        } else {
          // LLAMADA AL BACKEND (Una sola vez por cambio de ruta)
          const response = await fetch(`${API_URL}/api/config/init-session`, {
              headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            const isOnboardingPage = location.pathname === '/onboarding';
            const isAuthEntryPage = location.pathname === '/login' || location.pathname === '/register';
            const isHomePage = location.pathname === '/';

            if (data.hasClinic) {
                // Si tiene clínica -> Dashboard
                if (isOnboardingPage || isAuthEntryPage || isHomePage) {
                    navigate('/dashboard', { replace: true });
                }
            } else {
                // Si es nuevo -> Onboarding
                if (location.pathname.startsWith('/dashboard') || isHomePage) {
                    navigate('/onboarding', { replace: true });
                }
            }
          }
        }
      } catch (error) {
        console.error("Error AuthCheck:", error);
      } finally {
        setLoading(false);
      }
    };

    // Ejecutar verificación
    checkSession();

    // Solo escuchamos SIGNED_OUT para sacar al usuario, evitamos el bucle de actualizaciones
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') navigate('/login');
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]); // Se ejecuta solo cuando cambias de página

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-neon-main animate-spin" />
            <p className="text-gray-400 text-sm animate-pulse">Conectando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

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