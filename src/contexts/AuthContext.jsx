import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, authHelpers } from '@/lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar perfil del usuario (no bloquea el login si falla)
  const loadProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // PGRST116 = no rows found (normal para usuarios nuevos)
        // 42P01 = table doesn't exist (schema no ejecutado)
        if (error.code !== 'PGRST116') {
          console.warn('Perfil no disponible:', error.message);
        }
        setProfile(null);
        return;
      }

      setProfile(data);
    } catch (err) {
      console.warn('Error en loadProfile:', err);
      setProfile(null);
    }
  };

  // Inicializar auth
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Obtener sesion actual
        const { data: { session } } = await supabase.auth.getSession();

        if (mounted && session?.user) {
          setUser(session.user);
          // Cargar perfil sin bloquear (no await)
          loadProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error inicializando auth:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);

        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          // Cargar perfil sin bloquear
          loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Registrar usuario
  const signUp = async (email, password, fullName) => {
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await authHelpers.signUp(email, password, fullName);

      if (error) {
        setError(error.message);
        return { error };
      }

      return { data };
    } catch (err) {
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  // Iniciar sesion con email/password
  const signIn = async (email, password) => {
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await authHelpers.signIn(email, password);

      if (error) {
        setError(error.message);
        return { error };
      }

      return { data };
    } catch (err) {
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  // Iniciar sesion con Google
  const signInWithGoogle = async () => {
    setError(null);

    try {
      const { data, error } = await authHelpers.signInWithGoogle();

      if (error) {
        setError(error.message);
        return { error };
      }

      return { data };
    } catch (err) {
      setError(err.message);
      return { error: err };
    }
  };

  // Cerrar sesion
  const signOut = async () => {
    setError(null);

    try {
      const { error } = await authHelpers.signOut();

      if (error) {
        setError(error.message);
        return { error };
      }

      setUser(null);
      setProfile(null);
      return {};
    } catch (err) {
      setError(err.message);
      return { error: err };
    }
  };

  // Recuperar contrasena
  const resetPassword = async (email) => {
    setError(null);

    try {
      const { data, error } = await authHelpers.resetPassword(email);

      if (error) {
        setError(error.message);
        return { error };
      }

      return { data };
    } catch (err) {
      setError(err.message);
      return { error: err };
    }
  };

  // Actualizar perfil
  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('No hay usuario autenticado') };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { error };
      }

      setProfile(data);
      return { data };
    } catch (err) {
      return { error: err };
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
