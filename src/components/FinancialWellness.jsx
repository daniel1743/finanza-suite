import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, TrendingUp, TrendingDown, Target, Sparkles,
  ChevronDown, ChevronUp, Info, Award, Flame, Zap,
  ArrowRight, CheckCircle, AlertCircle, Calendar
} from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  calculateHealthScore,
  getHealthState,
  getPositiveMessage,
  getActionableTip,
  calculateProjectedBalance,
  compareWithLastMonth,
  generateAchievements,
  HEALTH_STATES
} from '@/lib/financialHealth';

// Componente del indicador circular de salud
const HealthGauge = ({ score, state }) => {
  const stateConfig = HEALTH_STATES[state];
  const circumference = 2 * Math.PI * 45;
  const progress = (score / 100) * circumference;

  const colorMap = {
    green: '#22c55e',
    lime: '#84cc16',
    yellow: '#eab308',
    orange: '#f97316',
    red: '#ef4444'
  };

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Fondo */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/20"
        />
        {/* Progreso */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={colorMap[stateConfig.color]}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      {/* Centro con cara */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="text-3xl"
        >
          {stateConfig.face}
        </motion.span>
        <span className="text-lg font-bold mt-1">{score}</span>
      </div>
    </div>
  );
};

// Componente de insight positivo
const InsightCard = ({ insight }) => {
  const bgColors = {
    positive: 'bg-green-500/10 border-green-500/30',
    neutral: 'bg-blue-500/10 border-blue-500/30',
    warning: 'bg-orange-500/10 border-orange-500/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-3 rounded-lg border ${bgColors[insight.type] || bgColors.neutral}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{insight.emoji}</span>
        <div>
          <p className="font-medium text-sm">{insight.message}</p>
          <p className="text-xs text-muted-foreground">{insight.detail}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Componente de logro
const AchievementBadge = ({ achievement }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    whileHover={{ scale: 1.05 }}
    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30"
  >
    <span className="text-lg">{achievement.emoji}</span>
    <div>
      <p className="text-xs font-medium">{achievement.title}</p>
    </div>
  </motion.div>
);

// Componente de balance proyectado
const ProjectedBalanceCard = ({ projection, currentBalance }) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          Balance Proyectado
        </h4>
        <span className="text-xs text-muted-foreground">
          {projection.daysRemaining} días restantes
        </span>
      </div>

      <div className="space-y-3">
        {/* Balance actual */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Ahora</span>
          <span className="font-semibold">${currentBalance.toLocaleString()}</span>
        </div>

        {/* Flecha de proyección */}
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="flex-1 h-px bg-border" />
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ArrowRight className={`w-5 h-5 ${projection.isPositive ? 'text-green-500' : 'text-orange-500'}`} />
          </motion.div>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Balance proyectado */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Fin de mes</span>
          <span className={`font-bold text-lg ${projection.isPositive ? 'text-green-500' : 'text-orange-500'}`}>
            {projection.isPositive ? '' : '-'}${Math.abs(Math.round(projection.projectedBalance)).toLocaleString()}
          </span>
        </div>

        {/* Gasto diario promedio */}
        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gasto diario promedio</span>
            <span>${Math.round(projection.dailyAvgExpense).toLocaleString()}</span>
          </div>
        </div>

        {/* Mensaje */}
        <div className={`p-2 rounded-lg text-center text-sm ${
          projection.isPositive ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-orange-500/10 text-orange-700 dark:text-orange-400'
        }`}>
          {projection.isPositive ? '✨' : '💡'} {projection.message}
        </div>
      </div>
    </Card>
  );
};

// Componente de desglose del score
const ScoreBreakdown = ({ breakdown }) => {
  const items = [
    { key: 'budgetAdherence', label: 'Presupuestos', icon: '📊' },
    { key: 'savingsRate', label: 'Ahorro', icon: '💰' },
    { key: 'expenseControl', label: 'Control de gastos', icon: '📉' },
    { key: 'goalProgress', label: 'Metas', icon: '🎯' },
    { key: 'consistency', label: 'Consistencia', icon: '📅' }
  ];

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.key} className="flex items-center gap-2">
          <span className="text-sm">{item.icon}</span>
          <span className="text-xs flex-1">{item.label}</span>
          <div className="w-24 bg-secondary rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${breakdown[item.key]}%` }}
              transition={{ duration: 0.5 }}
              className={`h-2 rounded-full ${
                breakdown[item.key] >= 70 ? 'bg-green-500' :
                breakdown[item.key] >= 40 ? 'bg-yellow-500' : 'bg-orange-500'
              }`}
            />
          </div>
          <span className="text-xs font-medium w-8">{breakdown[item.key]}</span>
        </div>
      ))}
    </div>
  );
};

