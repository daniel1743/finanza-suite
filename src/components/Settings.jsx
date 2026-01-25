import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, User, Camera, Image, Pencil, Save, X, Shield, ChevronRight, FileText } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, updateProfile } = useAuth();

  // Estado para edición de perfil
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [profilePhoto, setProfilePhoto] = useState(profile?.avatar_url || '');
  const [coverPhoto, setCoverPhoto] = useState(profile?.cover_url || '');

  const profilePhotoRef = useRef(null);
  const coverPhotoRef = useRef(null);

  // Manejar cambio de nombre
  const handleSaveName = async () => {
    if (!newName.trim()) {
      toast({ title: "Error", description: "El nombre no puede estar vacío", variant: "destructive" });
      return;
    }

    try {
      if (updateProfile) {
        await updateProfile({ full_name: newName.trim() });
      }
      // Guardar en localStorage como fallback
      localStorage.setItem('userName', newName.trim());
      // Notificar al Header que el perfil cambió
      window.dispatchEvent(new Event('profileUpdated'));
      setIsEditingName(false);
      toast({ title: "Nombre actualizado", description: `Tu nombre ahora es ${newName.trim()}` });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar el nombre", variant: "destructive" });
    }
  };

  // Manejar cambio de foto de perfil
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Error", description: "La imagen debe ser menor a 2MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoUrl = event.target?.result;
        setProfilePhoto(photoUrl);
        localStorage.setItem('profilePhoto', photoUrl);
        // Notificar al Header que la foto cambió
        window.dispatchEvent(new Event('profileUpdated'));
        toast({ title: "Foto actualizada", description: "Tu foto de perfil ha sido cambiada" });
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejar cambio de foto de portada
  const handleCoverPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "La imagen debe ser menor a 5MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoUrl = event.target?.result;
        setCoverPhoto(photoUrl);
        localStorage.setItem('coverPhoto', photoUrl);
        toast({ title: "Portada actualizada", description: "Tu foto de portada ha sido cambiada" });
      };
      reader.readAsDataURL(file);
    }
  };

  // Cargar fotos de localStorage al iniciar
  React.useEffect(() => {
    const savedProfilePhoto = localStorage.getItem('profilePhoto');
    const savedCoverPhoto = localStorage.getItem('coverPhoto');
    const savedUserName = localStorage.getItem('userName');

    if (savedProfilePhoto) setProfilePhoto(savedProfilePhoto);
    if (savedCoverPhoto) setCoverPhoto(savedCoverPhoto);
    if (savedUserName && !newName) setNewName(savedUserName);
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Configuración
        </h2>
        <p className="text-muted-foreground mt-1">Personaliza tu experiencia</p>
      </div>

      {/* Sección de Perfil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden">
          {/* Foto de Portada */}
          <div className="relative h-32 md:h-48 bg-gradient-to-r from-purple-500 to-pink-500">
            {coverPhoto && (
              <img src={coverPhoto} alt="Portada" className="w-full h-full object-cover" />
            )}
            <button
              onClick={() => coverPhotoRef.current?.click()}
              className="absolute bottom-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <Image className="w-5 h-5" />
            </button>
            <input
              ref={coverPhotoRef}
              type="file"
              accept="image/*"
              onChange={handleCoverPhotoChange}
              className="hidden"
            />
          </div>

          <div className="p-6">
            {/* Foto de Perfil */}
            <div className="flex flex-col sm:flex-row items-center gap-4 -mt-16 sm:-mt-12 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-background bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <button
                  onClick={() => profilePhotoRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 bg-purple-500 hover:bg-purple-600 rounded-full text-white transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={profilePhotoRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="hidden"
                />
              </div>

              {/* Nombre de Usuario */}
              <div className="flex-1 text-center sm:text-left mt-2 sm:mt-8">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Tu nombre"
                      className="max-w-[200px]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') setIsEditingName(false);
                      }}
                    />
                    <Button size="icon" variant="ghost" onClick={handleSaveName}>
                      <Save className="w-4 h-4 text-green-500" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)}>
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h3 className="text-xl font-bold">
                      {newName || user?.email?.split('@')[0] || 'Usuario'}
                    </h3>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 hover:bg-muted rounded-full transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">{user?.email || 'usuario@ejemplo.com'}</p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground border-t border-border pt-4">
              <p>Haz clic en los iconos de cámara para cambiar tus fotos.</p>
              <p>Formatos soportados: JPG, PNG, GIF (máx. 2MB perfil, 5MB portada)</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Sección de Apariencia */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-6">Apariencia</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-purple-500" />
              ) : (
                <Sun className="w-5 h-5 text-purple-500" />
              )}
              <div>
                <Label className="text-base font-medium">Modo Oscuro</Label>
                <p className="text-sm text-muted-foreground">
                  Cambia entre tema claro y oscuro
                </p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={() => {
                toggleTheme();
                toast({
                  title: "Tema actualizado",
                  description: `Modo ${theme === 'dark' ? 'claro' : 'oscuro'} activado`
                });
              }}
            />
          </div>
        </Card>
      </motion.div>

      {/* Sección de Seguridad y Privacidad */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Seguridad y Privacidad</h3>
          <div className="space-y-3">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'security' }))}
              className="w-full flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Configuración de Seguridad</p>
                  <p className="text-sm text-muted-foreground">PIN, backup, exportar datos</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'privacy' }))}
              className="w-full flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Política de Privacidad</p>
                  <p className="text-sm text-muted-foreground">Cómo protegemos tus datos</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Acerca de Financia Suite</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Misión:</span> Facilitar a los usuarios el control total de su dinero para alcanzar la libertad financiera.
            </p>
            <p>
              <span className="font-semibold text-foreground">Visión:</span> Convertirse en la herramienta de gestión financiera personal más simple, efectiva y recomendada del mercado hispanohablante.
            </p>
            <p className="text-sm pt-4 border-t border-border">
              Versión 1.0.0 - Desarrollado con ❤️ para tu libertad financiera
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Settings;