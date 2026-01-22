import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dbHelpers, subscriptions, isSupabaseConfigured } from '@/lib/supabase';

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
};

const INITIAL_DATA = {
  transactions: [],
  budgets: [],
  goals: [],
  accounts: [
    { id: '1', name: 'Cuenta Principal', balance: 0, type: 'checking' }
  ],
  debts: [],
  categories: {
    expense: ['Transporte', 'Salud', 'Alimentacion', 'Servicios', 'Entretenimiento', 'Ocio', 'Educacion', 'Otros'],
    income: ['Salario', 'Freelance', 'Inversiones', 'Otros']
  },
  users: ['Usuario'],
  necessityLevels: [
    'Muy indispensable',
    'Indispensable',
    'Necesario',
    'Poco indispensable',
    'Nada indispensable',
    'Gasto/Arrepentimiento'
  ]
};

// Helper para cargar datos de localStorage
const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem('financeData');
    if (!saved) return INITIAL_DATA;
    const parsed = JSON.parse(saved);
    return {
      ...INITIAL_DATA,
      ...parsed,
      categories: {
        expense: [...new Set([...INITIAL_DATA.categories.expense, ...(parsed.categories?.expense || [])])],
        income: [...new Set([...INITIAL_DATA.categories.income, ...(parsed.categories?.income || [])])]
      },
      users: [...new Set([...INITIAL_DATA.users, ...(parsed.users || [])])],
      necessityLevels: [...new Set([...INITIAL_DATA.necessityLevels, ...(parsed.necessityLevels || [])])]
    };
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return INITIAL_DATA;
  }
};

