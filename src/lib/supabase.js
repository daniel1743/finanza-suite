import { createClient } from '@supabase/supabase-js';

// Configuracion de Supabase
// Estas variables se obtienen de: Settings > API en tu proyecto de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yrjsgirfugblxzkocsqx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper para verificar si Supabase esta configurado
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && supabaseAnonKey.length > 0;
};

// ========================================
// AUTH HELPERS
// ========================================

export const authHelpers = {
  // Registrar usuario
  signUp: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    return { data, error };
  },

  // Iniciar sesion
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Cerrar sesion
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Escuchar cambios de auth
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Recuperar contrasena
  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    return { data, error };
  },

  // Login con Google
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app`
      }
    });
    return { data, error };
  }
};

// ========================================
// DATABASE HELPERS
// ========================================

export const dbHelpers = {
  // TRANSACTIONS
  transactions: {
    getAll: async (userId) => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      return { data, error };
    },

    add: async (transaction) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();
      return { data, error };
    },

    delete: async (id) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      return { error };
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    }
  },

  // BUDGETS
  budgets: {
    getAll: async (userId) => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);
      return { data, error };
    },

    add: async (budget) => {
      const { data, error } = await supabase
        .from('budgets')
        .insert([budget])
        .select()
        .single();
      return { data, error };
    },

    delete: async (id) => {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);
      return { error };
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    }
  },

  // GOALS
  goals: {
    getAll: async (userId) => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);
      return { data, error };
    },

    add: async (goal) => {
      const { data, error } = await supabase
        .from('goals')
        .insert([goal])
        .select()
        .single();
      return { data, error };
    },

    delete: async (id) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
      return { error };
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    }
  },

  // PROFILES
  profiles: {
    get: async (userId) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return { data, error };
    },

    update: async (userId, updates) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    }
  },

  // CHAT MESSAGES
  chatMessages: {
    getAll: async (userId, limit = 50) => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(limit);
      return { data, error };
    },

    add: async (message) => {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([message])
        .select()
        .single();
      return { data, error };
    },

    clear: async (userId) => {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', userId);
      return { error };
    }
  }
};

// ========================================
// REALTIME SUBSCRIPTIONS
// ========================================

export const subscriptions = {
  // Suscribirse a cambios en transacciones
  onTransactionsChange: (userId, callback) => {
    return supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Desuscribirse
  unsubscribe: (subscription) => {
    supabase.removeChannel(subscription);
  }
};

export default supabase;
