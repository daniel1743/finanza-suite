import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Sparkles
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, resetPassword, error, clearError } = useAuth();

  const [mode, setMode] = useState('login'); // 'login', 'register', 'reset'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    clearError();
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email invalido';
    }

    if (mode !== 'reset') {
      if (!formData.password) {
        errors.password = 'La contrasena es requerida';
      } else if (formData.password.length < 6) {
        errors.password = 'Minimo 6 caracteres';
      }
    }

    if (mode === 'register') {
      if (!formData.fullName) {
        errors.fullName = 'El nombre es requerido';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contrasenas no coinciden';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setSuccessMessage('');

    try {
      if (mode === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        if (!error) {
          navigate('/app');
        }
      } else if (mode === 'register') {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (!error) {
          setSuccessMessage('Cuenta creada. Revisa tu email para confirmar.');
          setMode('login');
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(formData.email);
        if (!error) {
          setSuccessMessage('Te enviamos un email con instrucciones.');
          setMode('login');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    setIsLoading(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setFormErrors({});
    setSuccessMessage('');
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900/30 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-900/30 rounded-full blur-3xl opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Boton volver */}
        <button
          onClick={() => navigate('/')}
          className="absolute -top-12 left-0 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </button>

        {/* Card principal */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Financia Suite</h1>
            <p className="text-white/80 text-sm mt-1">
              {mode === 'login' && 'Bienvenido de vuelta'}
              {mode === 'register' && 'Crea tu cuenta gratis'}
              {mode === 'reset' && 'Recupera tu contrasena'}
            </p>
          </div>

          {/* Formulario */}
          <div className="p-6">
            {/* Mensajes de exito/error */}
            <AnimatePresence mode="wait">
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-400"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{successMessage}</span>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* GOOGLE LOGIN PRIMERO - 1 CLICK */}
            {mode !== 'reset' && (
              <div className="mb-6">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full h-12 text-base font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continuar con Google
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Recomendado - 1 click y listo
                </p>
              </div>
            )}

            {/* Separador */}
            {mode !== 'reset' && (
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                    o usa email
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre (solo registro) */}
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="fullName">Nombre completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Juan Perez"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`pl-10 ${formErrors.fullName ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {formErrors.fullName && (
                      <p className="text-red-500 text-xs">{formErrors.fullName}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 ${formErrors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-red-500 text-xs">{formErrors.email}</p>
                )}
              </div>

              {/* Contrasena (no en reset) */}
              <AnimatePresence mode="wait">
                {mode !== 'reset' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="password">Contrasena</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className={`pl-10 pr-10 ${formErrors.password ? 'border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="text-red-500 text-xs">{formErrors.password}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confirmar contrasena (solo registro) */}
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`pl-10 ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="text-red-500 text-xs">{formErrors.confirmPassword}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Link olvidar contrasena */}
              {mode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Olvide mi contrasena
                  </button>
                </div>
              )}

              {/* Boton submit */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {mode === 'login' && 'Iniciar sesion'}
                {mode === 'register' && 'Crear cuenta'}
                {mode === 'reset' && 'Enviar instrucciones'}
              </Button>
            </form>


            {/* Links de cambio de modo */}
            <div className="mt-6 text-center text-sm">
              {mode === 'login' && (
                <p className="text-gray-600 dark:text-gray-400">
                  No tienes cuenta?{' '}
                  <button
                    onClick={() => switchMode('register')}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    Registrate gratis
                  </button>
                </p>
              )}
              {mode === 'register' && (
                <p className="text-gray-600 dark:text-gray-400">
                  Ya tienes cuenta?{' '}
                  <button
                    onClick={() => switchMode('login')}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    Inicia sesion
                  </button>
                </p>
              )}
              {mode === 'reset' && (
                <p className="text-gray-600 dark:text-gray-400">
                  Recordaste tu contrasena?{' '}
                  <button
                    onClick={() => switchMode('login')}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    Volver al login
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Al continuar, aceptas nuestros{' '}
          <a href="#" className="hover:underline">Terminos de servicio</a>
          {' '}y{' '}
          <a href="#" className="hover:underline">Politica de privacidad</a>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
