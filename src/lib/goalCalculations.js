/**
 * Sistema de Cálculos Inteligentes para Metas de Ahorro
 *
 * Calcula proyecciones, sugerencias y análisis de progreso
 */

// Categorías predefinidas de metas
export const GOAL_CATEGORIES = [
  { id: 'travel', name: 'Viaje', icon: '✈️', color: 'bg-blue-500' },
  { id: 'emergency', name: 'Emergencias', icon: '🏥', color: 'bg-red-500' },
  { id: 'purchase', name: 'Compra', icon: '🛒', color: 'bg-green-500' },
  { id: 'education', name: 'Educación', icon: '📚', color: 'bg-purple-500' },
  { id: 'home', name: 'Hogar', icon: '🏠', color: 'bg-amber-500' },
  { id: 'car', name: 'Vehículo', icon: '🚗', color: 'bg-slate-500' },
  { id: 'tech', name: 'Tecnología', icon: '💻', color: 'bg-cyan-500' },
  { id: 'wedding', name: 'Boda', icon: '💍', color: 'bg-pink-500' },
  { id: 'investment', name: 'Inversión', icon: '📈', color: 'bg-emerald-500' },
  { id: 'other', name: 'Otro', icon: '🎯', color: 'bg-gray-500' }
];

// Iconos disponibles para metas
export const GOAL_ICONS = [
  '🎯', '✈️', '🏠', '🚗', '💻', '📚', '💍', '🏥', '🎮', '📱',
  '👶', '🎓', '💰', '🏖️', '🎸', '⚽', '🏋️', '🎨', '📈', '🛒'
];

