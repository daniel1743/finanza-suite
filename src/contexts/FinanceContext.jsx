import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

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
    expense: ['Transporte', 'Salud', 'Alimentación', 'Servicios', 'Entretenimiento', 'Ocio', 'Educación', 'Otros'],
    income: ['Salario', 'Freelance', 'Inversiones', 'Otros']
  },
  users: ['Yúbal M.'],
  necessityLevels: [
    'Muy indispensable', 
    'Indispensable', 
    'Necesario', 
    'Poco indispensable', 
    'Nada indispensable', 
    'Gasto/Arrepentimiento'
  ]
};

export const FinanceProvider = ({ children }) => {
  const [data, setData] = useState(() => {
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
      return INITIAL_DATA;
    }
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('financeData', JSON.stringify(data));
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [data]);

  const addTransaction = useCallback((transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: transaction.date || new Date().toISOString(),
      person: transaction.person || data.users[0],
      necessity: transaction.necessity || ''
    };
    setData(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions]
    }));
  }, [data.users]);

  const deleteTransaction = useCallback((id) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  }, []);

  const addBudget = useCallback((budget) => {
    const newBudget = {
      ...budget,
      id: Date.now().toString()
    };
    setData(prev => ({
      ...prev,
      budgets: [newBudget, ...prev.budgets]
    }));
  }, []);

  const updateBudget = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      budgets: prev.budgets.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  }, []);

  const deleteBudget = useCallback((id) => {
    setData(prev => ({
      ...prev,
      budgets: prev.budgets.filter(b => b.id !== id)
    }));
  }, []);

  const addGoal = useCallback((goal) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
      current: 0
    };
    setData(prev => ({
      ...prev,
      goals: [newGoal, ...prev.goals]
    }));
  }, []);

  const updateGoal = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, ...updates } : g)
    }));
  }, []);

  const deleteGoal = useCallback((id) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }));
  }, []);

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

  const addCategory = useCallback((category, type = 'expense') => {
    setData(prev => {
        const newCategories = new Set([...prev.categories[type], category]);
        return {
            ...prev,
            categories: {
                ...prev.categories,
                [type]: [...newCategories]
            }
        }
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

  const value = useMemo(() => ({
    ...data,
    addTransaction,
    deleteTransaction,
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
  }), [data, addTransaction, deleteTransaction, addBudget, updateBudget, deleteBudget, addGoal, updateGoal, deleteGoal, addDebt, updateDebt, deleteDebt, addCategory, addUser, addNecessityLevel]);

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};