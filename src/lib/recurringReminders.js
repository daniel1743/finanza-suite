/**
 * Sistema de Recordatorios de Gastos Recurrentes
 *
 * - Notifica 1-3 días antes del cobro
 * - Calcula impacto en presupuesto
 * - Genera resumen de gastos fijos
 */

const REMINDERS_KEY = 'financia_recurring_reminders';
const RECURRING_KEY = 'recurringExpenses';

/**
 * Obtiene los gastos recurrentes guardados
 */
export const getRecurringExpenses = () => {
  try {
    const saved = localStorage.getItem(RECURRING_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Obtiene recordatorios ya mostrados
 */
const getShownReminders = () => {
  try {
    const saved = localStorage.getItem(REMINDERS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

/**
 * Marca un recordatorio como mostrado
 */
const markReminderShown = (expenseId, month, year) => {
  const shown = getShownReminders();
  const key = `${expenseId}_${month}_${year}`;
  shown[key] = new Date().toISOString();
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(shown));
};

/**
 * Verifica si ya se mostró un recordatorio
 */
const wasReminderShown = (expenseId, month, year) => {
  const shown = getShownReminders();
  const key = `${expenseId}_${month}_${year}`;
  return !!shown[key];
};

/**
 * Genera recordatorios para los próximos días
 */
export const generateUpcomingReminders = (daysAhead = 3) => {
  const expenses = getRecurringExpenses();
  const reminders = [];
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  expenses.forEach(expense => {
    if (!expense.enabled) return;

    const expenseDay = parseInt(expense.day);
    const daysUntil = expenseDay - currentDay;

    // Recordatorio si el cobro es en los próximos X días
    if (daysUntil > 0 && daysUntil <= daysAhead) {
      // Verificar si ya se mostró este mes
      if (wasReminderShown(expense.id, currentMonth, currentYear)) return;

      reminders.push({
        id: `reminder_${expense.id}_${currentMonth}`,
        expenseId: expense.id,
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        day: expenseDay,
        daysUntil,
        type: 'upcoming',
        priority: daysUntil === 1 ? 'high' : 'medium',
        message: daysUntil === 1
          ? `⏰ Mañana se cobra ${expense.name}`
          : `📅 En ${daysUntil} días se cobra ${expense.name}`,
        description: `$${expense.amount.toLocaleString()} - ${expense.category}`,
        color: daysUntil === 1 ? 'orange' : 'blue',
        emoji: daysUntil === 1 ? '⏰' : '📅'
      });
    }

    // Recordatorio del día del cobro
    if (daysUntil === 0) {
      if (!wasReminderShown(`today_${expense.id}`, currentMonth, currentYear)) {
        reminders.push({
          id: `today_${expense.id}_${currentMonth}`,
          expenseId: expense.id,
          name: expense.name,
          amount: expense.amount,
          category: expense.category,
          day: expenseDay,
          daysUntil: 0,
          type: 'today',
          priority: 'high',
          message: `💳 Hoy se cobra ${expense.name}`,
          description: `$${expense.amount.toLocaleString()} será descontado`,
          color: 'red',
          emoji: '💳'
        });
      }
    }
  });

  // Ordenar por días hasta el cobro
  return reminders.sort((a, b) => a.daysUntil - b.daysUntil);
};

/**
 * Marca un recordatorio como visto
 */
export const dismissReminder = (reminder) => {
  const today = new Date();
  markReminderShown(
    reminder.expenseId,
    today.getMonth(),
    today.getFullYear()
  );
};

/**
 * Calcula el impacto de gastos recurrentes en el presupuesto
 */
export const calculateRecurringImpact = (budgets = []) => {
  const expenses = getRecurringExpenses();
  const enabledExpenses = expenses.filter(e => e.enabled);

  // Total de gastos fijos mensuales
  const totalMonthly = enabledExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  // Agrupar por categoría
  const byCategory = {};
  enabledExpenses.forEach(e => {
    const cat = e.category || 'Otros';
    if (!byCategory[cat]) {
      byCategory[cat] = { total: 0, items: [] };
    }
    byCategory[cat].total += parseFloat(e.amount || 0);
    byCategory[cat].items.push(e);
  });

  // Calcular impacto en presupuestos
  const budgetImpact = [];
  budgets.forEach(budget => {
    const catExpenses = byCategory[budget.category];
    if (catExpenses) {
      const budgetAmount = parseFloat(budget.amount || 0);
      const percentage = budgetAmount > 0 ? (catExpenses.total / budgetAmount) * 100 : 0;
      budgetImpact.push({
        category: budget.category,
        budgetAmount,
        recurringAmount: catExpenses.total,
        percentage,
        remaining: budgetAmount - catExpenses.total,
        items: catExpenses.items,
        status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok'
      });
    }
  });

  // Calcular total de presupuestos
  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  const overallPercentage = totalBudget > 0 ? (totalMonthly / totalBudget) * 100 : 0;

  return {
    totalMonthly,
    totalExpenses: enabledExpenses.length,
    byCategory,
    budgetImpact,
    totalBudget,
    overallPercentage,
    freeAfterFixed: totalBudget - totalMonthly,
    summary: {
      message: overallPercentage > 50
        ? `Tus gastos fijos consumen ${overallPercentage.toFixed(0)}% de tu presupuesto`
        : `Tienes ${(100 - overallPercentage).toFixed(0)}% de tu presupuesto libre`,
      status: overallPercentage >= 70 ? 'warning' : 'ok'
    }
  };
};

/**
 * Obtiene próximos cobros del mes
 */
export const getUpcomingCharges = () => {
  const expenses = getRecurringExpenses();
  const today = new Date();
  const currentDay = today.getDate();

  const upcoming = expenses
    .filter(e => e.enabled && e.day > currentDay)
    .map(e => ({
      ...e,
      daysUntil: e.day - currentDay
    }))
    .sort((a, b) => a.day - b.day);

  const passed = expenses
    .filter(e => e.enabled && e.day <= currentDay)
    .map(e => ({
      ...e,
      daysUntil: 0,
      processed: true
    }));

  return { upcoming, passed };
};

/**
 * Genera un resumen mensual de gastos fijos
 */
export const getMonthlyFixedSummary = () => {
  const expenses = getRecurringExpenses();
  const enabled = expenses.filter(e => e.enabled);

  const total = enabled.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  // Agrupar por tipo
  const subscriptions = enabled.filter(e =>
    ['Entretenimiento', 'Ocio'].includes(e.category)
  );
  const services = enabled.filter(e =>
    ['Servicios'].includes(e.category)
  );
  const others = enabled.filter(e =>
    !['Entretenimiento', 'Ocio', 'Servicios'].includes(e.category)
  );

  return {
    total,
    count: enabled.length,
    subscriptions: {
      items: subscriptions,
      total: subscriptions.reduce((s, e) => s + parseFloat(e.amount || 0), 0)
    },
    services: {
      items: services,
      total: services.reduce((s, e) => s + parseFloat(e.amount || 0), 0)
    },
    others: {
      items: others,
      total: others.reduce((s, e) => s + parseFloat(e.amount || 0), 0)
    }
  };
};
