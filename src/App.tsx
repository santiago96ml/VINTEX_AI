import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabaseClient';

import { Navbar } from './components/layout/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Demo } from './pages/Demo';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { UserDashboard } from './pages/dashboard/UserDashboard';
import { Loader2 } from 'lucide-react';

// CONSTANTE DE ADMIN (Idealmente esto también se valida en el backend con RLS)
const ADMIN_EMAIL = "mercadolunasantiago944@gmail.com";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// Componente para proteger rutas
const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-tech-black"><Loader2 className="animate-spin text-neon-main" /></div>;
  
  if (!user) return <Navigate to="/login" replace />;

  if (requireAdmin && user.email !== ADMIN_EMAIL) {
    return <Navigate to="/dashboard" replace />; // Si intenta entrar a admin y no es admin, va a dashboard normal
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <main className="relative bg-tech-black text-gray-main min-h-screen font-sans selection:bg-neon-main selection:text-black overflow-x-hidden">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<><Navbar /><Home /></>} />
            <Route path="/login" element={<><Navbar /><Login /></>} />
            <Route path="/register" element={<><Navbar /><Register /></>} />
            <Route path="/demo" element={<><Navbar /><Demo /></>} />

            {/* Rutas Privadas - USUARIO (Doctor/Clínica) */}
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                 <UserDashboard />
              </ProtectedRoute>
            } />

            {/* Rutas Privadas - ADMINISTRADOR (Tú) */}
            <Route path="/admin/*" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </AnimatePresence>
      </main>
    </Router>
  );
}

export default App;