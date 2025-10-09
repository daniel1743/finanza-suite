
    import React, { useState, useRef } from 'react';
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
    import { ThemeProvider } from '@/contexts/ThemeContext';
    import { FinanceProvider } from '@/contexts/FinanceContext';
    import { useMediaQuery } from '@/hooks/use-media-query';
    import ConnectBanks from '@/components/ConnectBanks';
    import AIChatButton from '@/components/AIChatButton';

    function App() {
      const [currentView, setCurrentView] = useState('dashboard');
      const isMobile = useMediaQuery("(max-width: 768px)");
      const [hidden, setHidden] = useState(false);
      const mainContentRef = useRef(null);

      const { scrollY } = useScroll({ container: mainContentRef });

      useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious();
        if (latest > previous && latest > 150) {
          setHidden(true);
        } else {
          setHidden(false);
        }
      });

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
        <ThemeProvider>
          <FinanceProvider>
            <div className="min-h-screen bg-background">
              <Helmet>
                <title>FinanzApp - Tu Libertad Financiera</title>
                <meta name="description" content="Toma el control de tu dinero para alcanzar la libertad financiera. Visualización intuitiva, planificación proactiva y gestión de gastos compartidos." />
                <meta name="keywords" content="finanzas personales, presupuesto, ahorro, metas financieras, control de gastos, libertad financiera, app de finanzas" />
                <meta property="og:title" content="FinanzApp - Tu Asistente Financiero Personal" />
                <meta property="og:description" content="La herramienta más simple y efectiva para gestionar tus finanzas en el mercado hispanohablante." />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://images.unsplash.com/photo-1554224155-6726b3ff858f" />
                <meta name="twitter:card" content="summary_large_image" />
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
                    <div ref={mainContentRef} className={`flex-grow overflow-y-auto ${isMobile ? 'pb-24' : ''}`}>
                        <main>
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
                        <Footer setCurrentView={handleSetCurrentView} />
                    </div>
                </div>
              </div>
              
              <div className="fixed bottom-16 md:bottom-8 right-4 md:right-8 z-50 flex flex-col items-end gap-3">
                <AIChatButton hidden={hidden} />
                <FloatingActionButton hidden={hidden} />
              </div>
              {isMobile && <BottomNav currentView={currentView} setCurrentView={handleSetCurrentView} />}
              <Toaster />
            </div>
          </FinanceProvider>
        </ThemeProvider>
      );
    }

    export default App;
  