import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Lock, Unlock, Key, Download, Upload, Trash2,
  FileJson, FileSpreadsheet, Clock, CheckCircle, AlertTriangle,
  Eye, EyeOff, ChevronRight, HardDrive, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  isPinEnabled,
  setupPin,
  disablePin,
  changePin,
  getAutoLockTimeout,
  setAutoLockTimeout,
  exportToJSON,
  exportToCSV,
  importFromBackup,
  deleteAllUserData,
  deleteEverything,
  getDaysSinceLastBackup
} from '@/lib/security';

const SecuritySettings = ({ onDataChange }) => {
  const [pinEnabled, setPinEnabled] = useState(isPinEnabled());
  const [showPinModal, setShowPinModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [pinAction, setPinAction] = useState('setup'); // 'setup' | 'change' | 'disable'
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoLockMinutes, setAutoLockMinutes] = useState(getAutoLockTimeout());
  const [deleteType, setDeleteType] = useState('data'); // 'data' | 'everything'
  const [confirmText, setConfirmText] = useState('');
  const [importStats, setImportStats] = useState(null);

  const fileInputRef = useRef(null);
  const daysSinceBackup = getDaysSinceLastBackup();

  const handlePinSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (pinAction === 'setup') {
        if (newPin.length < 4) {
          setError('El PIN debe tener al menos 4 dígitos');
          return;
        }
        if (newPin !== confirmPin) {
          setError('Los PINs no coinciden');
          return;
        }
        await setupPin(newPin);
        setPinEnabled(true);
        setSuccess('PIN configurado correctamente');
      } else if (pinAction === 'change') {
        if (newPin.length < 4) {
          setError('El nuevo PIN debe tener al menos 4 dígitos');
          return;
        }
        if (newPin !== confirmPin) {
          setError('Los PINs no coinciden');
          return;
        }
        await changePin(currentPin, newPin);
        setSuccess('PIN cambiado correctamente');
      } else if (pinAction === 'disable') {
        await disablePin(currentPin);
        setPinEnabled(false);
        setSuccess('PIN desactivado');
      }

      setTimeout(() => {
        setShowPinModal(false);
        resetPinForm();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPinForm = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setError('');
    setSuccess('');
    setShowPin(false);
  };

  const handleExportJSON = () => {
    try {
      exportToJSON();
      setSuccess('Backup descargado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV();
      setSuccess('CSV descargado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = importFromBackup(event.target.result);
        setImportStats(result.stats);
        setShowImportModal(true);
        if (onDataChange) onDataChange();
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDelete = () => {
    if (confirmText !== 'ELIMINAR') {
      setError('Escribe ELIMINAR para confirmar');
      return;
    }

    try {
      if (deleteType === 'everything') {
        deleteEverything();
        setPinEnabled(false);
      } else {
        deleteAllUserData();
      }

      setShowDeleteModal(false);
      setConfirmText('');
      if (onDataChange) onDataChange();

      // Recargar la página para limpiar estado
      window.location.reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAutoLockChange = (minutes) => {
    setAutoLockMinutes(minutes);
    setAutoLockTimeout(minutes);
  };

  const SettingItem = ({ icon: Icon, title, description, action, danger }) => (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${danger ? 'border-red-500/30 bg-red-500/5' : 'border-border bg-card'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${danger ? 'bg-red-500/20 text-red-500' : 'bg-primary/20 text-primary'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Mensajes globales */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg ${success ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
          >
            <div className="flex items-center gap-2">
              {success ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              {success || error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sección: Seguridad */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Seguridad</h3>
        </div>

        <div className="space-y-3">
          <SettingItem
            icon={Lock}
            title="PIN de Acceso"
            description={pinEnabled ? 'Tu app está protegida con PIN' : 'Protege tu app con un PIN'}
            action={
              <div className="flex items-center gap-2">
                {pinEnabled && (
                  <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">
                    Activo
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPinAction(pinEnabled ? 'change' : 'setup');
                    setShowPinModal(true);
                  }}
                >
                  {pinEnabled ? 'Cambiar' : 'Configurar'}
                </Button>
                {pinEnabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPinAction('disable');
                      setShowPinModal(true);
                    }}
                  >
                    Desactivar
                  </Button>
                )}
              </div>
            }
          />

          {pinEnabled && (
            <SettingItem
              icon={Clock}
              title="Bloqueo Automático"
              description="Tiempo de inactividad antes de bloquear"
              action={
                <select
                  value={autoLockMinutes}
                  onChange={(e) => handleAutoLockChange(parseInt(e.target.value))}
                  className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
                >
                  <option value={1}>1 minuto</option>
                  <option value={5}>5 minutos</option>
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                </select>
              }
            />
          )}
        </div>
      </Card>

      {/* Sección: Datos y Backup */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-lg">Datos y Backup</h3>
        </div>

        {/* Alerta de backup */}
        {daysSinceBackup !== null && daysSinceBackup >= 7 && (
          <div className="mb-4 p-3 rounded-lg bg-orange-500/20 border border-orange-500/30">
            <div className="flex items-center gap-2 text-orange-500">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Hace {daysSinceBackup} días que no haces backup</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <SettingItem
            icon={FileJson}
            title="Backup Completo (JSON)"
            description="Descarga todos tus datos para restaurar después"
            action={
              <Button variant="outline" size="sm" onClick={handleExportJSON}>
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            }
          />

          <SettingItem
            icon={FileSpreadsheet}
            title="Exportar Transacciones (CSV)"
            description="Para abrir en Excel o Google Sheets"
            action={
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            }
          />

          <SettingItem
            icon={Upload}
            title="Restaurar Backup"
            description="Recupera tus datos desde un archivo JSON"
            action={
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Restaurar
                </Button>
              </>
            }
          />
        </div>
      </Card>

      {/* Sección: Zona de Peligro */}
      <Card className="p-6 border-red-500/30">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-lg text-red-500">Zona de Peligro</h3>
        </div>

        <div className="space-y-3">
          <SettingItem
            icon={Trash2}
            title="Eliminar Mis Datos"
            description="Borra transacciones, presupuestos y metas"
            danger
            action={
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setDeleteType('data');
                  setShowDeleteModal(true);
                }}
              >
                Eliminar
              </Button>
            }
          />

          <SettingItem
            icon={RefreshCw}
            title="Restablecer Todo"
            description="Borra TODO incluyendo configuración y PIN"
            danger
            action={
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setDeleteType('everything');
                  setShowDeleteModal(true);
                }}
              >
                Restablecer
              </Button>
            }
          />
        </div>
      </Card>

      {/* Modal de PIN */}
      <Dialog open={showPinModal} onOpenChange={(open) => { setShowPinModal(open); if (!open) resetPinForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pinAction === 'setup' ? 'Configurar PIN' : pinAction === 'change' ? 'Cambiar PIN' : 'Desactivar PIN'}
            </DialogTitle>
            <DialogDescription>
              {pinAction === 'setup'
                ? 'Elige un PIN de 4 a 6 dígitos para proteger tu app'
                : pinAction === 'change'
                  ? 'Ingresa tu PIN actual y el nuevo PIN'
                  : 'Ingresa tu PIN actual para desactivarlo'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* PIN actual (para cambiar o desactivar) */}
            {(pinAction === 'change' || pinAction === 'disable') && (
              <div>
                <label className="text-sm font-medium mb-2 block">PIN Actual</label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    className="w-full py-3 px-4 bg-secondary border border-border rounded-lg text-center text-xl tracking-widest"
                    inputMode="numeric"
                  />
                </div>
              </div>
            )}

            {/* Nuevo PIN */}
            {(pinAction === 'setup' || pinAction === 'change') && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {pinAction === 'setup' ? 'Nuevo PIN' : 'Nuevo PIN'}
                  </label>
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    className="w-full py-3 px-4 bg-secondary border border-border rounded-lg text-center text-xl tracking-widest"
                    inputMode="numeric"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Confirmar PIN</label>
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    className="w-full py-3 px-4 bg-secondary border border-border rounded-lg text-center text-xl tracking-widest"
                    inputMode="numeric"
                  />
                </div>
              </>
            )}

            {/* Toggle mostrar PIN */}
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
            </button>

            {/* Error en modal */}
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            {success && (
              <p className="text-green-500 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {success}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPinModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePinSubmit} disabled={isLoading}>
              {isLoading ? 'Procesando...' : pinAction === 'disable' ? 'Desactivar' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Eliminar */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">
              {deleteType === 'everything' ? 'Restablecer Todo' : 'Eliminar Mis Datos'}
            </DialogTitle>
            <DialogDescription>
              {deleteType === 'everything'
                ? 'Esto eliminará TODOS tus datos incluyendo configuración y PIN. Esta acción no se puede deshacer.'
                : 'Esto eliminará todas tus transacciones, presupuestos y metas. Esta acción no se puede deshacer.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm mb-4">
              Escribe <span className="font-bold text-red-500">ELIMINAR</span> para confirmar:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ELIMINAR"
              className="w-full py-3 px-4 bg-secondary border border-red-500/50 rounded-lg text-center"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteModal(false); setConfirmText(''); setError(''); }}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Import exitoso */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-500">
              <CheckCircle className="w-5 h-5" />
              Backup Restaurado
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="mb-4">Se han restaurado los siguientes datos:</p>
            {importStats && (
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-secondary rounded">
                  <span>Transacciones</span>
                  <span className="font-bold">{importStats.transactions}</span>
                </div>
                <div className="flex justify-between p-2 bg-secondary rounded">
                  <span>Presupuestos</span>
                  <span className="font-bold">{importStats.budgets}</span>
                </div>
                <div className="flex justify-between p-2 bg-secondary rounded">
                  <span>Metas</span>
                  <span className="font-bold">{importStats.goals}</span>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              Recarga la página para ver todos los cambios.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={() => window.location.reload()}>
              Recargar Página
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecuritySettings;