// Colores disponibles
export const GOAL_COLORS = [
  { name: 'Púrpura', value: 'from-purple-500 to-pink-500', bg: 'bg-purple-500' },
  { name: 'Azul', value: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500' },
  { name: 'Verde', value: 'from-green-500 to-emerald-500', bg: 'bg-green-500' },
  { name: 'Naranja', value: 'from-orange-500 to-amber-500', bg: 'bg-orange-500' },
  { name: 'Rosa', value: 'from-pink-500 to-rose-500', bg: 'bg-pink-500' },
  { name: 'Rojo', value: 'from-red-500 to-orange-500', bg: 'bg-red-500' },
  { name: 'Índigo', value: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-500' },
  { name: 'Teal', value: 'from-teal-500 to-cyan-500', bg: 'bg-teal-500' }
];

// Prioridades
export const GOAL_PRIORITIES = [
  { id: 'high', name: 'Alta', color: 'text-red-500', badge: 'bg-red-500/20 text-red-600' },
  { id: 'medium', name: 'Media', color: 'text-yellow-500', badge: 'bg-yellow-500/20 text-yellow-600' },
  { id: 'low', name: 'Baja', color: 'text-green-500', badge: 'bg-green-500/20 text-green-600' }
];

// Templates de metas rápidas
export const GOAL_TEMPLATES = [
  { name: 'Fondo de emergencias', target: 10000, icon: '🏥', category: 'emergency', priority: 'high' },
  { name: 'Vacaciones', target: 5000, icon: '✈️', category: 'travel', priority: 'medium' },
  { name: 'Nuevo celular', target: 1500, icon: '📱', category: 'tech', priority: 'low' },
  { name: 'Laptop', target: 3000, icon: '💻', category: 'tech', priority: 'medium' },
  { name: 'Curso o capacitación', target: 2000, icon: '📚', category: 'education', priority: 'medium' }
];

/**
 * Calcula el progreso detallado de una meta
 */
export const calculateGoalProgress = (goal) => {
  const current = parseFloat(goal.current_amount || goal.current || 0);
  const target = parseFloat(goal.target_amount || goal.target || 0);

  if (target <= 0) return null;

  const remaining = Math.max(0, target - current);
  const percentage = Math.min(100, (current / target) * 100);
  const isCompleted = current >= target;

  return {
    current,
    target,
    remaining,
    percentage,
    isCompleted,
    formattedCurrent: `$${current.toLocaleString()}`,
    formattedTarget: `$${target.toLocaleString()}`,
    formattedRemaining: `$${remaining.toLocaleString()}`
  };
};

/**
 * Calcula el promedio de ahorro mensual basado en el historial
 */
export const calculateMonthlySavingsAverage = (contributions = []) => {
  if (!contributions || contributions.length === 0) return 0;

  // Agrupar por mes
  const monthlyTotals = {};

  contributions.forEach(c => {
    const date = new Date(c.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + parseFloat(c.amount);
  });

  const months = Object.values(monthlyTotals);
  if (months.length === 0) return 0;

  return months.reduce((a, b) => a + b, 0) / months.length;
};

/**
 * Calcula la proyección de cuándo se alcanzará la meta
 */
export const calculateProjection = (goal, contributions = []) => {
  const progress = calculateGoalProgress(goal);
  if (!progress || progress.isCompleted) {
    return {
      alreadyCompleted: progress?.isCompleted || false,
      message: progress?.isCompleted ? '¡Meta completada!' : 'Sin datos'
    };
  }

  const monthlyAvg = calculateMonthlySavingsAverage(contributions);

  // Si no hay historial, calcular basado en fecha límite
  if (monthlyAvg <= 0) {
    if (goal.deadline) {
      const deadline = new Date(goal.deadline);
      const today = new Date();
      const monthsLeft = Math.max(1, Math.ceil((deadline - today) / (30 * 24 * 60 * 60 * 1000)));
      const requiredMonthly = progress.remaining / monthsLeft;

      return {
        hasHistory: false,
        monthsLeft,
        requiredMonthly,
        requiredWeekly: requiredMonthly / 4,
        deadline,
        message: `Ahorra $${Math.ceil(requiredMonthly).toLocaleString()}/mes para llegar a tiempo`
      };
    }

    return {
      hasHistory: false,
      message: 'Agrega tu primer aporte para ver proyecciones'
    };
  }

  // Calcular proyección basada en historial
  const monthsToComplete = Math.ceil(progress.remaining / monthlyAvg);
  const projectedDate = new Date();
  projectedDate.setMonth(projectedDate.getMonth() + monthsToComplete);

  // Comparar con fecha límite si existe
  let onTrack = true;
  let daysAhead = 0;
  let daysBehind = 0;

  if (goal.deadline) {
    const deadline = new Date(goal.deadline);
    const diffDays = Math.ceil((deadline - projectedDate) / (24 * 60 * 60 * 1000));

    if (diffDays >= 0) {
      onTrack = true;
      daysAhead = diffDays;
    } else {
      onTrack = false;
      daysBehind = Math.abs(diffDays);
    }
  }

  return {
    hasHistory: true,
    monthlyAverage: monthlyAvg,
    weeklyAverage: monthlyAvg / 4,
    monthsToComplete,
    projectedDate,
    onTrack,
    daysAhead,
    daysBehind,
    message: onTrack
      ? `A este ritmo, llegas el ${projectedDate.toLocaleDateString()}`
      : `Necesitas aumentar tu ahorro para llegar a tiempo`
  };
};

/**
 * Calcula cuánto se necesita ahorrar para llegar a la meta
 */
export const calculateRequiredSavings = (goal) => {
  const progress = calculateGoalProgress(goal);
  if (!progress || progress.isCompleted) return null;

  if (!goal.deadline) {
    // Sin fecha límite, sugerir 10% del objetivo por mes
    const suggestedMonthly = progress.target * 0.1;
    return {
      hasDeadline: false,
      suggestedMonthly,
      suggestedWeekly: suggestedMonthly / 4,
      message: `Sugerencia: $${Math.ceil(suggestedMonthly).toLocaleString()}/mes`
    };
  }

  const deadline = new Date(goal.deadline);
  const today = new Date();
  const daysLeft = Math.max(1, Math.ceil((deadline - today) / (24 * 60 * 60 * 1000)));
  const weeksLeft = Math.max(1, Math.ceil(daysLeft / 7));
  const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));

  const requiredDaily = progress.remaining / daysLeft;
  const requiredWeekly = progress.remaining / weeksLeft;
  const requiredMonthly = progress.remaining / monthsLeft;

  return {
    hasDeadline: true,
    daysLeft,
    weeksLeft,
    monthsLeft,
    requiredDaily,
    requiredWeekly,
    requiredMonthly,
    message: `Ahorra $${Math.ceil(requiredMonthly).toLocaleString()}/mes para llegar a tiempo`
  };
};

/**
 * Simula escenarios de ahorro
 */
export const simulateScenarios = (goal, contributions = []) => {
  const progress = calculateGoalProgress(goal);
  if (!progress || progress.isCompleted) return [];

  const projection = calculateProjection(goal, contributions);
  if (!projection.hasHistory) return [];

  const baseMonthly = projection.monthlyAverage;
  const scenarios = [];

  // Escenario: +10%
  const plus10 = baseMonthly * 1.1;
  const monthsPlus10 = Math.ceil(progress.remaining / plus10);
  const datePlus10 = new Date();
  datePlus10.setMonth(datePlus10.getMonth() + monthsPlus10);

  scenarios.push({
    label: '+10% ahorro',
    monthly: plus10,
    months: monthsPlus10,
    date: datePlus10,
    daysSaved: Math.max(0, (projection.monthsToComplete - monthsPlus10) * 30),
    color: 'text-green-500'
  });

  // Escenario: +25%
  const plus25 = baseMonthly * 1.25;
  const monthsPlus25 = Math.ceil(progress.remaining / plus25);
  const datePlus25 = new Date();
  datePlus25.setMonth(datePlus25.getMonth() + monthsPlus25);

  scenarios.push({
    label: '+25% ahorro',
    monthly: plus25,
    months: monthsPlus25,
    date: datePlus25,
    daysSaved: Math.max(0, (projection.monthsToComplete - monthsPlus25) * 30),
    color: 'text-blue-500'
  });

  // Escenario: -10% (peor caso)
  const minus10 = baseMonthly * 0.9;
  const monthsMinus10 = Math.ceil(progress.remaining / minus10);
  const dateMinus10 = new Date();
  dateMinus10.setMonth(dateMinus10.getMonth() + monthsMinus10);

  scenarios.push({
    label: '-10% ahorro',
    monthly: minus10,
    months: monthsMinus10,
    date: dateMinus10,
    daysLost: Math.max(0, (monthsMinus10 - projection.monthsToComplete) * 30),
    color: 'text-red-500'
  });

  return scenarios;
};

/**
 * Determina el hito de celebración actual
 */
export const getMilestone = (percentage) => {
  if (percentage >= 100) return { value: 100, emoji: '🎉', message: '¡META COMPLETADA!' };
  if (percentage >= 75) return { value: 75, emoji: '🔥', message: '¡75%! ¡Ya casi!' };
  if (percentage >= 50) return { value: 50, emoji: '💪', message: '¡50%! ¡Mitad del camino!' };
  if (percentage >= 25) return { value: 25, emoji: '🚀', message: '¡25%! ¡Buen inicio!' };
  if (percentage >= 10) return { value: 10, emoji: '✨', message: '¡10%! ¡Empezaste!' };
  return null;
};

/**
 * Obtiene mensaje motivacional basado en el progreso
 */
export const getMotivationalMessage = (goal, contributions = []) => {
  const progress = calculateGoalProgress(goal);
  if (!progress) return '';

  if (progress.isCompleted) {
    return '¡Felicidades! Has alcanzado tu meta. ¡Celebra tu logro!';
  }

  const projection = calculateProjection(goal, contributions);

  if (!projection.hasHistory) {
    return 'Haz tu primer aporte para ver cuándo alcanzarás tu meta.';
  }

  if (projection.onTrack) {
    if (projection.daysAhead > 30) {
      return `¡Excelente! Vas ${Math.floor(projection.daysAhead / 30)} meses adelantado.`;
    }
    return '¡Vas por buen camino! Mantén el ritmo.';
  }

  const required = calculateRequiredSavings(goal);
  if (required) {
    return `Aumenta a $${Math.ceil(required.requiredMonthly).toLocaleString()}/mes para llegar a tiempo.`;
  }

  return 'Sigue ahorrando, cada aporte cuenta.';
};
