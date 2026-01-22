import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Settings, Moon, Sun, Edit, Gem, LogIn, LogOut, Palette, ShoppingBag, User, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card } from '@/components/ui/card';

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
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userName, setUserName] = useState('Usuario');

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

  // Cargar nombre de usuario
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
  }, [user, profile]);

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
  
  const handleAuth = () => {
    setIsLoggedIn(!isLoggedIn);
    toast({
      title: isLoggedIn ? 'Cierre de sesión exitoso' : 'Inicio de sesión exitoso',
    });
    setProfileMenuOpen(false);
  };

  const menuItems = [
    { label: "Editar perfil", icon: Edit, action: () => handleQuickAction("Editar perfil") },
    { label: "Editar foto de perfil", icon: User, action: () => handleQuickAction("Editar foto de perfil") },
    { label: "Editar foto de portada", icon: Palette, action: () => handleQuickAction("Editar foto de portada") },
    { label: "Pagar Premium", icon: Gem, action: () => handleQuickAction("Pagar Premium") },
    { label: "Ir a tienda", icon: ShoppingBag, action: () => handleQuickAction("Ir a tienda") },
    { label: `Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`, icon: theme === 'dark' ? Sun : Moon, action: () => { toggleTheme(); setProfileMenuOpen(false); } },
  ];

  return (
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
                        <button onClick={handleAuth} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors text-left">
                          {isLoggedIn ? <LogOut className="w-5 h-5 text-red-500" /> : <LogIn className="w-5 h-5 text-green-500" />}
                          <span className={`font-medium ${isLoggedIn ? 'text-red-500' : 'text-green-500'}`}>
                            {isLoggedIn ? 'Cerrar Sesión' : 'Iniciar Sesión'}
                          </span>
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

        {/* Modal de Notificación - Centrado con flexbox */}
        <AnimatePresence>
          {isNotificationModalOpen && selectedNotification && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseNotification}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-[calc(100%-2rem)] max-w-md bg-background rounded-xl border shadow-2xl flex flex-col"
                style={{ maxHeight: '90vh' }}
              >
                {/* Header fijo */}
                <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold">Notificación</span>
                  </div>
                  <button
                    onClick={handleCloseNotification}
                    className="rounded-full p-2 hover:bg-muted transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {/* Contenido scrolleable */}
                <div className="overflow-y-auto p-6 flex-1">
                  <h3 className="text-xl font-bold mb-2">{selectedNotification.title}</h3>
                  <p className="text-muted-foreground mb-4">{selectedNotification.description}</p>
                  <p className="text-xs text-muted-foreground/70">{selectedNotification.date}</p>
                </div>
                {/* Footer fijo */}
                <div className="p-4 border-t bg-muted/30 flex-shrink-0">
                  <Button onClick={handleCloseNotification} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                    Marcar como leída
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
           <Button variant="ghost" size="icon" onClick={() => handleQuickAction('Configuración')}>
            <Settings className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;