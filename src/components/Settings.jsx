import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Configuración
        </h2>
        <p className="text-muted-foreground mt-1">Personaliza tu experiencia</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Acerca de FinanzApp</h3>
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