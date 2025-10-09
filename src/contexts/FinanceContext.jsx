import React, { createContext, useContext, useState, useEffect } from 'react';

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
    localStorage.setItem('financeData', JSON.stringify(data));
  }, [data]);

  const addTransaction = (transaction) => {
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
  };

  const deleteTransaction = (id) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  const addBudget = (budget) => {
    const newBudget = {
      ...budget,
      id: Date.now().toString()
    };
    setData(prev => ({
      ...prev,
      budgets: [newBudget, ...prev.budgets]
    }));
  };

  const updateBudget = (id, updates) => {
    setData(prev => ({
      ...prev,
      budgets: prev.budgets.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  };

  const deleteBudget = (id) => {
    setData(prev => ({
      ...prev,
      budgets: prev.budgets.filter(b => b.id !== id)
    }));
  };

  const addGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
      current: 0
    };
    setData(prev => ({
      ...prev,
      goals: [newGoal, ...prev.goals]
    }));
  };

  const updateGoal = (id, updates) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, ...updates } : g)
    }));
  };

  const deleteGoal = (id) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }));
  };

  const addDebt = (debt) => {
    const newDebt = {
      ...debt,
      id: Date.now().toString()
    };
    setData(prev => ({
      ...prev,
      debts: [newDebt, ...prev.debts]
    }));
  };

  const updateDebt = (id, updates) => {
    setData(prev => ({
      ...prev,
      debts: prev.debts.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  };

  const deleteDebt = (id) => {
    setData(prev => ({
      ...prev,
      debts: prev.debts.filter(d => d.id !== id)
    }));
  };
  
  const addCategory = (category, type = 'expense') => {
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
  }

  const addUser = (user) => {
    setData(prev => ({
      ...prev,
      users: [...new Set([...prev.users, user])]
    }));
  }

  const addNecessityLevel = (level) => {
    setData(prev => ({
      ...prev,
      necessityLevels: [...new Set([...prev.necessityLevels, level])]
    }));
  };

  const value = {
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
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};