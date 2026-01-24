import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Moon, Sun, Edit, Gem, LogIn, LogOut, Palette, ShoppingBag, User, Info, X, Star, AlertTriangle, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card } from '@/components/ui/card';
import { useIsAdmin } from '@/components/admin';
import { supabase } from '@/lib/supabase';

// Componente Modal Global con Portal
const GlobalModal = ({ isOpen, onClose, children }) => {
  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[500px] bg-background flex flex-col"
          style={{
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            maxHeight: '90vh',
            maxWidth: '90%',
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

// Notificaciones iniciales
const initialNotifications = [
    {
      id: 1,
      title: "¡Bienvenido a Financia Suite!",
      description: "Tu viaje hacia la libertad financiera comienza ahora. Explora todas las funciones disponibles para tomar control de tus finanzas personales.",
      date: "hace 5 minutos"
    },
    {
      id: 2,
      title: "Recordatorio de presupuesto",
      description: "Has gastado el 80% de tu presupuesto de 'Alimentación'. Considera revisar tus gastos para mantenerte dentro del límite establecido.",
      date: "hace 2 horas"
    },
    {
      id: 3,
      title: "Nueva función disponible",
      description: "Ahora puedes usar el chat con IA para recibir consejos financieros personalizados. ¡Pruébalo haciendo clic en el botón de chat!",
      date: "ayer"
    }
  ];

const Header = ({ onMenuClick, isMobile }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [userName, setUserName] = useState('Usuario');
  const [userAvatar, setUserAvatar] = useState(null);

  // Estado de notificaciones
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Guardar notificaciones en localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Cargar nombre de usuario y avatar
  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    } else if (profile?.full_name) {
      setUserName(profile.full_name);
    } else if (user?.user_metadata?.full_name) {
      setUserName(user.user_metadata.full_name);
    } else if (user?.email) {
      setUserName(user.email.split('@')[0]);
    }

    // Cargar avatar - Prioridad: localStorage > profile > user metadata
    const savedProfilePhoto = localStorage.getItem('profilePhoto');
    if (savedProfilePhoto) {
      setUserAvatar(savedProfilePhoto);
    } else if (profile?.avatar_url) {
      setUserAvatar(profile.avatar_url);
    } else if (user?.user_metadata?.avatar_url) {
      setUserAvatar(user.user_metadata.avatar_url);
    }
  }, [user, profile]);

  // Escuchar cambios en localStorage (cuando se actualiza desde Settings)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedProfilePhoto = localStorage.getItem('profilePhoto');
      const savedName = localStorage.getItem('userName');
      if (savedProfilePhoto) setUserAvatar(savedProfilePhoto);
      if (savedName) setUserName(savedName);
    };

    // Escuchar evento storage (cambios desde otras pestañas)
    window.addEventListener('storage', handleStorageChange);

    // Escuchar evento personalizado (cambios desde la misma pestaña)
    window.addEventListener('profileUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleStorageChange);
    };
  }, []);

  // Cerrar sesión
  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    const { error } = await signOut();
    if (error) {
      toast({ title: 'Error', description: 'No se pudo cerrar la sesión', variant: 'destructive' });
    } else {
      toast({ title: 'Sesión cerrada', description: 'Has cerrado sesión correctamente' });
      navigate('/');
    }
  };

  // Navegar a configuracion de perfil (foto, nombre, banner)
  const handleGoToProfile = () => {
    setProfileDropdownOpen(false);
    // Ir a Settings donde esta la configuracion del perfil
    window.dispatchEvent(new CustomEvent('changeView', { detail: 'settings' }));
  };

  // Navegar a admin
  const handleGoToAdmin = () => {
    setProfileDropdownOpen(false);
    navigate('/admin');
  };

  // Abrir modal de votación/calificación
  const handleRateApp = () => {
    setProfileDropdownOpen(false);
    toast({
      title: '¡Gracias por tu interés!',
      description: 'Pronto habilitaremos la función de calificación. ¡Tu opinión es importante!',
    });
  };

  // Abrir modal de reporte
  const handleOpenReportModal = () => {
    setProfileDropdownOpen(false);
    setReportModalOpen(true);
  };

  // Enviar reporte/ticket
  const handleSubmitReport = async () => {
    if (!reportTitle.trim() || !reportDescription.trim()) {
      toast({ title: 'Error', description: 'Por favor completa todos los campos', variant: 'destructive' });
      return;
    }

    setIsSubmittingReport(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user?.id,
          user_email: user?.email || 'anónimo',
          user_name: userName,
          subject: reportTitle,
          description: reportDescription,
          category: 'bug',
          priority: 'normal',
          status: 'open'
        });

      if (error) throw error;

      toast({
        title: 'Reporte enviado',
        description: 'Tu reporte ha sido enviado correctamente. Te responderemos pronto.'
      });
      setReportTitle('');
      setReportDescription('');
      setReportModalOpen(false);
    } catch (error) {
      console.error('Error enviando reporte:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar el reporte. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Abrir notificación
  const handleOpenNotification = (notification) => {
    setSelectedNotification(notification);
    setIsNotificationModalOpen(true);
  };

  // Cerrar y marcar como leída
  const handleCloseNotification = () => {
    if (selectedNotification) {
      setNotifications(prev => prev.filter(n => n.id !== selectedNotification.id));
    }
    setSelectedNotification(null);
    setIsNotificationModalOpen(false);
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = () => {
    setNotifications([]);
    toast({ title: "Notificaciones", description: "Todas las notificaciones han sido marcadas como leídas" });
  };

  const handleQuickAction = (feature) => {
    toast({
      title: `🚧 ${feature}`,
      description: "Esta función aún no está implementada. ¡Pero puedes solicitarla en tu próximo mensaje! 🚀",
    });
    setProfileMenuOpen(false);
  };

  const menuItems = [
    { label: "Mi Perfil", icon: User, action: handleGoToProfile },
    ...(isAdmin ? [{ label: "Panel de Admin", icon: Shield, action: handleGoToAdmin }] : []),
    { label: "Calificar App", icon: Star, action: handleRateApp },
    { label: "Reportar Problema", icon: AlertTriangle, action: handleOpenReportModal },
    { label: `Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`, icon: theme === 'dark' ? Sun : Moon, action: () => { toggleTheme(); setProfileMenuOpen(false); } },
  ];

  return (
    <>
    <header className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-40 h-16">
      <div className="flex items-center gap-4">
        {isMobile ? (
            <Sheet open={isProfileMenuOpen} onOpenChange={setProfileMenuOpen}>
                <SheetTrigger asChild>
                    <motion.div whileTap={{ scale: 0.95 }} className="cursor-pointer">
                        <div className="w-8 h-8 rounded-full border-2 border-primary overflow-hidden">
                           <img className="w-full h-full object-cover" alt="Avatar del usuario" src="https://images.unsplash.com/photo-1683071765673-ff92ff1645dc" />
                        </div>
                    </motion.div>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-2xl bottom-sheet-content">
                  <SheetHeader>
                    <SheetTitle>Opciones de Perfil</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <ul className="space-y-1">
                      {menuItems.map(({ label, icon: Icon, action }) => (
                        <li key={label}>
                          <button onClick={action} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors text-left">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium">{label}</span>
                          </button>
                        </li>
                      ))}
                      <li>
                        <button onClick={handleLogout} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors text-left">
                          <LogOut className="w-5 h-5 text-red-500" />
                          <span className="font-medium text-red-500">Cerrar Sesión</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </SheetContent>
            </Sheet>
        ) : (
            <h1 className="text-xl font-bold">¡Hola, {userName}!</h1>
        )}
      </div>
      <div className="flex items-center gap-4">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </motion.div>
        
        <Popover>
          <PopoverTrigger asChild>
             <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                )}
              </Button>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium leading-none">
                  Notificaciones {notifications.length > 0 && `(${notifications.length})`}
                </h4>
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                    Limpiar todo
                  </Button>
                )}
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <button
                      key={notification.id}
                      onClick={() => handleOpenNotification(notification)}
                      className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Info className="w-4 h-4 text-primary"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{notification.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{notification.description}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">{notification.date}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay notificaciones</p>
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>


        {/* Profile Dropdown */}
        <Popover open={isProfileDropdownOpen} onOpenChange={setProfileDropdownOpen}>
          <PopoverTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="cursor-pointer">
              <div className="w-9 h-9 rounded-full border-2 border-primary overflow-hidden bg-primary/10 flex items-center justify-center">
                {userAvatar ? (
                  <img className="w-full h-full object-cover" alt="Avatar" src={userAvatar} />
                ) : (
                  <span className="text-primary font-semibold text-sm">
                    {userName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="end">
            {/* User Info Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-primary overflow-hidden bg-primary/10 flex items-center justify-center">
                  {userAvatar ? (
                    <img className="w-full h-full object-cover" alt="Avatar" src={userAvatar} />
                  ) : (
                    <span className="text-primary font-bold text-lg">
                      {userName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={handleGoToProfile}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Mi Perfil</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
              </button>

              {isAdmin && (
                <button
                  onClick={handleGoToAdmin}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left"
                >
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm">Panel de Admin</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </button>
              )}

              <div className="border-t border-border my-2" />

              <button
                onClick={handleRateApp}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left"
              >
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Calificar App</span>
              </button>

              <button
                onClick={handleOpenReportModal}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left"
              >
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm">Reportar un Problema</span>
              </button>

              <div className="border-t border-border my-2" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-500">Cerrar Sesión</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>

    {/* MODALES GLOBALES - Fuera del header usando Portal */}

    {/* Modal de Notificación */}
    <GlobalModal isOpen={isNotificationModalOpen && !!selectedNotification} onClose={handleCloseNotification}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <span className="font-semibold text-lg">Notificación</span>
        </div>
        <button
          onClick={handleCloseNotification}
          className="rounded-full p-2.5 hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      {/* Contenido */}
      <div className="overflow-y-auto p-6 flex-1">
        <h3 className="text-xl font-bold mb-3">{selectedNotification?.title}</h3>
        <p className="text-muted-foreground mb-4 leading-relaxed">{selectedNotification?.description}</p>
        <p className="text-xs text-muted-foreground/70">{selectedNotification?.date}</p>
      </div>
      {/* Footer */}
      <div className="p-5 border-t border-border/50 bg-muted/20 flex-shrink-0">
        <Button
          onClick={handleCloseNotification}
          className="w-full min-h-[44px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-medium"
        >
          Marcar como leída
        </Button>
      </div>
    </GlobalModal>

    {/* Modal de Reportar Problema */}
    <GlobalModal isOpen={isReportModalOpen} onClose={() => setReportModalOpen(false)}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-orange-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <span className="font-semibold text-lg">Reportar un Problema</span>
        </div>
        <button
          onClick={() => setReportModalOpen(false)}
          className="rounded-full p-2.5 hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Form */}
      <div className="p-6 space-y-5 overflow-y-auto flex-1">
        <div>
          <label className="block text-sm font-medium mb-2">Título del problema</label>
          <input
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="Ej: Error al cargar transacciones"
            className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all min-h-[44px]"
            maxLength={100}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Descripción <span className="text-muted-foreground">({reportDescription.length}/500)</span>
          </label>
          <textarea
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value.slice(0, 500))}
            placeholder="Describe el problema con el mayor detalle posible. Incluye pasos para reproducirlo si es posible..."
            className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
            style={{ minHeight: '140px' }}
            maxLength={500}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-border/50 bg-muted/20 flex justify-end gap-3 flex-shrink-0">
        <Button
          variant="outline"
          onClick={() => setReportModalOpen(false)}
          disabled={isSubmittingReport}
          className="min-h-[44px] px-5"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmitReport}
          disabled={isSubmittingReport || !reportTitle.trim() || !reportDescription.trim()}
          className="min-h-[44px] px-5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          {isSubmittingReport ? 'Enviando...' : 'Enviar Reporte'}
        </Button>
      </div>
    </GlobalModal>
    </>
  );
};

export default Header;