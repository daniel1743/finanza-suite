import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Settings, Moon, Sun, Edit, Gem, LogIn, LogOut, Palette, ShoppingBag, User, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/components/ui/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card } from '@/components/ui/card';

const notifications = [
    {
      id: 1,
      title: "¡Bienvenido a FinanzApp!",
      description: "Tu viaje hacia la libertad financiera comienza ahora.",
      date: "hace 5 minutos"
    },
    {
      id: 2,
      title: "Recordatorio de presupuesto",
      description: "Has gastado el 80% de tu presupuesto de 'Alimentación'.",
      date: "hace 2 horas"
    },
    {
      id: 3,
      title: "Nueva función disponible",
      description: "Ahora puedes conectar tus cuentas bancarias de forma segura.",
      date: "ayer"
    }
  ];

const Header = ({ onMenuClick, isMobile }) => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

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
            <h1 className="text-xl font-bold">¡Hola, Yúbal!</h1>
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
                <span className="absolute top-1 right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              </Button>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium leading-none">Notificaciones</h4>
                <Button variant="ghost" size="sm">Marcar como leído</Button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {notifications.map(notification => (
                  <div key={notification.id} className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Info className="w-4 h-4 text-primary"/>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                       <p className="text-xs text-muted-foreground/70 mt-1">{notification.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

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