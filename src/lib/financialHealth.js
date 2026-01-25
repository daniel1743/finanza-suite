/**
 * Sistema de Salud Financiera
 *
 * Calcula un score de 0-100 basado en múltiples factores
 * y genera mensajes positivos y sin juicio
 */

// Configuración de pesos para el score
const WEIGHTS = {
  budgetAdherence: 30,    // Cumplimiento de presupuestos
  savingsRate: 25,        // Tasa de ahorro
  expenseControl: 20,     // Control de gastos vs ingresos
  goalProgress: 15,       // Progreso en metas
  consistency: 10         // Consistencia en registro
};

// Estados de salud financiera
export const HEALTH_STATES = {
  EXCELLENT: { min: 80, label: 'Excelente', emoji: '🌟', color: 'green', face: '😊' },
  GOOD: { min: 60, label: 'Bien', emoji: '✨', color: 'lime', face: '🙂' },
  MODERATE: { min: 40, label: 'Estable', emoji: '💪', color: 'yellow', face: '😐' },
  ATTENTION: { min: 20, label: 'Atención', emoji: '👀', color: 'orange', face: '😟' },
  CRITICAL: { min: 0, label: 'Prioridad', emoji: '🎯', color: 'red', face: '😰' }
};

// Mensajes positivos por estado (SIN JUZGAR)
export const POSITIVE_MESSAGES = {
  EXCELLENT: [
    "¡Vas increíble! Tu disciplina está dando frutos 🌟",
    "Excelente manejo de tus finanzas. ¡Sigue así!",
    "Tus finanzas están en gran forma. Mereces reconocerlo 💪"
  ],
  GOOD: [
    "Vas por buen camino. Cada día cuenta ✨",
    "Estás haciendo un gran trabajo con tu dinero",
    "Tu esfuerzo se nota. ¡Sigue adelante!"
  ],
  MODERATE: [
    "Estás en equilibrio. Pequeños ajustes pueden ayudar 💡",
    "Tienes una base sólida. Vamos a fortalecerla juntos",
    "Cada paso cuenta. Estás en el camino correcto"
  ],
  ATTENTION: [
    "Es momento de prestar atención. Puedes mejorar esto 🎯",
    "Hay oportunidad de mejorar. Te ayudamos a lograrlo",
    "Vamos a trabajar juntos en esto. Tú puedes 💪"
  ],
  CRITICAL: [
    "Momento de tomar acción. Estamos aquí para ayudarte 🤝",
    "Cada gran cambio empieza con un paso. Empecemos hoy",
    "No te preocupes, vamos a mejorar esto juntos 💙"
  ]
};

// Consejos accionables por estado
export const ACTIONABLE_TIPS = {
  EXCELLENT: [
    "Considera aumentar tu meta de ahorro",
    "Podrías explorar opciones de inversión",
    "Comparte tus tips con amigos o familia"
  ],
  GOOD: [
    "Revisa si puedes optimizar algún gasto fijo",
    "Considera crear una meta de ahorro adicional",
    "Mantén el buen hábito de registrar gastos"
  ],
  MODERATE: [
    "Identifica 1 categoría donde puedas reducir un poco",
    "Intenta registrar gastos diariamente esta semana",
    "Revisa tus suscripciones activas"
  ],
  ATTENTION: [
    "Enfócate en no exceder tus presupuestos esta semana",
    "Considera pausar gastos no esenciales temporalmente",
    "Revisa gastos hormiga (cafés, snacks, etc.)"
  ],
  CRITICAL: [
    "Prioriza cubrir necesidades básicas primero",
    "Busca una categoría donde puedas recortar hoy",
    "Considera hablar con alguien de confianza sobre finanzas"
  ]
};

/**
 * Calcula el score de salud financiera
 */