// Componente principal de bienestar financiero
const FinancialWellness = () => {
  const { transactions, budgets, goals } = useFinance();
  const [showDetails, setShowDetails] = useState(false);

  // Calcular todo
  const healthData = useMemo(() => {
    return calculateHealthScore(transactions, budgets, goals);
  }, [transactions, budgets, goals]);

  const state = useMemo(() => getHealthState(healthData.score), [healthData.score]);
  const stateConfig = HEALTH_STATES[state];

  const positiveMessage = useMemo(() => getPositiveMessage(state), [state]);
  const actionableTip = useMemo(() => getActionableTip(state), [state]);

  const projection = useMemo(() => {
    return calculateProjectedBalance(transactions, healthData.savingsAmount);
  }, [transactions, healthData.savingsAmount]);

  const comparison = useMemo(() => {
    return compareWithLastMonth(transactions);
  }, [transactions]);

  const achievements = useMemo(() => {
    return generateAchievements(transactions, goals);
  }, [transactions, goals]);

  return (
    <div className="space-y-4">
      {/* Card principal de salud financiera */}
      <Card className="p-6 relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-32 -mt-32" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-pink-500" />
            <h3 className="font-semibold">Tu Salud Financiera</h3>
            <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-${stateConfig.color}-500/20 text-${stateConfig.color}-600`}>
              {stateConfig.emoji} {stateConfig.label}
            </span>
          </div>

          {/* Contenido principal */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Gauge */}
            <HealthGauge score={healthData.score} state={state} />

            {/* Mensaje y acción */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-lg font-medium mb-2">{positiveMessage}</p>
              <div className="flex items-start gap-2 p-3 bg-accent/50 rounded-lg">
                <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{actionableTip}</p>
              </div>
            </div>
          </div>

          {/* Logros */}
          {achievements.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Award className="w-3 h-3" />
                Tus logros
              </p>
              <div className="flex flex-wrap gap-2">
                {achievements.map((a, idx) => (
                  <AchievementBadge key={idx} achievement={a} />
                ))}
              </div>
            </div>
          )}

          {/* Toggle detalles */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4 w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Detalles expandibles */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-3">Desglose de tu score</p>
                    <ScoreBreakdown breakdown={healthData.breakdown} />
                  </div>

                  {/* Resumen del mes */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-green-500/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-500" />
                      <p className="text-lg font-bold">${healthData.monthlyIncome.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Ingresos</p>
                    </div>
                    <div className="text-center p-3 bg-red-500/10 rounded-lg">
                      <TrendingDown className="w-5 h-5 mx-auto mb-1 text-red-500" />
                      <p className="text-lg font-bold">${healthData.monthlyExpenses.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Gastos</p>
                    </div>
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                      <Target className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                      <p className="text-lg font-bold">{healthData.savingsRate.toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">Ahorro</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Balance proyectado */}
      <ProjectedBalanceCard
        projection={projection}
        currentBalance={healthData.savingsAmount}
      />

      {/* Insights positivos vs mes anterior */}
      {comparison.insights.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <h4 className="font-medium">Comparado con el mes pasado</h4>
          </div>
          <div className="space-y-2">
            {comparison.insights.map((insight, idx) => (
              <InsightCard key={idx} insight={insight} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default FinancialWellness;
