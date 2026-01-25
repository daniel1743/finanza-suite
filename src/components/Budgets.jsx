import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Target, Trash2, Edit2, TrendingUp, Calendar,
  ChevronRight, Sparkles, Clock, Zap, Trophy, X,
  PiggyBank, ArrowRight, History, Calculator
} from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import {
  GOAL_CATEGORIES,
  GOAL_ICONS,
  GOAL_COLORS,
  GOAL_PRIORITIES,
  GOAL_TEMPLATES,
  calculateGoalProgress,
  calculateProjection,
  calculateRequiredSavings,
  simulateScenarios,
  getMilestone,
  getMotivationalMessage,
  calculateMonthlySavingsAverage
} from '@/lib/goalCalculations';

// Storage key para historial de contribuciones
const CONTRIBUTIONS_KEY = 'financia_goal_contributions';

// Componente de Celebración
const CelebrationOverlay = ({ milestone, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0 }}
        className="text-center"
      >
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="text-8xl block mb-4"
        >
          {milestone.emoji}
        </motion.span>
        <h2 className="text-3xl font-bold text-white mb-2">{milestone.message}</h2>
        <p className="text-white/80">¡Sigue así!</p>
      </motion.div>
    </motion.div>
  );
};

// Componente de Tarjeta de Meta Mejorada
const GoalCard = ({ goal, contributions, onAddContribution, onEdit, onDelete, onViewDetails }) => {
  const progress = calculateGoalProgress(goal);
  const projection = calculateProjection(goal, contributions);
  const required = calculateRequiredSavings(goal);
  const milestone = getMilestone(progress?.percentage || 0);

  const priorityConfig = GOAL_PRIORITIES.find(p => p.id === goal.priority) || GOAL_PRIORITIES[1];
  const colorConfig = GOAL_COLORS.find(c => c.value === goal.color) || GOAL_COLORS[0];

  if (!progress) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className="p-5 h-full relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorConfig.value} opacity-10 rounded-full -mr-16 -mt-16`} />

        {/* Header */}
        <div className="flex items-start justify-between mb-4 relative">
          <div className="flex items-center gap-3">
            <motion.div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorConfig.value} flex items-center justify-center text-2xl shadow-lg`}
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              {goal.icon || '🎯'}
            </motion.div>
            <div>
              <h3 className="font-bold text-lg">{goal.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${priorityConfig.badge}`}>
                  {priorityConfig.name}
                </span>
                {goal.deadline && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(goal)}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDelete(goal.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progreso */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-2xl font-bold">{progress.formattedCurrent}</span>
              <span className="text-muted-foreground text-sm ml-1">de {progress.formattedTarget}</span>
            </div>
            <span className="text-lg font-bold">{progress.percentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-3 rounded-full bg-gradient-to-r ${colorConfig.value} relative`}
            >
              {milestone && progress.percentage >= 25 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-sm"
                >
                  {milestone.emoji}
                </motion.span>
              )}
            </motion.div>
          </div>
          <p className="text-sm text-muted-foreground">
            Te faltan <span className="font-semibold text-foreground">{progress.formattedRemaining}</span>
          </p>
        </div>

        {/* Proyección */}
        {projection.hasHistory && (
          <div className="bg-accent/50 rounded-lg p-3 mb-4 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>Promedio: <strong>${Math.round(projection.monthlyAverage).toLocaleString()}/mes</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{projection.message}</span>
            </div>
            {!projection.onTrack && projection.daysBehind > 0 && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <Zap className="w-4 h-4" />
                <span>Aumenta tu ahorro para llegar a tiempo</span>
              </div>
            )}
          </div>
        )}

        {/* Sugerencia de ahorro */}
        {required && !progress.isCompleted && (
          <div className="flex items-center justify-between text-sm bg-primary/10 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              <span>{required.message}</span>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2">
          <Button
            onClick={() => onAddContribution(goal)}
            className={`flex-1 bg-gradient-to-r ${colorConfig.value} hover:opacity-90`}
            disabled={progress.isCompleted}
          >
            <PiggyBank className="w-4 h-4 mr-2" />
            {progress.isCompleted ? '¡Completada!' : 'Agregar Ahorro'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onViewDetails(goal)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

// Modal de Crear/Editar Meta
const GoalModal = ({ isOpen, onClose, onSubmit, editingGoal }) => {
  const [form, setForm] = useState({
    name: '',
    target: '',
    deadline: '',
    icon: '🎯',
    color: GOAL_COLORS[0].value,
    priority: 'medium',
    category: 'other'
  });
  const [showTemplates, setShowTemplates] = useState(true);

  useEffect(() => {
    if (editingGoal) {
      setForm({
        name: editingGoal.name || '',
        target: editingGoal.target_amount || editingGoal.target || '',
        deadline: editingGoal.deadline || '',
        icon: editingGoal.icon || '🎯',
        color: editingGoal.color || GOAL_COLORS[0].value,
        priority: editingGoal.priority || 'medium',
        category: editingGoal.category || 'other'
      });
      setShowTemplates(false);
    } else {
      setForm({
        name: '',
        target: '',
        deadline: '',
        icon: '🎯',
        color: GOAL_COLORS[0].value,
        priority: 'medium',
        category: 'other'
      });
      setShowTemplates(true);
    }
  }, [editingGoal, isOpen]);

  const handleTemplateSelect = (template) => {
    setForm({
      ...form,
      name: template.name,
      target: template.target.toString(),
      icon: template.icon,
      priority: template.priority,
      category: template.category
    });
    setShowTemplates(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.target) {
      toast({ title: "Error", description: "Completa nombre y monto", variant: "destructive" });
      return;
    }
    onSubmit(form, editingGoal?.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {editingGoal ? 'Editar Meta' : 'Nueva Meta de Ahorro'}
          </DialogTitle>
        </DialogHeader>

        {/* Templates rápidos */}
        {showTemplates && !editingGoal && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Metas populares
            </p>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_TEMPLATES.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTemplateSelect(template)}
                  className="p-3 text-left rounded-lg border hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <span className="text-xl mr-2">{template.icon}</span>
                  <span className="text-sm font-medium">{template.name}</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${template.target.toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-2 text-sm"
              onClick={() => setShowTemplates(false)}
            >
              Crear meta personalizada
            </Button>
          </div>
        )}

        {/* Formulario */}
        {(!showTemplates || editingGoal) && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label>Nombre de la meta</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Vacaciones a la playa"
              />
            </div>

            {/* Monto y Fecha */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monto objetivo</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={form.target}
                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                    placeholder="0"
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fecha límite (opcional)</Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
            </div>

            {/* Prioridad */}
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <div className="flex gap-2">
                {GOAL_PRIORITIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p.id })}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      form.priority === p.id
                        ? `${p.badge} border-current`
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Icono */}
            <div className="space-y-2">
              <Label>Icono</Label>
              <div className="flex flex-wrap gap-2">
                {GOAL_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setForm({ ...form, icon })}
                    className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2 transition-all ${
                      form.icon === icon
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {GOAL_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setForm({ ...form, color: color.value })}
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color.value} transition-all ${
                      form.color === color.value
                        ? 'ring-2 ring-offset-2 ring-primary'
                        : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Botón submit */}
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
              {editingGoal ? 'Guardar Cambios' : 'Crear Meta'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Modal de Agregar Aporte
const ContributionModal = ({ isOpen, onClose, goal, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const progress = goal ? calculateGoalProgress(goal) : null;
  const quickAmounts = [100, 500, 1000, 2000];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Error", description: "Ingresa un monto válido", variant: "destructive" });
      return;
    }
    onSubmit(goal.id, parseFloat(amount), note);
    setAmount('');
    setNote('');
    onClose();
  };

  if (!goal || !progress) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-green-500" />
            Agregar Ahorro a "{goal.name}"
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Estado actual */}
          <div className="bg-accent rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Progreso actual</span>
              <span className="font-bold">{progress.percentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mb-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>{progress.formattedCurrent}</span>
              <span className="text-muted-foreground">Faltan {progress.formattedRemaining}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Monto */}
            <div className="space-y-2">
              <Label>Monto a agregar</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="pl-7 text-lg"
                  autoFocus
                />
              </div>
            </div>

            {/* Montos rápidos */}
            <div className="flex gap-2">
              {quickAmounts.map((qa) => (
                <button
                  key={qa}
                  type="button"
                  onClick={() => setAmount(qa.toString())}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                    amount === qa.toString()
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  ${qa.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Botón para completar la meta */}
            {progress.remaining > 0 && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setAmount(progress.remaining.toString())}
              >
                Completar meta (${progress.remaining.toLocaleString()})
              </Button>
            )}

            {/* Nota opcional */}
            <div className="space-y-2">
              <Label>Nota (opcional)</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej: Ahorro del mes"
              />
            </div>

            {/* Vista previa del nuevo progreso */}
            {amount && parseFloat(amount) > 0 && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-sm text-green-700 dark:text-green-400">
                  Nuevo progreso: <strong>
                    {Math.min(100, ((progress.current + parseFloat(amount)) / progress.target) * 100).toFixed(0)}%
                  </strong>
                  {progress.current + parseFloat(amount) >= progress.target && (
                    <span className="ml-2">🎉 ¡Completarás la meta!</span>
                  )}
                </p>
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
              <PiggyBank className="w-4 h-4 mr-2" />
              Agregar ${amount || '0'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Modal de Detalles de Meta
const GoalDetailsModal = ({ isOpen, onClose, goal, contributions }) => {
  if (!goal) return null;

  const progress = calculateGoalProgress(goal);
  const projection = calculateProjection(goal, contributions);
  const required = calculateRequiredSavings(goal);
  const scenarios = simulateScenarios(goal, contributions);
  const motivationalMessage = getMotivationalMessage(goal, contributions);
  const goalContributions = contributions.filter(c => c.goalId === goal.id);
  const colorConfig = GOAL_COLORS.find(c => c.value === goal.color) || GOAL_COLORS[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{goal.icon}</span>
            {goal.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progreso */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-bold">{progress?.formattedCurrent}</span>
              <span className="text-muted-foreground">de {progress?.formattedTarget}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-4 mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress?.percentage || 0}%` }}
                className={`h-4 rounded-full bg-gradient-to-r ${colorConfig.value}`}
              />
            </div>
            <p className="text-center text-muted-foreground">{motivationalMessage}</p>
          </div>

          {/* Estadísticas */}
          {projection.hasHistory && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">${Math.round(projection.monthlyAverage).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Promedio mensual</p>
              </Card>
              <Card className="p-4 text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{projection.monthsToComplete}</p>
                <p className="text-xs text-muted-foreground">Meses restantes</p>
              </Card>
            </div>
          )}

          {/* Escenarios de simulación */}
          {scenarios.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Simulación de escenarios
              </h4>
              <div className="space-y-2">
                {scenarios.map((scenario, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-accent rounded-lg">
                    <div>
                      <span className={`font-medium ${scenario.color}`}>{scenario.label}</span>
                      <p className="text-xs text-muted-foreground">
                        ${Math.round(scenario.monthly).toLocaleString()}/mes
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{scenario.date.toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {scenario.daysSaved > 0 && `${scenario.daysSaved} días antes`}
                        {scenario.daysLost > 0 && `${scenario.daysLost} días después`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historial de aportes */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <History className="w-4 h-4" />
              Historial de aportes
            </h4>
            {goalContributions.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {goalContributions.slice(0, 10).map((c, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-accent rounded-lg">
                    <div>
                      <p className="text-sm font-medium">${parseFloat(c.amount).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{c.note || 'Aporte'}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Aún no hay aportes registrados
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Componente Principal
const Budgets = () => {
  const { budgets, goals, addBudget, deleteBudget, addGoal, deleteGoal, updateGoal } = useFinance();
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [budgetForm, setBudgetForm] = useState({ category: '', amount: '' });
  const [contributions, setContributions] = useState([]);
  const [celebration, setCelebration] = useState(null);

  // Cargar historial de contribuciones
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONTRIBUTIONS_KEY);
      if (saved) {
        setContributions(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading contributions:', e);
    }
  }, []);

  // Guardar contribuciones
  const saveContributions = (newContributions) => {
    setContributions(newContributions);
    localStorage.setItem(CONTRIBUTIONS_KEY, JSON.stringify(newContributions));
  };

  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    if (!budgetForm.category || !budgetForm.amount) {
      toast({ title: "Error", description: "Completa todos los campos", variant: "destructive" });
      return;
    }
    addBudget(budgetForm);
    toast({ title: "¡Éxito!", description: "Presupuesto creado" });
    setIsBudgetDialogOpen(false);
    setBudgetForm({ category: '', amount: '' });
  };

  const handleGoalSubmit = (form, goalId) => {
    const goalData = {
      name: form.name,
      target: parseFloat(form.target),
      deadline: form.deadline || null,
      icon: form.icon,
      color: form.color,
      priority: form.priority,
      category: form.category,
      current: 0
    };

    if (goalId) {
      updateGoal(goalId, goalData);
      toast({ title: "¡Actualizado!", description: "Meta actualizada correctamente" });
    } else {
      addGoal(goalData);
      toast({ title: "¡Éxito!", description: "Meta creada correctamente" });
    }
    setEditingGoal(null);
  };

  const handleAddContribution = (goalId, amount, note) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const currentAmount = parseFloat(goal.current_amount || goal.current || 0);
    const targetAmount = parseFloat(goal.target_amount || goal.target || 0);
    const newAmount = currentAmount + amount;

    // Guardar contribución en historial
    const newContribution = {
      id: Date.now().toString(),
      goalId,
      amount,
      note,
      date: new Date().toISOString()
    };
    saveContributions([newContribution, ...contributions]);

    // Actualizar meta
    updateGoal(goalId, { current: newAmount });

    // Verificar hitos y celebrar
    const oldPercentage = (currentAmount / targetAmount) * 100;
    const newPercentage = (newAmount / targetAmount) * 100;

    const milestones = [25, 50, 75, 100];
    for (const m of milestones) {
      if (oldPercentage < m && newPercentage >= m) {
        const milestone = getMilestone(m);
        if (milestone) {
          setCelebration(milestone);
        }
        break;
      }
    }

    toast({
      title: "¡Ahorro registrado!",
      description: `Agregaste $${amount.toLocaleString()} a tu meta`
    });
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setIsGoalDialogOpen(true);
  };

  const handleDeleteGoal = (goalId) => {
    if (confirm('¿Eliminar esta meta?')) {
      deleteGoal(goalId);
      toast({ title: "Meta eliminada" });
    }
  };

  const handleOpenContribution = (goal) => {
    setSelectedGoal(goal);
    setIsContributionModalOpen(true);
  };

  const handleViewDetails = (goal) => {
    setSelectedGoal(goal);
    setIsDetailsModalOpen(true);
  };

  // Ordenar metas por prioridad
  const sortedGoals = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...goals].sort((a, b) => {
      const pA = priorityOrder[a.priority] ?? 1;
      const pB = priorityOrder[b.priority] ?? 1;
      return pA - pB;
    });
  }, [goals]);

  // Resumen de metas
  const goalsSummary = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter(g => {
      const current = parseFloat(g.current_amount || g.current || 0);
      const target = parseFloat(g.target_amount || g.target || 0);
      return current >= target;
    }).length;
    const inProgress = total - completed;
    const totalSaved = goals.reduce((sum, g) => sum + parseFloat(g.current_amount || g.current || 0), 0);

    return { total, completed, inProgress, totalSaved };
  }, [goals]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Presupuestos y Metas
        </h2>
        <p className="text-muted-foreground mt-1">Planifica y alcanza tus objetivos financieros</p>
      </div>

      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Metas de Ahorro
          </TabsTrigger>
          <TabsTrigger value="budgets">Presupuestos</TabsTrigger>
        </TabsList>

        {/* TAB: METAS */}
        <TabsContent value="goals" className="space-y-4">
          {/* Resumen */}
          {goals.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-500">{goalsSummary.total}</p>
                <p className="text-xs text-muted-foreground">Metas totales</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-green-500">{goalsSummary.completed}</p>
                <p className="text-xs text-muted-foreground">Completadas</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-500">{goalsSummary.inProgress}</p>
                <p className="text-xs text-muted-foreground">En progreso</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold">${goalsSummary.totalSaved.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total ahorrado</p>
              </Card>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingGoal(null);
                setIsGoalDialogOpen(true);
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Meta
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                contributions={contributions.filter(c => c.goalId === goal.id)}
                onAddContribution={handleOpenContribution}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                onViewDetails={handleViewDetails}
              />
            ))}
            {goals.length === 0 && (
              <Card className="p-12 col-span-full">
                <div className="text-center">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-lg font-medium">No tienes metas de ahorro</p>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">
                    Crea tu primera meta para empezar a ahorrar con propósito
                  </p>
                  <Button
                    onClick={() => setIsGoalDialogOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear mi primera meta
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* TAB: PRESUPUESTOS */}
        <TabsContent value="budgets" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
              <Button
                onClick={() => setIsBudgetDialogOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Presupuesto
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Presupuesto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBudgetSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Input
                      value={budgetForm.category}
                      onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                      placeholder="Ej: Alimentación"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monto Mensual</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={budgetForm.amount}
                      onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                    Crear Presupuesto
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((budget, index) => (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{budget.category}</h3>
                      <p className="text-2xl font-bold text-purple-500 mt-2">
                        ${parseFloat(budget.amount).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">por mes</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        deleteBudget(budget.id);
                        toast({ title: "Presupuesto eliminado" });
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
            {budgets.length === 0 && (
              <Card className="p-12 col-span-full">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg">No hay presupuestos configurados</p>
                  <p className="text-sm mt-2">Crea tu primer presupuesto para controlar tus gastos</p>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modales */}
      <GoalModal
        isOpen={isGoalDialogOpen}
        onClose={() => {
          setIsGoalDialogOpen(false);
          setEditingGoal(null);
        }}
        onSubmit={handleGoalSubmit}
        editingGoal={editingGoal}
      />

      <ContributionModal
        isOpen={isContributionModalOpen}
        onClose={() => setIsContributionModalOpen(false)}
        goal={selectedGoal}
        onSubmit={handleAddContribution}
      />

      <GoalDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        goal={selectedGoal}
        contributions={contributions}
      />

      {/* Celebración */}
      <AnimatePresence>
        {celebration && (
          <CelebrationOverlay
            milestone={celebration}
            onClose={() => setCelebration(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Budgets;
