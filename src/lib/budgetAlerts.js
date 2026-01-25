/**
 * Sistema de Alertas Inteligentes de Presupuesto
 *
 * Detecta:
 * - Umbrales de presupuesto (50%, 80%, 100%)
 * - Gastos anormales (comparación histórica)
 * - Patrones de gasto peligrosos
 */

// Umbrales de alerta
const ALERT_THRESHOLDS = {
  WARNING_MILD: 50,    // Amarillo - "Vas a mitad de camino"
  WARNING_STRONG: 80,  // Naranja - "Cuidado, casi llegas"
  DANGER: 100,         // Rojo - "Te pasaste"
  CRITICAL: 120        // Rojo oscuro - "Muy por encima"
};

// Tipos de alerta
export const ALERT_TYPES = {
  THRESHOLD_50: 'threshold_50',
  THRESHOLD_80: 'threshold_80',
  THRESHOLD_100: 'threshold_100',
  THRESHOLD_EXCEEDED: 'threshold_exceeded',
  ABNORMAL_SPENDING: 'abnormal_spending',
  QUICK_BURN: 'quick_burn', // Gastando muy rápido
  CATEGORY_SPIKE: 'category_spike'
};

// Prioridad de alertas (para no molestar)
export const ALERT_PRIORITY = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4
};

/**
 * Calcula el porcentaje gastado de un presupuesto
 */
export const calculateBudgetPercentage = (spent, budgetAmount) => {
  if (!budgetAmount || budgetAmount <= 0) return 0;
  return (spent / budgetAmount) * 100;
};

/**
 * Analiza todos los presupuestos y detecta alertas
 */
export const analyzeBudgets = (budgets, transactions, previousAlerts = []) => {
  const alerts = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filtrar transacciones del mes actual
  const monthlyExpenses = transactions.filter(t => {
    const date = new Date(t.date);
    return t.type === 'expense' &&
           date.getMonth() === currentMonth &&
           date.getFullYear() === currentYear;
  });

  // Calcular gasto por categoría
  const spentByCategory = {};
  monthlyExpenses.forEach(t => {
    const cat = t.category?.toLowerCase() || 'otros';
    spentByCategory[cat] = (spentByCategory[cat] || 0) + parseFloat(t.amount || 0);
  });

  // Analizar cada presupuesto
  budgets.forEach(budget => {
    const category = budget.category?.toLowerCase();
    const budgetAmount = parseFloat(budget.amount || 0);
    const spent = spentByCategory[category] || 0;
    const percentage = calculateBudgetPercentage(spent, budgetAmount);
    const remaining = budgetAmount - spent;

    // Verificar si ya se alertó este umbral este mes
    const alertKey = `${category}_${currentMonth}_${currentYear}`;

    // Alerta 50%
    if (percentage >= 50 && percentage < 80) {
      if (!wasAlertedRecently(previousAlerts, alertKey, ALERT_TYPES.THRESHOLD_50)) {
        alerts.push({
          id: `${alertKey}_50`,
          type: ALERT_TYPES.THRESHOLD_50,
          priority: ALERT_PRIORITY.LOW,
          category: budget.category,
          percentage: Math.round(percentage),
          spent,
          budget: budgetAmount,
          remaining,
          message: `Llevas el ${Math.round(percentage)}% de tu presupuesto de ${budget.category}`,
          suggestion: `Te quedan $${remaining.toLocaleString()} para el resto del mes. ¡Vas bien!`,
          emoji: '💡',
          color: 'yellow',
          timestamp: now.toISOString()
        });
      }
    }

    // Alerta 80%
    if (percentage >= 80 && percentage < 100) {
      if (!wasAlertedRecently(previousAlerts, alertKey, ALERT_TYPES.THRESHOLD_80)) {
        const daysLeft = getDaysLeftInMonth();
        alerts.push({
          id: `${alertKey}_80`,
          type: ALERT_TYPES.THRESHOLD_80,
          priority: ALERT_PRIORITY.MEDIUM,
          category: budget.category,
          percentage: Math.round(percentage),
          spent,
          budget: budgetAmount,
          remaining,
          message: `¡Cuidado! Ya usaste el ${Math.round(percentage)}% de ${budget.category}`,
          suggestion: `Solo te quedan $${remaining.toLocaleString()} y faltan ${daysLeft} días. Considera reducir gastos.`,
          emoji: '⚠️',
          color: 'orange',
          timestamp: now.toISOString(),
          actionRequired: true
        });
      }
    }

    // Alerta 100%
    if (percentage >= 100 && percentage < 120) {
      if (!wasAlertedRecently(previousAlerts, alertKey, ALERT_TYPES.THRESHOLD_100)) {
        alerts.push({
          id: `${alertKey}_100`,
          type: ALERT_TYPES.THRESHOLD_100,
          priority: ALERT_PRIORITY.HIGH,
          category: budget.category,
          percentage: Math.round(percentage),
          spent,
          budget: budgetAmount,
          remaining,
          exceeded: spent - budgetAmount,
          message: `⛔ Alcanzaste el límite de ${budget.category}`,
          suggestion: `Te pasaste por $${(spent - budgetAmount).toLocaleString()}. ¿Movemos presupuesto de otra categoría?`,
          emoji: '🚨',
          color: 'red',
          timestamp: now.toISOString(),
          actionRequired: true,
          showAdjustment: true
        });
      }
    }

    // Alerta exceso crítico (>120%)
    if (percentage >= 120) {
      alerts.push({
        id: `${alertKey}_critical`,
        type: ALERT_TYPES.THRESHOLD_EXCEEDED,
        priority: ALERT_PRIORITY.CRITICAL,
        category: budget.category,
        percentage: Math.round(percentage),
        spent,
        budget: budgetAmount,
        exceeded: spent - budgetAmount,
        message: `🔴 Exceso importante en ${budget.category}`,
        suggestion: `Gastaste $${(spent - budgetAmount).toLocaleString()} de más. Ajustemos tu presupuesto para evitar problemas a fin de mes.`,
        emoji: '🆘',
        color: 'red',
        timestamp: now.toISOString(),
        actionRequired: true,
        showAdjustment: true,
        urgent: true
      });
    }
  });

  return alerts;
};

