import React, { useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import Records from '@/components/Records';
import Budgets from '@/components/Budgets';
import NetWorth from '@/components/NetWorth';
import Profile from '@/components/Profile';
import Settings from '@/components/Settings';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import FloatingActionButton from '@/components/FloatingActionButton';
import LandingPage from '@/components/LandingPage';
import Login from '@/components/Login';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useMediaQuery } from '@/hooks/use-media-query';
import ConnectBanks from '@/components/ConnectBanks';
import AIChatButton from '@/components/AIChatButton';

// Admin Panel
import {
  AdminRoute,
  AdminLayout,
  AdminDashboard,
  NotificationsManager,
  TicketsManager,
  UsersManager
} from '@/components/admin';

// Componente principal de la App (Dashboard)
function MainApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [hidden, setHidden] = useState(false);
  const mainContentRef = useRef(null);
  const navigate = useNavigate();

  const { scrollY } = useScroll({ container: mainContentRef });

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  // Escuchar evento de cambio de vista desde Header
  React.useEffect(() => {
    const handleChangeView = (e) => {
      if (e.detail) {
        setCurrentView(e.detail);
      }
    };
    window.addEventListener('changeView', handleChangeView);
    return () => window.removeEventListener('changeView', handleChangeView);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard setCurrentView={setCurrentView} />;
      case 'records':
        return <Records />;
      case 'budgets':
        return <Budgets />;
      case 'networth':
        return <NetWorth />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'connect_banks':
        return <ConnectBanks />;
      default:
        return <Dashboard setCurrentView={setCurrentView} />;
    }
  };

  const handleSetCurrentView = (view) => {
    setCurrentView(view);
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - Financia Suite</title>
        <meta name="description" content="Gestiona tus finanzas personales con Financia Suite. Dashboard con metricas en tiempo real." />
      </Helmet>

      <div className="flex h-screen">
        {!isMobile && (
          <Sidebar
            currentView={currentView}
            setCurrentView={handleSetCurrentView}
          />
        )}

        <div className="flex flex-col flex-1 w-full overflow-hidden">
          <Header isMobile={isMobile} />
          {/* Contenedor scrolleable con Flexbox Sticky Footer */}
          <div
            ref={mainContentRef}
            className={`flex-1 overflow-y-auto ${isMobile ? 'pb-24' : ''}`}
          >
            {/* Wrapper interno con min-height para sticky footer */}
            <div className="min-h-full flex flex-col">
              {/* Main content con flex-1 empuja el footer hacia abajo */}
              <main className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentView}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderView()}
                  </motion.div>
                </AnimatePresence>
              </main>
              {/* Footer siempre al final */}
              <Footer setCurrentView={handleSetCurrentView} />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-16 md:bottom-8 right-4 md:right-8 z-50 flex flex-col items-end gap-3">
        <AIChatButton hidden={hidden} />
        <FloatingActionButton hidden={hidden} />
      </div>
      {isMobile && <BottomNav currentView={currentView} setCurrentView={handleSetCurrentView} />}
    </>
  );
}

// Landing Page Wrapper con navegacion
function LandingPageWrapper() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    // Si ya esta autenticado, ir al dashboard. Si no, ir a login.
    navigate(isAuthenticated ? '/app' : '/login');
  };

  return (
    <>
      <Helmet>
        <title>App Control de Gastos Gratis | Financia Suite - Finanzas Personales con IA</title>
        <meta name="description" content="App gratis para controlar gastos y administrar tu dinero. Registra ingresos, crea presupuestos, ahorra mas con consejos de IA. La mejor app de finanzas personales en espanol." />
        <meta name="keywords" content="app control de gastos, app finanzas personales gratis, como administrar mi dinero, presupuesto personal app, app para ahorrar dinero, control de gastos gratis, gestionar finanzas, app gastos e ingresos, organizar mis finanzas, finanzas personales gratis, app de presupuesto, administrador de gastos, control financiero personal" />

        {/* Open Graph */}
        <meta property="og:title" content="App Control de Gastos Gratis | Financia Suite" />
        <meta property="og:description" content="La app mas simple para controlar tus gastos y ahorrar dinero. Gratis, con IA y en espanol." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://financiasuite.com" />
        <meta property="og:image" content="https://financiasuite.com/og-image.jpg" />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:site_name" content="Financia Suite" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="App Control de Gastos Gratis | Financia Suite" />
        <meta name="twitter:description" content="Controla tus gastos, crea presupuestos y ahorra mas con IA. 100% gratis y en espanol." />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Financia Suite" />
        <link rel="canonical" href="https://financiasuite.com" />
      </Helmet>

      <LandingPage onGetStarted={handleGetStarted} />
    </>
  );
}

// Componente para redirigir si ya esta autenticado
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Si ya esta autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return children;
}

// App Principal con Router
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <FinanceProvider>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Landing Page - Ruta principal */}
                <Route path="/" element={<LandingPageWrapper />} />

                {/* Auth Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />

                {/* App Dashboard - Requiere autenticacion */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <MainApp />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/*"
                  element={
                    <ProtectedRoute>
                      <MainApp />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Panel Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <AdminDashboard />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/notifications"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <NotificationsManager />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/tickets"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <TicketsManager />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <UsersManager />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />

                {/* Fallback - Redirigir a landing */}
                <Route path="*" element={<LandingPageWrapper />} />
              </Routes>

              <Toaster />
            </div>
          </FinanceProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