// Helper para guardar en localStorage
const saveToLocalStorage = (data) => {
  try {
    localStorage.setItem('financeData', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const FinanceProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!mounted) return;
      setLoading(true);
      setError(null);

      // Si esta autenticado y Supabase configurado, intentar cargar de Supabase
      if (isAuthenticated && user && isSupabaseConfigured()) {
        try {
          // Timeout de 5 segundos para evitar loading infinito
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
          );

          const dataPromise = Promise.all([
            dbHelpers.transactions.getAll(user.id),
            dbHelpers.budgets.getAll(user.id),
            dbHelpers.goals.getAll(user.id)
          ]);

          const [transactionsRes, budgetsRes, goalsRes] = await Promise.race([
            dataPromise,
            timeoutPromise
          ]);

          // Verificar errores (tabla no existe = 42P01)
          const hasTableError = [transactionsRes, budgetsRes, goalsRes].some(
            res => res.error?.code === '42P01'
          );

          if (hasTableError) {
            console.warn('Tablas de Supabase no existen. Usando localStorage.');
            if (mounted) {
              setData(loadFromLocalStorage());
              setError('Base de datos no configurada. Usando modo local.');
            }
          } else {
            if (transactionsRes.error) throw transactionsRes.error;
            if (budgetsRes.error) throw budgetsRes.error;
            if (goalsRes.error) throw goalsRes.error;

            // Cargar datos locales para categorias, users, etc.
            const localData = loadFromLocalStorage();

            if (mounted) {
              setData({
                ...localData,
                transactions: transactionsRes.data || [],
                budgets: budgetsRes.data || [],
                goals: goalsRes.data || []
              });
            }
          }

        } catch (err) {
          console.warn('Error loading from Supabase:', err.message);
          if (mounted) {
            // Fallback silencioso a localStorage
            setData(loadFromLocalStorage());
            if (err.message !== 'Timeout') {
              setError('Usando modo local.');
            }
          }
        }
      } else {
        // No autenticado, usar localStorage
        if (mounted) {
          setData(loadFromLocalStorage());
        }
      }

      if (mounted) {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user]);

  // Guardar en localStorage cuando cambian datos locales (categorias, users, etc.)
  useEffect(() => {
    if (!loading) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage({
          categories: data.categories,
          users: data.users,
          necessityLevels: data.necessityLevels,
          accounts: data.accounts,
          debts: data.debts,
          // Solo guardar transactions/budgets/goals si NO esta autenticado
          ...(!isAuthenticated && {
            transactions: data.transactions,
            budgets: data.budgets,
            goals: data.goals
          })
        });
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [data, loading, isAuthenticated]);

  // Suscripcion a cambios en tiempo real de Supabase
  useEffect(() => {
    if (!isAuthenticated || !user || !isSupabaseConfigured()) return;

    const subscription = subscriptions.onTransactionsChange(user.id, (payload) => {
      console.log('Realtime update:', payload);

      if (payload.eventType === 'INSERT') {
        setData(prev => ({
          ...prev,
          transactions: [payload.new, ...prev.transactions.filter(t => t.id !== payload.new.id)]
        }));
      } else if (payload.eventType === 'UPDATE') {
        setData(prev => ({
          ...prev,
          transactions: prev.transactions.map(t => t.id === payload.new.id ? payload.new : t)
        }));
      } else if (payload.eventType === 'DELETE') {
        setData(prev => ({
          ...prev,
          transactions: prev.transactions.filter(t => t.id !== payload.old.id)
        }));
      }
    });

    return () => {
      subscriptions.unsubscribe(subscription);
    };
  }, [isAuthenticated, user]);

  // ========================================
  // TRANSACTIONS
  // ========================================

  const addTransaction = useCallback(async (transaction) => {
    const newTransaction = {
      type: transaction.type || 'expense',
      amount: Number(transaction.amount),
      description: transaction.description || '',
      category: transaction.category,
      date: transaction.date || new Date().toISOString().split('T')[0],
      person: transaction.person || data.users[0],
      necessity: transaction.necessity || null
    };

    if (isAuthenticated && user && isSupabaseConfigured()) {
      setSyncing(true);
      try {
        const { data: inserted, error } = await dbHelpers.transactions.add({
          ...newTransaction,
          user_id: user.id
        });

        if (error) throw error;

        setData(prev => ({
          ...prev,
          transactions: [inserted, ...prev.transactions]
        }));
      } catch (err) {
        console.error('Error adding transaction:', err);
        setError('Error al guardar transaccion');
      } finally {
        setSyncing(false);
      }
    } else {
      // localStorage fallback
      const localTransaction = {
        ...newTransaction,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      setData(prev => ({
        ...prev,
        transactions: [localTransaction, ...prev.transactions]
      }));
    }
  }, [isAuthenticated, user, data.users]);

  const deleteTransaction = useCallback(async (id) => {
    if (isAuthenticated && user && isSupabaseConfigured()) {
      setSyncing(true);
      try {
        const { error } = await dbHelpers.transactions.delete(id);
        if (error) throw error;

        setData(prev => ({
          ...prev,
          transactions: prev.transactions.filter(t => t.id !== id)
        }));
      } catch (err) {
        console.error('Error deleting transaction:', err);
        setError('Error al eliminar transaccion');
      } finally {
        setSyncing(false);
      }
    } else {
      setData(prev => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id)
      }));
    }
  }, [isAuthenticated, user]);

  const updateTransaction = useCallback(async (id, updates) => {
    if (isAuthenticated && user && isSupabaseConfigured()) {
      setSyncing(true);
      try {
        const { data: updated, error } = await dbHelpers.transactions.update(id, updates);
        if (error) throw error;

        setData(prev => ({
          ...prev,
          transactions: prev.transactions.map(t => t.id === id ? updated : t)
        }));
      } catch (err) {
        console.error('Error updating transaction:', err);
        setError('Error al actualizar transaccion');
      } finally {
        setSyncing(false);
      }
    } else {
      setData(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
      }));
    }
  }, [isAuthenticated, user]);

  // ========================================
  // BUDGETS
  // ========================================

  const addBudget = useCallback(async (budget) => {
    const newBudget = {
      category: budget.category,
      amount: Number(budget.amount),
      period: budget.period || 'monthly'
    };

    if (isAuthenticated && user && isSupabaseConfigured()) {
      setSyncing(true);
      try {
        const { data: inserted, error } = await dbHelpers.budgets.add({
          ...newBudget,
          user_id: user.id
        });

        if (error) throw error;

        setData(prev => ({
          ...prev,
          budgets: [inserted, ...prev.budgets]
        }));
      } catch (err) {
        console.error('Error adding budget:', err);
        setError('Error al guardar presupuesto');
      } finally {
        setSyncing(false);
      }
    } else {
      const localBudget = {
        ...newBudget,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      setData(prev => ({
        ...prev,
        budgets: [localBudget, ...prev.budgets]
      }));
    }
  }, [isAuthenticated, user]);

  const updateBudget = useCallback(async (id, updates) => {
    if (isAuthenticated && user && isSupabaseConfigured()) {
      setSyncing(true);
      try {
        const { data: updated, error } = await dbHelpers.budgets.update(id, updates);
        if (error) throw error;

        setData(prev => ({
          ...prev,
          budgets: prev.budgets.map(b => b.id === id ? updated : b)
        }));
      } catch (err) {
        console.error('Error updating budget:', err);
        setError('Error al actualizar presupuesto');
      } finally {
        setSyncing(false);
      }
    } else {
      setData(prev => ({
        ...prev,
        budgets: prev.budgets.map(b => b.id === id ? { ...b, ...updates } : b)
      }));
    }
  }, [isAuthenticated, user]);

  const deleteBudget = useCallback(async (id) => {
    if (isAuthenticated && user && isSupabaseConfigured()) {
      setSyncing(true);
      try {
        const { error } = await dbHelpers.budgets.delete(id);
        if (error) throw error;

        setData(prev => ({
          ...prev,
          budgets: prev.budgets.filter(b => b.id !== id)
        }));
      } catch (err) {
        console.error('Error deleting budget:', err);
        setError('Error al eliminar presupuesto');
      } finally {
        setSyncing(false);
      }
    } else {
      setData(prev => ({
        ...prev,
        budgets: prev.budgets.filter(b => b.id !== id)
      }));
    }
  }, [isAuthenticated, user]);

  // ========================================
  // GOALS
  // ========================================

  const addGoal = useCallback(async (goal) => {
    const newGoal = {
      name: goal.name,
      target_amount: Number(goal.target || goal.target_amount),
      current_amount: Number(goal.current || goal.current_amount || 0),
      deadline: goal.deadline || null,
      icon: goal.icon || '🎯',
      color: goal.color || '#6366f1'
    };

    if (isAuthenticated && user && isSupabaseConfigured()) {
      setSyncing(true);
      try {
        const { data: inserted, error } = await dbHelpers.goals.add({
          ...newGoal,
          user_id: user.id
        });

        if (error) throw error;

        setData(prev => ({
          ...prev,
          goals: [inserted, ...prev.goals]
        }));
      } catch (err) {
        console.error('Error adding goal:', err);
        setError('Error al guardar meta');
      } finally {
        setSyncing(false);
      }
    } else {
      const localGoal = {
        ...newGoal,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      setData(prev => ({
        ...prev,
        goals: [localGoal, ...prev.goals]
      }));
    }
  }, [isAuthenticated, user]);

  const updateGoal = useCallback(async (id, updates) => {
    // Normalizar nombres de campos
    const normalizedUpdates = {
      ...updates,
      ...(updates.target !== undefined && { target_amount: Number(updates.target) }),
      ...(updates.current !== undefined && { current_amount: Number(updates.current) })
    };
    delete normalizedUpdates.target;
    delete normalizedUpdates.current;

    if (isAuthenticated && user && isSupabaseConfigured()) {
      setSyncing(true);
      try {
        const { data: updated, error } = await dbHelpers.goals.update(id, normalizedUpdates);
        if (error) throw error;

        setData(prev => ({
          ...prev,
          goals: prev.goals.map(g => g.id === id ? updated : g)
        }));
      } catch (err) {
        console.error('Error updating goal:', err);
        setError('Error al actualizar meta');
      } finally {
        setSyncing(false);
      }
    } else {
      setData(prev => ({
        ...prev,
        goals: prev.goals.map(g => g.id === id ? { ...g, ...normalizedUpdates } : g)
      }));
    }
  }, [isAuthenticated, user]);

  const deleteGoal = useCallback(async (id) => {
    if (isAuthenticated && user && isSupabaseConfigured()) {
      setSyncing(true);
      try {
        const { error } = await dbHelpers.goals.delete(id);
        if (error) throw error;

        setData(prev => ({
          ...prev,
          goals: prev.goals.filter(g => g.id !== id)
        }));
      } catch (err) {
        console.error('Error deleting goal:', err);
        setError('Error al eliminar meta');
      } finally {
        setSyncing(false);
      }
    } else {
      setData(prev => ({
        ...prev,
        goals: prev.goals.filter(g => g.id !== id)
      }));
    }
  }, [isAuthenticated, user]);

  // ========================================
  // DEBTS (solo localStorage por ahora)
  // ========================================

  const addDebt = useCallback((debt) => {
    const newDebt = {
      ...debt,
      id: Date.now().toString()
    };
    setData(prev => ({
      ...prev,
      debts: [newDebt, ...prev.debts]
    }));
  }, []);

  const updateDebt = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      debts: prev.debts.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  }, []);

  const deleteDebt = useCallback((id) => {
    setData(prev => ({
      ...prev,
      debts: prev.debts.filter(d => d.id !== id)
    }));
  }, []);

  // ========================================
  // CATEGORIES, USERS, NECESSITY LEVELS (localStorage)
  // ========================================

  const addCategory = useCallback((category, type = 'expense') => {
    setData(prev => {
      const newCategories = new Set([...prev.categories[type], category]);
      return {
        ...prev,
        categories: {
          ...prev.categories,
          [type]: [...newCategories]
        }
      };
    });
  }, []);

  const addUser = useCallback((user) => {
    setData(prev => ({
      ...prev,
      users: [...new Set([...prev.users, user])]
    }));
  }, []);

  const addNecessityLevel = useCallback((level) => {
    setData(prev => ({
      ...prev,
      necessityLevels: [...new Set([...prev.necessityLevels, level])]
    }));
  }, []);

  // ========================================
  // SYNC LOCAL TO SUPABASE
  // ========================================

  const syncLocalToSupabase = useCallback(async () => {
    if (!isAuthenticated || !user || !isSupabaseConfigured()) {
      return { error: 'No autenticado o Supabase no configurado' };
    }

    const localData = loadFromLocalStorage();
    if (!localData.transactions?.length && !localData.budgets?.length && !localData.goals?.length) {
      return { message: 'No hay datos locales para migrar' };
    }

    setSyncing(true);
    try {
      // Migrar transacciones
      for (const t of localData.transactions || []) {
        await dbHelpers.transactions.add({
          user_id: user.id,
          type: t.type,
          amount: Number(t.amount),
          description: t.description || '',
          category: t.category,
          date: t.date,
          person: t.person,
          necessity: t.necessity
        });
      }

      // Migrar presupuestos
      for (const b of localData.budgets || []) {
        await dbHelpers.budgets.add({
          user_id: user.id,
          category: b.category,
          amount: Number(b.amount),
          period: b.period || 'monthly'
        });
      }

      // Migrar metas
      for (const g of localData.goals || []) {
        await dbHelpers.goals.add({
          user_id: user.id,
          name: g.name,
          target_amount: Number(g.target || g.target_amount),
          current_amount: Number(g.current || g.current_amount || 0),
          deadline: g.deadline,
          icon: g.icon,
          color: g.color
        });
      }

      // Limpiar datos locales migrados
      localStorage.removeItem('financeData');

      return { success: true, message: 'Datos migrados correctamente' };
    } catch (err) {
      console.error('Error syncing to Supabase:', err);
      return { error: 'Error al migrar datos' };
    } finally {
      setSyncing(false);
    }
  }, [isAuthenticated, user]);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value = useMemo(() => ({
    ...data,
    loading,
    syncing,
    error,
    isOnline: isAuthenticated && isSupabaseConfigured(),
    clearError: () => setError(null),
    addTransaction,
    deleteTransaction,
    updateTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    addDebt,
    updateDebt,
    deleteDebt,
    addCategory,
    addUser,
    addNecessityLevel,
    syncLocalToSupabase
  }), [
    data, loading, syncing, error, isAuthenticated,
    addTransaction, deleteTransaction, updateTransaction,
    addBudget, updateBudget, deleteBudget,
    addGoal, updateGoal, deleteGoal,
    addDebt, updateDebt, deleteDebt,
    addCategory, addUser, addNecessityLevel,
    syncLocalToSupabase
  ]);

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

export default FinanceContext;