/**
 * Detecta gastos anormales comparando con el historial
 */
export const detectAbnormalSpending = (transactions, category) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Gastos del mes actual en esta categoría
  const currentMonthSpending = transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' &&
             t.category?.toLowerCase() === category?.toLowerCase() &&
             date.getMonth() === currentMonth &&
             date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  // Promedio de los últimos 3 meses
  const historicalSpending = [];
  for (let i = 1; i <= 3; i++) {
    let targetMonth = currentMonth - i;
    let targetYear = currentYear;
    if (targetMonth < 0) {
      targetMonth += 12;
      targetYear -= 1;
    }

    const monthSpending = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' &&
               t.category?.toLowerCase() === category?.toLowerCase() &&
               date.getMonth() === targetMonth &&
               date.getFullYear() === targetYear;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    if (monthSpending > 0) {
      historicalSpending.push(monthSpending);
    }
  }

  if (historicalSpending.length === 0) return null;

  const avgSpending = historicalSpending.reduce((a, b) => a + b, 0) / historicalSpending.length;
  const ratio = currentMonthSpending / avgSpending;

  // Si gastó más del doble del promedio
  if (ratio >= 2) {
    return {
      type: ALERT_TYPES.ABNORMAL_SPENDING,
      priority: ALERT_PRIORITY.HIGH,
      category,
      currentSpending: currentMonthSpending,
      averageSpending: avgSpending,
      ratio: ratio.toFixed(1),
      message: `Gastaste ${ratio.toFixed(1)}x más en ${category} que tu promedio`,
      suggestion: `Normalmente gastas $${avgSpending.toLocaleString()} en ${category}. Este mes llevas $${currentMonthSpending.toLocaleString()}.`,
      emoji: '📊',
      color: 'purple'
    };
  }

  return null;
};

/**
 * Detecta si el usuario está gastando muy rápido
 * (Si ya gastó más del 50% y no ha pasado ni la mitad del mes)
 */
