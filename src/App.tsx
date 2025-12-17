import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabaseClient';
import { Loader2 } from 'lucide-react'; // Importamos el icono para el loader bonito

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

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- AUTH GUARD (Blindado) ---
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Rutas que cualquiera puede ver (sin login)
      const publicRoutes = ['/', '/login', '/register', '/soluciones', '/tecnologia', '/casos-exito', '/demo'];
      const isPublicRoute = publicRoutes.some(path => location.pathname === path || location.pathname.startsWith(path + '/'));

      if (!session) {
        // Si no hay sesión y trata de entrar a ruta privada, al login
        if (!isPublicRoute) {
           navigate('/login');
        }
      } else {
        // --- SI HAY SESIÓN ---
        // Consultamos si ya completó el onboarding
        const { data: clinic } = await supabase
          .from('web_clinica')
          .select('id')
          .eq('ID_USER', session.user.id)
          .maybeSingle(); 

        const isOnboardingPage = location.pathname === '/onboarding';
        const isAuthEntryPage = location.pathname === '/login' || location.pathname === '/register';
        const isHomePage = location.pathname === '/';

        if (clinic) {
          // CASO A: Usuario Viejo (Ya tiene clínica)
          // Si intenta ir a Login, Registro, Home u Onboarding -> Lo mandamos al Dashboard
          if (isOnboardingPage || isAuthEntryPage || isHomePage) {
            navigate('/dashboard');
          }
        } else {
          // CASO B: Usuario Nuevo (No tiene clínica)
          // Si intenta ir a Dashboard o HOME -> Lo mandamos al Onboarding
          if (location.pathname.startsWith('/dashboard') || isHomePage) {
            navigate('/onboarding');
          }
        }
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        // Re-verificamos cada vez que cambia la auth para evitar bugs
        checkSession(); 
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  // --- LOADER BONITO (Restaurado) ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-neon-main animate-spin" />
            <p className="text-gray-400 text-sm animate-pulse">Iniciando sistema...</p>
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