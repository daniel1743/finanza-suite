import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Bell, DollarSign, TrendingDown, AlertTriangle,
  ChevronDown, ChevronUp, X, Clock, Check, Wallet, PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFinance } from '@/contexts/FinanceContext';
import {
  generateUpcomingReminders,
  dismissReminder,
  calculateRecurringImpact,
  getMonthlyFixedSummary,
  getUpcomingCharges
} from '@/lib/recurringReminders';

// Componente de recordatorio individual
const ReminderCard = ({ reminder, onDismiss }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-400',
    red: 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`flex items-center justify-between p-3 rounded-lg border ${colorClasses[reminder.color]}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{reminder.emoji}</span>
        <div>
          <p className="font-medium text-sm">{reminder.message}</p>
          <p className="text-xs opacity-70">{reminder.description}</p>
        </div>
      </div>
      <button
        onClick={() => onDismiss(reminder)}
        className="p-1 hover:bg-black/10 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// Componente de resumen de gastos fijos
const FixedExpensesSummary = ({ impact, summary }) => {
  const [expanded, setExpanded] = useState(false);

  if (!summary || summary.count === 0) return null;

  return (
    <Card className="p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            impact.summary.status === 'warning' ? 'bg-orange-500/20' : 'bg-green-500/20'
          }`}>
            <Wallet className={`w-5 h-5 ${
              impact.summary.status === 'warning' ? 'text-orange-500' : 'text-green-500'
            }`} />
          </div>
          <div className="text-left">
            <p className="font-semibold">Gastos Fijos Mensuales</p>
            <p className="text-sm text-muted-foreground">
              {summary.count} gastos = <span className="font-bold text-foreground">${summary.total.toLocaleString()}/mes</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${
            impact.summary.status === 'warning' ? 'text-orange-500' : 'text-green-500'
          }`}>
            {impact.overallPercentage.toFixed(0)}% del presupuesto
          </span>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t space-y-4">
              {/* Barra de progreso general */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Impacto en presupuesto</span>
                  <span className="font-bold">{impact.overallPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      impact.overallPercentage >= 70 ? 'bg-orange-500' :
                      impact.overallPercentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, impact.overallPercentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Gastos fijos: ${impact.totalMonthly.toLocaleString()}</span>
                  <span>Libre: ${impact.freeAfterFixed.toLocaleString()}</span>
                </div>
              </div>

              {/* Desglose por tipo */}
              <div className="grid grid-cols-3 gap-3">
                {/* Suscripciones */}
                <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Suscripciones</p>
                  <p className="font-bold text-purple-600">${summary.subscriptions.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{summary.subscriptions.items.length} items</p>
                </div>
                {/* Servicios */}
                <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Servicios</p>
                  <p className="font-bold text-blue-600">${summary.services.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{summary.services.items.length} items</p>
                </div>
                {/* Otros */}
                <div className="text-center p-3 bg-gray-500/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Otros</p>
                  <p className="font-bold">${summary.others.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{summary.others.items.length} items</p>
                </div>
              </div>

              {/* Impacto por categoría de presupuesto */}
              {impact.budgetImpact.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Impacto por presupuesto:</p>
                  <div className="space-y-2">
                    {impact.budgetImpact.map(bi => (
                      <div key={bi.category} className="flex items-center justify-between text-sm">
                        <span>{bi.category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-secondary rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                bi.status === 'exceeded' ? 'bg-red-500' :
                                bi.status === 'warning' ? 'bg-orange-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(100, bi.percentage)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            bi.status === 'exceeded' ? 'text-red-500' :
                            bi.status === 'warning' ? 'text-orange-500' : 'text-green-500'
                          }`}>
                            {bi.percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Próximos cobros */}
              <UpcomingChargesPreview />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// Preview de próximos cobros
const UpcomingChargesPreview = () => {
  const { upcoming } = getUpcomingCharges();

  if (upcoming.length === 0) return null;

  const nextThree = upcoming.slice(0, 3);
  const total = nextThree.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  return (
    <div className="p-3 bg-accent/50 rounded-lg">
      <p className="text-xs font-medium mb-2 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Próximos cobros este mes
      </p>
      <div className="space-y-1">
        {nextThree.map(expense => (
          <div key={expense.id} className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {expense.name}
              <span className="text-xs text-muted-foreground">
                (día {expense.day})
              </span>
            </span>
            <span className="font-medium">${parseFloat(expense.amount).toLocaleString()}</span>
          </div>
        ))}
      </div>
      {upcoming.length > 3 && (
        <p className="text-xs text-muted-foreground mt-2">
          +{upcoming.length - 3} más = ${total.toLocaleString()} total pendiente
        </p>
      )}
    </div>
  );
};

// Componente principal de recordatorios e impacto
const RecurringImpact = () => {
  const { budgets } = useFinance();
  const [reminders, setReminders] = useState([]);

  // Cargar recordatorios
  useEffect(() => {
    const upcoming = generateUpcomingReminders(3);
    setReminders(upcoming);
  }, []);

  // Calcular impacto
  const impact = useMemo(() => {
    return calculateRecurringImpact(budgets);
  }, [budgets]);

  // Resumen mensual
  const summary = useMemo(() => {
    return getMonthlyFixedSummary();
  }, []);

  // Descartar recordatorio
  const handleDismiss = (reminder) => {
    dismissReminder(reminder);
    setReminders(prev => prev.filter(r => r.id !== reminder.id));
  };

  return (
    <div className="space-y-4">
      {/* Recordatorios activos */}
      {reminders.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Bell className="w-4 h-4 text-orange-500" />
            <span>Próximos cobros</span>
          </div>
          <AnimatePresence>
            {reminders.map(reminder => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onDismiss={handleDismiss}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Resumen de gastos fijos */}
      <FixedExpensesSummary impact={impact} summary={summary} />
    </div>
  );
};

export default RecurringImpact;