export const detectQuickBurn = (budgets, transactions) => {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthProgress = (dayOfMonth / daysInMonth) * 100;

  const alerts = [];

  budgets.forEach(budget => {
    const category = budget.category?.toLowerCase();
    const budgetAmount = parseFloat(budget.amount || 0);

    const spent = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' &&
               t.category?.toLowerCase() === category &&
               date.getMonth() === now.getMonth() &&
               date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const spentPercentage = (spent / budgetAmount) * 100;

    // Si gastó más del doble de lo proporcional al tiempo
    if (spentPercentage > monthProgress * 2 && monthProgress < 50) {
      alerts.push({
        type: ALERT_TYPES.QUICK_BURN,
        priority: ALERT_PRIORITY.MEDIUM,
        category: budget.category,
        spentPercentage: Math.round(spentPercentage),
        monthProgress: Math.round(monthProgress),
        message: `Estás gastando rápido en ${budget.category}`,
        suggestion: `Llevas ${Math.round(spentPercentage)}% del presupuesto pero solo ha pasado ${Math.round(monthProgress)}% del mes.`,
        emoji: '⏰',
        color: 'orange'
      });
    }
  });

  return alerts;
};

/**
 * Genera sugerencias de ajuste cuando se excede un presupuesto
 */
export const generateAdjustmentSuggestions = (budgets, transactions, exceededCategory) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const suggestions = [];

  budgets.forEach(budget => {
    if (budget.category?.toLowerCase() === exceededCategory?.toLowerCase()) return;

    const category = budget.category?.toLowerCase();
    const budgetAmount = parseFloat(budget.amount || 0);

    const spent = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' &&
               t.category?.toLowerCase() === category &&
               date.getMonth() === currentMonth &&
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const remaining = budgetAmount - spent;
    const percentage = (spent / budgetAmount) * 100;

    // Solo sugerir categorías con espacio disponible (menos del 70% usado)
    if (percentage < 70 && remaining > 0) {
      suggestions.push({
        category: budget.category,
        available: remaining,
        percentageUsed: Math.round(percentage),
        canTransfer: Math.round(remaining * 0.5), // Sugerir transferir hasta 50% del sobrante
        message: `${budget.category} tiene $${remaining.toLocaleString()} disponibles`
      });
    }
  });

  // Ordenar por mayor disponibilidad
  return suggestions.sort((a, b) => b.available - a.available);
};

/**
 * Verifica si ya se alertó recientemente para evitar spam
 */
const wasAlertedRecently = (previousAlerts, alertKey, alertType) => {
  if (!previousAlerts || !Array.isArray(previousAlerts)) return false;

  const existingAlert = previousAlerts.find(a =>
    a.id?.startsWith(alertKey) && a.type === alertType
  );

  if (!existingAlert) return false;

  // Si ya se alertó en las últimas 24 horas, no repetir
  const alertTime = new Date(existingAlert.timestamp);
  const hoursSinceAlert = (Date.now() - alertTime.getTime()) / (1000 * 60 * 60);

  return hoursSinceAlert < 24;
};

/**
 * Obtiene días restantes en el mes
 */
const getDaysLeftInMonth = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate();
};

/**
 * Formatea una alerta para mostrar al usuario
 */
export const formatAlertForDisplay = (alert) => {
  const colorClasses = {
    yellow: 'bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-400',
    orange: 'bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400',
    red: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400',
    purple: 'bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-400'
  };

  return {
    ...alert,
    colorClass: colorClasses[alert.color] || colorClasses.yellow
  };
};

/**
 * Obtiene el resumen del estado de todos los presupuestos
 */
export const getBudgetHealthSummary = (budgets, transactions) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let healthy = 0;
  let warning = 0;
  let danger = 0;

  budgets.forEach(budget => {
    const category = budget.category?.toLowerCase();
    const budgetAmount = parseFloat(budget.amount || 0);

    const spent = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' &&
               t.category?.toLowerCase() === category &&
               date.getMonth() === currentMonth &&
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const percentage = (spent / budgetAmount) * 100;

    if (percentage >= 100) danger++;
    else if (percentage >= 80) warning++;
    else healthy++;
  });

  return { healthy, warning, danger, total: budgets.length };
};
