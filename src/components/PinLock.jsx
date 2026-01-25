import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Eye, EyeOff, Shield, Fingerprint, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  isPinEnabled,
  verifyPin,
  setupPin,
  isLocked,
  shouldAutoLock,
  updateLastActivity,
  getRemainingAttempts
} from '@/lib/security';

const PinLock = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lockInfo, setLockInfo] = useState({ locked: false, remainingSeconds: 0 });
  const [step, setStep] = useState('enter'); // 'enter' | 'confirm'

  const inputRef = useRef(null);

  // Verificar estado inicial
  useEffect(() => {
    const checkAuth = () => {
      if (!isPinEnabled()) {
        setIsAuthenticated(true);
        return;
      }

      if (shouldAutoLock()) {
        setIsAuthenticated(false);
      }

      const lock = isLocked();
      setLockInfo(lock);
    };

    checkAuth();

    // Verificar auto-lock cada minuto
    const interval = setInterval(checkAuth, 60000);

    // Listener de actividad
    const handleActivity = () => {
      if (isAuthenticated) {
        updateLastActivity();
      }
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [isAuthenticated]);

  // Contador de bloqueo
  useEffect(() => {
    if (lockInfo.locked && lockInfo.remainingSeconds > 0) {
      const timer = setInterval(() => {
        const newLock = isLocked();
        setLockInfo(newLock);
        if (!newLock.locked) {
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockInfo.locked]);

  // Enfocar input
  useEffect(() => {
    if (!isAuthenticated && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAuthenticated, showSetup]);

  const handlePinChange = (value) => {
    // Solo números, máximo 6
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    if (step === 'enter') {
      setPin(cleaned);
    } else {
      setConfirmPin(cleaned);
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (showSetup) {
        // Configuración de nuevo PIN
        if (step === 'enter') {
          if (pin.length < 4) {
            setError('El PIN debe tener al menos 4 dígitos');
            setIsLoading(false);
            return;
          }
          setStep('confirm');
          setIsLoading(false);
          return;
        } else {
          // Confirmar PIN
          if (pin !== confirmPin) {
            setError('Los PINs no coinciden');
            setConfirmPin('');
            setIsLoading(false);
            return;
          }
          await setupPin(pin);
          setIsAuthenticated(true);
          setShowSetup(false);
          setPin('');
          setConfirmPin('');
          setStep('enter');
        }
      } else {
        // Verificar PIN existente
        await verifyPin(pin);
        setIsAuthenticated(true);
        setPin('');
      }
    } catch (err) {
      setError(err.message);
      setPin('');
      setConfirmPin('');
      if (step === 'confirm') {
        setStep('enter');
      }
      // Actualizar estado de bloqueo
      setLockInfo(isLocked());
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipSetup = () => {
    setIsAuthenticated(true);
    setShowSetup(false);
  };

  // Si ya está autenticado, mostrar children
  if (isAuthenticated) {
    return children;
  }

  // Pantalla de PIN
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8">
          {/* Logo/Icono */}
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: lockInfo.locked ? [0, -5, 5, 0] : 0
              }}
              transition={{
                scale: { repeat: Infinity, duration: 2 },
                rotate: { repeat: lockInfo.locked ? Infinity : 0, duration: 0.5 }
              }}
              className={`w-20 h-20 rounded-full flex items-center justify-center ${
                lockInfo.locked
                  ? 'bg-red-500/20 text-red-500'
                  : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
              }`}
            >
              {lockInfo.locked ? (
                <AlertCircle className="w-10 h-10" />
              ) : showSetup ? (
                <Shield className="w-10 h-10" />
              ) : (
                <Lock className="w-10 h-10" />
              )}
            </motion.div>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-center mb-2">
            {lockInfo.locked
              ? 'Acceso Bloqueado'
              : showSetup
                ? 'Configura tu PIN'
                : 'Financia Suite'}
          </h1>
          <p className="text-muted-foreground text-center text-sm mb-6">
            {lockInfo.locked
              ? `Demasiados intentos. Espera ${lockInfo.remainingSeconds}s`
              : showSetup
                ? step === 'enter'
                  ? 'Elige un PIN de 4-6 dígitos'
                  : 'Confirma tu PIN'
                : 'Ingresa tu PIN para continuar'}
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <input
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                value={step === 'enter' ? pin : confirmPin}
                onChange={(e) => handlePinChange(e.target.value)}
                placeholder={step === 'enter' ? '••••••' : 'Confirmar PIN'}
                disabled={lockInfo.locked || isLoading}
                className="w-full text-center text-3xl tracking-[0.5em] py-4 px-12 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Indicador de dígitos */}
            <div className="flex justify-center gap-2 mb-4">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    scale: i < (step === 'enter' ? pin : confirmPin).length ? 1.2 : 1,
                    backgroundColor: i < (step === 'enter' ? pin : confirmPin).length
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--secondary))'
                  }}
                  className="w-3 h-3 rounded-full"
                />
              ))}
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-sm text-center mb-4"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Botón */}
            <Button
              type="submit"
              className="w-full py-6 text-lg"
              disabled={lockInfo.locked || isLoading || (step === 'enter' ? pin : confirmPin).length < 4}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : lockInfo.locked ? (
                `Bloqueado (${lockInfo.remainingSeconds}s)`
              ) : showSetup && step === 'enter' ? (
                'Continuar'
              ) : (
                <>
                  <Unlock className="w-5 h-5 mr-2" />
                  {showSetup ? 'Configurar PIN' : 'Desbloquear'}
                </>
              )}
            </Button>

            {/* Opción de saltar setup */}
            {showSetup && (
              <button
                type="button"
                onClick={handleSkipSetup}
                className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Omitir por ahora
              </button>
            )}

            {/* Volver atrás en confirmación */}
            {showSetup && step === 'confirm' && (
              <button
                type="button"
                onClick={() => {
                  setStep('enter');
                  setConfirmPin('');
                  setError('');
                }}
                className="w-full mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cambiar PIN
              </button>
            )}
          </form>

          {/* Info de seguridad */}
          {!showSetup && !lockInfo.locked && (
            <p className="text-xs text-muted-foreground text-center mt-6">
              {getRemainingAttempts()} intentos restantes
            </p>
          )}
        </div>

        {/* Nota de privacidad */}
        <p className="text-xs text-muted-foreground text-center mt-4 px-4">
          Tus datos están seguros. Nunca salen de tu dispositivo.
        </p>
      </motion.div>
    </div>
  );
};

export default PinLock;
