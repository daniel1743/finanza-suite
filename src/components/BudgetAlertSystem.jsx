import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, TrendingDown, Lightbulb, ArrowRight, Shuffle, Bell, BellOff } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import {
  analyzeBudgets,
  detectAbnormalSpending,
  detectQuickBurn,
  formatAlertForDisplay,
  ALERT_TYPES
} from '@/lib/budgetAlerts';

const STORAGE_KEY = 'financia_budget_alerts';
const ALERTS_ENABLED_KEY = 'financia_alerts_enabled';

const AlertCard = ({ alert, onDismiss, onAction }) => {
  const formatted = formatAlertForDisplay(alert);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      className={`relative p-4 rounded-xl border-2 shadow-lg backdrop-blur-sm ${formatted.colorClass}`}
    >
      <button
        onClick={() => onDismiss(alert.id)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <span className="text-2xl">{alert.emoji}</span>
        <div className="flex-1">
          <p className="font-semibold text-sm">{alert.message}</p>
          <p className="text-xs mt-1 opacity-80">{alert.suggestion}</p>

          {alert.showAdjustment && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3 text-xs"
              onClick={() => onAction('adjust', alert)}
            >
              <Shuffle className="w-3 h-3 mr-1" />
              Ajustar presupuesto
            </Button>
          )}

          {alert.type === ALERT_TYPES.ABNORMAL_SPENDING && (
            <div className="mt-2 text-xs">
              <span className="font-medium">Promedio: </span>
              <span>${alert.averageSpending?.toLocaleString()}</span>
              <span className="mx-2">→</span>
              <span className="font-medium">Ahora: </span>
              <span className="text-red-600">${alert.currentSpending?.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {alert.percentage && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Usado</span>
            <span className="font-bold">{alert.percentage}%</span>
          </div>
          <div className="w-full bg-black/10 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(alert.percentage, 100)}%` }}
              className={`h-2 rounded-full ${
                alert.percentage >= 100 ? 'bg-red-500' :
                alert.percentage >= 80 ? 'bg-orange-500' :
                'bg-yellow-500'
              }`}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

const BudgetAlertSystem = ({ onOpenAdjustment }) => {
  const { transactions, budgets } = useFinance();
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [showAlertPanel, setShowAlertPanel] = useState(false);

  // Cargar alertas previas y configuración
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setDismissedAlerts(JSON.parse(saved));
      }

      const enabled = localStorage.getItem(ALERTS_ENABLED_KEY);
      if (enabled !== null) {
        setAlertsEnabled(JSON.parse(enabled));
      }
    } catch (e) {
      console.error('Error loading alerts:', e);
    }
  }, []);

  // Analizar presupuestos y detectar alertas
  const analyzeAndAlert = useCallback(() => {
    if (!alertsEnabled || budgets.length === 0) return;

    const newAlerts = [];

    // Alertas de umbrales
    const thresholdAlerts = analyzeBudgets(budgets, transactions, dismissedAlerts);
    newAlerts.push(...thresholdAlerts);

    // Detectar gastos anormales por categoría
    const categories = [...new Set(budgets.map(b => b.category))];
    categories.forEach(cat => {
      const abnormal = detectAbnormalSpending(transactions, cat);
      if (abnormal) {
        abnormal.id = `abnormal_${cat}_${Date.now()}`;
        newAlerts.push(abnormal);
      }
    });

    // Detectar gasto rápido
    const quickBurnAlerts = detectQuickBurn(budgets, transactions);
    quickBurnAlerts.forEach((alert, idx) => {
      alert.id = `quickburn_${alert.category}_${idx}`;
    });
    newAlerts.push(...quickBurnAlerts);

    // Filtrar alertas ya descartadas
    const filteredAlerts = newAlerts.filter(a =>
      !dismissedAlerts.some(d => d.id === a.id)
    );

    // Ordenar por prioridad
    filteredAlerts.sort((a, b) => b.priority - a.priority);

    setAlerts(filteredAlerts);
  }, [budgets, transactions, dismissedAlerts, alertsEnabled]);

  // Ejecutar análisis cuando cambian las transacciones
  useEffect(() => {
    analyzeAndAlert();
  }, [analyzeAndAlert]);

  // Descartar alerta
  const dismissAlert = (alertId) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      const newDismissed = [...dismissedAlerts, { ...alert, dismissedAt: new Date().toISOString() }];
      setDismissedAlerts(newDismissed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDismissed));
    }
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  // Acción de alerta
  const handleAlertAction = (action, alert) => {
    if (action === 'adjust' && onOpenAdjustment) {
      onOpenAdjustment(alert);
    }
    dismissAlert(alert.id);
  };

  // Toggle alertas
  const toggleAlerts = () => {
    const newState = !alertsEnabled;
    setAlertsEnabled(newState);
    localStorage.setItem(ALERTS_ENABLED_KEY, JSON.stringify(newState));
    if (!newState) {
      setAlerts([]);
    }
  };

  // Solo mostrar las 3 alertas más importantes
  const visibleAlerts = alerts.slice(0, 3);
  const hasMoreAlerts = alerts.length > 3;

  return (
    <>
      {/* Botón flotante de alertas */}
      <div className="fixed bottom-24 right-4 z-40">
        <AnimatePresence>
          {alerts.length > 0 && alertsEnabled && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => setShowAlertPanel(!showAlertPanel)}
              className="relative w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-lg flex items-center justify-center text-white"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full text-xs flex items-center justify-center font-bold">
                {alerts.length}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Panel de alertas */}
      <AnimatePresence>
        {showAlertPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-40 right-4 w-80 max-h-[60vh] overflow-y-auto z-50 space-y-3"
          >
            <div className="flex items-center justify-between bg-card p-3 rounded-lg shadow-lg border">
              <span className="font-semibold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Alertas de Presupuesto
              </span>
              <button
                onClick={toggleAlerts}
                className="p-1 hover:bg-accent rounded"
                title={alertsEnabled ? 'Desactivar alertas' : 'Activar alertas'}
              >
                {alertsEnabled ? (
                  <Bell className="w-4 h-4" />
                ) : (
                  <BellOff className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>

            {visibleAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onDismiss={dismissAlert}
                onAction={handleAlertAction}
              />
            ))}

            {hasMoreAlerts && (
              <p className="text-center text-xs text-muted-foreground py-2">
                +{alerts.length - 3} alertas más
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast automático para alertas urgentes */}
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {visibleAlerts
            .filter(a => a.urgent || a.priority >= 3)
            .slice(0, 1)
            .map(alert => (
              <AlertCard
                key={`toast_${alert.id}`}
                alert={alert}
                onDismiss={dismissAlert}
                onAction={handleAlertAction}
              />
            ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default BudgetAlertSystem;
