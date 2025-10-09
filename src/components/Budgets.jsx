import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Trash2 } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';

const Budgets = () => {
  const { budgets, goals, addBudget, deleteBudget, addGoal, deleteGoal, updateGoal } = useFinance();
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ category: '', amount: '' });
  const [goalForm, setGoalForm] = useState({ name: '', target: '', deadline: '' });

  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    if (!budgetForm.category || !budgetForm.amount) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }
    addBudget(budgetForm);
    toast({
      title: "¡Éxito!",
      description: "Presupuesto creado correctamente"
    });
    setIsBudgetDialogOpen(false);
    setBudgetForm({ category: '', amount: '' });
  };

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    if (!goalForm.name || !goalForm.target) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }
    addGoal(goalForm);
    toast({
      title: "¡Éxito!",
      description: "Meta creada correctamente"
    });
    setIsGoalDialogOpen(false);
    setGoalForm({ name: '', target: '', deadline: '' });
  };

  const handleAddToGoal = (goalId, amount) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      updateGoal(goalId, { current: goal.current + parseFloat(amount) });
      toast({
        title: "¡Genial!",
        description: `Agregaste $${amount} a tu meta`
      });
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Presupuestos y Metas
        </h2>
        <p className="text-muted-foreground mt-1">Planifica y alcanza tus objetivos financieros</p>
      </div>

      <Tabs defaultValue="budgets" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="budgets">Presupuestos</TabsTrigger>
          <TabsTrigger value="goals">Metas de Ahorro</TabsTrigger>
        </TabsList>

        <TabsContent value="budgets" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Presupuesto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Presupuesto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBudgetSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Input
                      value={budgetForm.category}
                      onChange={(e) => setBudgetForm({...budgetForm, category: e.target.value})}
                      placeholder="Ej: Alimentación"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monto Mensual</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={budgetForm.amount}
                      onChange={(e) => setBudgetForm({...budgetForm, amount: e.target.value})}
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
                <Card className="p-6 glass-effect">
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

        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Meta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Meta de Ahorro</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleGoalSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nombre de la Meta</Label>
                    <Input
                      value={goalForm.name}
                      onChange={(e) => setGoalForm({...goalForm, name: e.target.value})}
                      placeholder="Ej: Vacaciones"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monto Objetivo</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={goalForm.target}
                      onChange={(e) => setGoalForm({...goalForm, target: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha Límite (Opcional)</Label>
                    <Input
                      type="date"
                      value={goalForm.deadline}
                      onChange={(e) => setGoalForm({...goalForm, deadline: e.target.value})}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                    Crear Meta
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal, index) => {
              const progress = (goal.current / goal.target) * 100;
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 glass-effect">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{goal.name}</h3>
                          {goal.deadline && (
                            <p className="text-sm text-muted-foreground">
                              Hasta: {new Date(goal.deadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          deleteGoal(goal.id);
                          toast({ title: "Meta eliminada" });
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-bold">{Math.min(progress, 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progress, 100)}%` }}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-purple-500">
                          ${goal.current.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          de ${parseFloat(goal.target).toLocaleString()}
                        </span>
                      </div>
                      <Button
                        onClick={() => {
                          const amount = prompt('¿Cuánto deseas agregar?');
                          if (amount && !isNaN(amount)) {
                            handleAddToGoal(goal.id, amount);
                          }
                        }}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                        size="sm"
                      >
                        Agregar Ahorro
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
            {goals.length === 0 && (
              <Card className="p-12 col-span-full">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg">No hay metas configuradas</p>
                  <p className="text-sm mt-2">Crea tu primera meta para comenzar a ahorrar</p>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Budgets;