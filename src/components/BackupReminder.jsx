import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  needsBackupReminder,
  getDaysSinceLastBackup,
  exportToJSON,
  postponeBackupReminder
} from '@/lib/security';

const BackupReminder = () => {
  const [showReminder, setShowReminder] = useState(false);
  const [daysSince, setDaysSince] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Verificar después de un pequeño delay para no bloquear el render inicial
    const timer = setTimeout(() => {
      if (needsBackupReminder()) {
        setDaysSince(getDaysSinceLastBackup());
        setShowReminder(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleBackup = async () => {
    setIsExporting(true);
    try {
      exportToJSON();
      setShowReminder(false);
    } catch (error) {
      console.error('Error al exportar:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePostpone = () => {
    postponeBackupReminder();
    setShowReminder(false);
  };

  const handleDismiss = () => {
    setShowReminder(false);
  };

  return (
    <AnimatePresence>
      {showReminder && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
        >
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header decorativo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

            <div className="relative p-5">
              {/* Botón cerrar */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Contenido */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 pr-4">
                  <h4 className="font-semibold text-white mb-1">
                    Protege tus datos
                  </h4>
                  <p className="text-sm text-white/80 mb-3">
                    {daysSince === null
                      ? 'Nunca has hecho un backup. Tus datos solo están en este dispositivo.'
                      : `Hace ${daysSince} días que no haces backup. Un respaldo te protege si pierdes acceso.`}
                  </p>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleBackup}
                      disabled={isExporting}
                      className="bg-white text-purple-600 hover:bg-white/90"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {isExporting ? 'Descargando...' : 'Hacer Backup'}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handlePostpone}
                      className="text-white/80 hover:text-white hover:bg-white/20"
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Recordar después
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tip */}
              <p className="text-xs text-white/60 mt-4 text-center">
                El archivo se guarda en tu dispositivo. Guárdalo en un lugar seguro.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackupReminder;