export const calculateHealthScore = (transactions, budgets, goals) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filtrar transacciones del mes actual
  const monthlyTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  // 1. Cumplimiento de presupuestos (30 puntos)
  let budgetScore = 100;
  if (budgets.length > 0) {
    const budgetResults = budgets.map(budget => {
      const spent = monthlyTransactions
        .filter(t => t.type === 'expense' && t.category?.toLowerCase() === budget.category?.toLowerCase())
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      const budgetAmount = parseFloat(budget.amount || 0);
      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

      if (percentage <= 80) return 100;
      if (percentage <= 100) return 70;
      if (percentage <= 120) return 40;
      return 10;
    });
    budgetScore = budgetResults.reduce((a, b) => a + b, 0) / budgetResults.length;
  }

  // 2. Tasa de ahorro (25 puntos)
  let savingsScore = 0;
  if (monthlyIncome > 0) {
    const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
    if (savingsRate >= 20) savingsScore = 100;
    else if (savingsRate >= 10) savingsScore = 80;
    else if (savingsRate >= 5) savingsScore = 60;
    else if (savingsRate >= 0) savingsScore = 40;
    else savingsScore = 20;
  } else {
    savingsScore = 50; // Sin ingresos registrados, neutral
  }

  // 3. Control de gastos vs ingresos (20 puntos)
  let expenseScore = 50;
  if (monthlyIncome > 0) {
    const expenseRatio = (monthlyExpenses / monthlyIncome) * 100;
    if (expenseRatio <= 50) expenseScore = 100;
    else if (expenseRatio <= 70) expenseScore = 80;
    else if (expenseRatio <= 90) expenseScore = 60;
    else if (expenseRatio <= 100) expenseScore = 40;
    else expenseScore = 20;
  }

  // 4. Progreso en metas (15 puntos)
  let goalScore = 50;
  if (goals.length > 0) {
    const goalProgresses = goals.map(g => {
      const current = parseFloat(g.current_amount || g.current || 0);
      const target = parseFloat(g.target_amount || g.target || 0);
      return target > 0 ? Math.min(100, (current / target) * 100) : 0;
    });
    goalScore = goalProgresses.reduce((a, b) => a + b, 0) / goalProgresses.length;
  }

  // 5. Consistencia en registro (10 puntos)
  let consistencyScore = 0;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysPassed = now.getDate();
  const expectedRegistrations = daysPassed * 0.5; // Esperamos al menos 0.5 registros por día
  const registrationRatio = monthlyTransactions.length / Math.max(1, expectedRegistrations);

  if (registrationRatio >= 1) consistencyScore = 100;
  else if (registrationRatio >= 0.7) consistencyScore = 80;
  else if (registrationRatio >= 0.5) consistencyScore = 60;
  else if (registrationRatio >= 0.3) consistencyScore = 40;
  else consistencyScore = 20;

  // Calcular score final ponderado
  const finalScore = Math.round(
    (budgetScore * WEIGHTS.budgetAdherence +
     savingsScore * WEIGHTS.savingsRate +
     expenseScore * WEIGHTS.expenseControl +
     goalScore * WEIGHTS.goalProgress +
     consistencyScore * WEIGHTS.consistency) / 100
  );

  return {
    score: finalScore,
    breakdown: {
      budgetAdherence: Math.round(budgetScore),
      savingsRate: Math.round(savingsScore),
      expenseControl: Math.round(expenseScore),
      goalProgress: Math.round(goalScore),
      consistency: Math.round(consistencyScore)
    },
    monthlyIncome,
    monthlyExpenses,
    savingsAmount: monthlyIncome - monthlyExpenses,
    savingsRate: monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0
  };
};

/**
 * Obtiene el estado de salud basado en el score
 */
export const getHealthState = (score) => {
  if (score >= HEALTH_STATES.EXCELLENT.min) return 'EXCELLENT';
  if (score >= HEALTH_STATES.GOOD.min) return 'GOOD';
  if (score >= HEALTH_STATES.MODERATE.min) return 'MODERATE';
  if (score >= HEALTH_STATES.ATTENTION.min) return 'ATTENTION';
  return 'CRITICAL';
};

/**
 * Obtiene un mensaje positivo aleatorio según el estado
 */
