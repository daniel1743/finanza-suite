import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Edit, Gem, LogIn, LogOut, Moon, Palette, ShoppingBag, Sun, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet";

const Profile = () => {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { user, profile } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState('Usuario');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');

  // Cargar datos del perfil
  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    const savedProfilePhoto = localStorage.getItem('profilePhoto');
    const savedCoverPhoto = localStorage.getItem('coverPhoto');

    if (savedName) setUserName(savedName);
    else if (profile?.full_name) setUserName(profile.full_name);
    else if (user?.user_metadata?.full_name) setUserName(user.user_metadata.full_name);
    else if (user?.email) setUserName(user.email.split('@')[0]);

    if (savedProfilePhoto) setProfilePhoto(savedProfilePhoto);
    if (savedCoverPhoto) setCoverPhoto(savedCoverPhoto);
  }, [user, profile]);

  const handleAction = (message) => {
    toast({
      title: '🚧 Función no implementada',
      description: "¡Esta característica estará disponible pronto! 🚀",
    });
    setOpen(false);
  };

  const handleAuth = () => {
    setIsLoggedIn(!isLoggedIn);
    toast({
      title: isLoggedIn ? 'Cierre de sesión exitoso' : 'Inicio de sesión exitoso',
    });
    setOpen(false);
  };

  const menuItems = [
    { label: "Editar perfil", icon: Edit, action: () => handleAction("Editar perfil") },
    { label: "Editar foto de perfil", icon: User, action: () => handleAction("Editar foto de perfil") },
    { label: "Editar foto de portada", icon: Palette, action: () => handleAction("Editar foto de portada") },
    { label: "Pagar Premium", icon: Gem, action: () => handleAction("Pagar Premium") },
    { label: "Ir a tienda", icon: ShoppingBag, action: () => handleAction("Ir a tienda") },
    { label: `Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`, icon: theme === 'dark' ? Sun : Moon, action: () => { toggleTheme(); setOpen(false); } },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="relative">
        <div className="h-48 md:h-64 bg-gradient-to-r from-purple-500 to-pink-500 w-full">
          {coverPhoto ? (
            <img className="w-full h-full object-cover" alt="Foto de portada" src={coverPhoto} />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500" />
          )}
          <div className="absolute top-4 right-4">
            <Button variant="secondary" size="icon" onClick={() => handleAction("Editar foto de portada")} className="rounded-full">
              <Camera className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative cursor-pointer"
              >
                <div className="w-32 h-32 rounded-full border-4 border-background bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden flex items-center justify-center">
                  {profilePhoto ? (
                    <img className="w-full h-full object-cover" alt="Foto de perfil" src={profilePhoto} />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <div className="absolute bottom-1 right-1 bg-secondary p-2 rounded-full border-2 border-background">
                  <Camera className="w-5 h-5" />
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
        </div>
      </div>
      <div className="mt-24 text-center">
        <h1 className="text-2xl font-bold">{userName}</h1>
        <p className="text-muted-foreground">@{userName.toLowerCase().replace(/\s+/g, '_')}</p>
      </div>
      <div className="p-4 mt-4 flex-grow">
        <div className="bg-accent/50 p-6 rounded-lg text-center">
          <p className="text-sm font-medium">"El control de tu dinero es el primer paso hacia la libertad. ¡Sigue así!"</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;