import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
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
// import { Onboarding } from './pages/Onboarding'; // Desactivado

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- AUTH GUARD SIMPLIFICADO ---
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Definimos las rutas públicas explícitamente
        const publicRoutes = ['/', '/login', '/register', '/soluciones', '/tecnologia', '/casos-exito', '/demo'];
        const isPublicRoute = publicRoutes.some(path => location.pathname === path || location.pathname.startsWith(path + '/'));

        if (!session) {
          // Si NO hay sesión y el usuario intenta entrar a una ruta privada (ej: /dashboard),
          // lo mandamos al login.
          if (!isPublicRoute) {
            navigate('/login', { replace: true });
          }
          // Si está en una ruta pública (como Home '/'), NO hacemos nada, se queda ahí.
        } else {
          // Si HAY sesión:
          // 1. Evitamos que vuelva a entrar a Login o Register.
          // 2. Si intenta entrar a /onboarding, lo redirigimos al dashboard.
          const isAuthEntryPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/onboarding';
          
          if (isAuthEntryPage) {
            navigate('/dashboard', { replace: true });
          }
          // Nota: Si el usuario logueado entra a '/', se queda en Home. 
          // Si quieres que al entrar a '/' vaya directo al dashboard, descomenta la siguiente línea:
          // if (location.pathname === '/') navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error("Error AuthCheck:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') navigate('/'); // Al cerrar sesión, ir a Home
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]); 

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-neon-main animate-spin" />
            <p className="text-gray-400 text-sm animate-pulse">Cargando Vintex AI...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  // Ocultamos navbar/footer solo en dashboard y onboarding (aunque onboarding ya redirige)
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
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/soluciones" element={<Solutions />} />
        <Route path="/tecnologia" element={<Technology />} />
        <Route path="/casos-exito" element={<SuccessStories />} />
        <Route path="/demo" element={<Demo />} />
        
        {/* Rutas de Autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Redirección forzada: Onboarding -> Dashboard */}
        <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />
        
        {/* Ruta Privada */}
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