export const getPositiveMessage = (state) => {
  const messages = POSITIVE_MESSAGES[state] || POSITIVE_MESSAGES.MODERATE;
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Obtiene un consejo accionable aleatorio según el estado
 */
export const getActionableTip = (state) => {
  const tips = ACTIONABLE_TIPS[state] || ACTIONABLE_TIPS.MODERATE;
  return tips[Math.floor(Math.random() * tips.length)];
};

/**
 * Calcula el balance proyectado para fin de mes
 */
export const calculateProjectedBalance = (transactions, currentBalance = 0) => {
  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - currentDay;

  // Filtrar transacciones del mes actual
  const monthlyTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  // Calcular gasto diario promedio
  const dailyAvgExpense = currentDay > 0 ? monthlyExpenses / currentDay : 0;

  // Proyectar gastos restantes
  const projectedRemainingExpenses = dailyAvgExpense * daysRemaining;

  // Balance proyectado
  const projectedBalance = currentBalance - projectedRemainingExpenses;

  return {
    currentBalance,
    dailyAvgExpense,
    daysRemaining,
    projectedRemainingExpenses,
    projectedBalance,
    isPositive: projectedBalance >= 0,
    message: projectedBalance >= 0
      ? `Si sigues así, terminas el mes con $${Math.round(projectedBalance).toLocaleString()}`
      : `Cuidado: podrías terminar el mes con -$${Math.abs(Math.round(projectedBalance)).toLocaleString()}`
  };
};

/**
 * Compara con el mes anterior para generar insights positivos
 */
export const compareWithLastMonth = (transactions) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Mes anterior
  let lastMonth = currentMonth - 1;
  let lastMonthYear = currentYear;
  if (lastMonth < 0) {
    lastMonth = 11;
    lastMonthYear = currentYear - 1;
  }

  // Transacciones mes actual
  const currentMonthTx = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  // Transacciones mes anterior
  const lastMonthTx = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  });

  // Calcular gastos por categoría
  const currentExpenses = currentMonthTx.filter(t => t.type === 'expense');
  const lastExpenses = lastMonthTx.filter(t => t.type === 'expense');

  const currentTotal = currentExpenses.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const lastTotal = lastExpenses.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  // Generar insights positivos
  const insights = [];

  // Comparación general de gastos
  if (lastTotal > 0) {
    const change = ((currentTotal - lastTotal) / lastTotal) * 100;
    if (change < -5) {
      insights.push({
        type: 'positive',
        emoji: '📉',
        message: `¡Genial! Gastaste ${Math.abs(Math.round(change))}% menos que el mes pasado`,
        detail: `$${Math.round(lastTotal - currentTotal).toLocaleString()} ahorrados`
      });
    } else if (change < 5) {
      insights.push({
        type: 'neutral',
        emoji: '📊',
        message: 'Mantienes tus gastos estables',
        detail: 'Buen control de tus finanzas'
      });
    }
  }

  // Comparar por categoría para encontrar mejoras
  const currentByCategory = {};
  const lastByCategory = {};

  currentExpenses.forEach(t => {
    currentByCategory[t.category] = (currentByCategory[t.category] || 0) + parseFloat(t.amount);
  });

  lastExpenses.forEach(t => {
    lastByCategory[t.category] = (lastByCategory[t.category] || 0) + parseFloat(t.amount);
  });

  // Encontrar categorías donde mejoró
  Object.keys(lastByCategory).forEach(cat => {
    const lastAmount = lastByCategory[cat];
    const currentAmount = currentByCategory[cat] || 0;

    if (lastAmount > 0 && currentAmount < lastAmount) {
      const reduction = ((lastAmount - currentAmount) / lastAmount) * 100;
      if (reduction >= 15) {
        insights.push({
          type: 'positive',
          emoji: '⬇️',
          message: `Redujiste ${Math.round(reduction)}% en ${cat}`,
          detail: `De $${Math.round(lastAmount).toLocaleString()} a $${Math.round(currentAmount).toLocaleString()}`
        });
      }
    }
  });

  // Ingresos
  const currentIncome = currentMonthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const lastIncome = lastMonthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  if (currentIncome > lastIncome && lastIncome > 0) {
    const increase = ((currentIncome - lastIncome) / lastIncome) * 100;
    insights.push({
      type: 'positive',
      emoji: '📈',
      message: `Tus ingresos crecieron ${Math.round(increase)}%`,
      detail: `+$${Math.round(currentIncome - lastIncome).toLocaleString()} este mes`
    });
  }

  // Ahorro
  const currentSavings = currentIncome - currentTotal;
  const lastSavings = lastIncome - lastTotal;

  if (currentSavings > lastSavings && lastSavings > 0) {
    insights.push({
      type: 'positive',
      emoji: '💰',
      message: 'Estás ahorrando más que el mes pasado',
      detail: `+$${Math.round(currentSavings - lastSavings).toLocaleString()} extra`
    });
  }

  return {
    currentMonthTotal: currentTotal,
    lastMonthTotal: lastTotal,
    changePercent: lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0,
    insights: insights.slice(0, 3) // Máximo 3 insights
  };
};

/**
 * Genera rachas y logros del usuario
 */
export const generateAchievements = (transactions, goals) => {
  const achievements = [];
  const now = new Date();

  // Racha de registro diario
  let streak = 0;
  const sortedDates = [...new Set(transactions.map(t => t.date))].sort().reverse();

  for (let i = 0; i < sortedDates.length; i++) {
    const txDate = new Date(sortedDates[i]);
    const expectedDate = new Date(now);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (txDate.toDateString() === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }

  if (streak >= 7) {
    achievements.push({
      type: 'streak',
      emoji: '🔥',
      title: `${streak} días registrando`,
      description: '¡Increíble consistencia!'
    });
  } else if (streak >= 3) {
    achievements.push({
      type: 'streak',
      emoji: '⭐',
      title: `${streak} días seguidos`,
      description: '¡Vas muy bien!'
    });
  }

  // Metas completadas
  const completedGoals = goals.filter(g => {
    const current = parseFloat(g.current_amount || g.current || 0);
    const target = parseFloat(g.target_amount || g.target || 0);
    return current >= target;
  });

  if (completedGoals.length > 0) {
    achievements.push({
      type: 'goal',
      emoji: '🏆',
      title: `${completedGoals.length} meta${completedGoals.length > 1 ? 's' : ''} completada${completedGoals.length > 1 ? 's' : ''}`,
      description: '¡Lo lograste!'
    });
  }

  // Sin gastos innecesarios recientes
  const recentTx = transactions.filter(t => {
    const date = new Date(t.date);
    const daysAgo = (now - date) / (1000 * 60 * 60 * 24);
    return daysAgo <= 7 && t.type === 'expense';
  });

  const unnecessaryExpenses = recentTx.filter(t =>
    ['Nada indispensable', 'Poco indispensable', 'Gasto/Arrepentimiento'].includes(t.necessity)
  );

  if (recentTx.length > 0 && unnecessaryExpenses.length === 0) {
    achievements.push({
      type: 'control',
      emoji: '🎯',
      title: 'Semana sin gastos innecesarios',
      description: 'Excelente control'
    });
  }

  return achievements;
};
