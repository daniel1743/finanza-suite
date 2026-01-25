import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coffee, Utensils, Car, ShoppingCart, Fuel, Bus,
  Smartphone, Pill, Dumbbell, Beer, Pizza, Scissors,
  Plus, Check, Zap, Repeat, Settings, X, Pencil, Trash2,
  Save, DollarSign, Tag, Tv, Music, Wifi, Home, Droplet,
  Flame, CreditCard, Film, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from '@/components/ui/use-toast';

// Iconos disponibles para elegir
const AVAILABLE_ICONS = {
  Coffee, Utensils, Car, ShoppingCart, Fuel, Bus,
  Smartphone, Pill, Dumbbell, Beer, Pizza, Scissors,
  DollarSign, Tag, Tv, Music, Wifi, Home, Droplet,
  Flame, CreditCard, Film, Play
};

const ICON_LIST = Object.keys(AVAILABLE_ICONS);

// Colores disponibles
const AVAILABLE_COLORS = [
  'bg-amber-500', 'bg-orange-500', 'bg-red-500', 'bg-pink-500',
  'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-cyan-500',
  'bg-teal-500', 'bg-green-500', 'bg-lime-500', 'bg-gray-700'
];

// Plantillas de gastos frecuentes predefinidas
const DEFAULT_TEMPLATES = [
  { id: 1, name: 'Cafe', icon: 'Coffee', amount: 3000, category: 'Alimentacion', color: 'bg-amber-500' },
  { id: 2, name: 'Almuerzo', icon: 'Utensils', amount: 8000, category: 'Alimentacion', color: 'bg-orange-500' },
  { id: 3, name: 'Uber/Taxi', icon: 'Car', amount: 5000, category: 'Transporte', color: 'bg-gray-700' },
  { id: 4, name: 'Bus/Metro', icon: 'Bus', amount: 1500, category: 'Transporte', color: 'bg-blue-500' },
  { id: 5, name: 'Gasolina', icon: 'Fuel', amount: 30000, category: 'Transporte', color: 'bg-red-500' },
  { id: 6, name: 'Super', icon: 'ShoppingCart', amount: 50000, category: 'Alimentacion', color: 'bg-green-500' },
  { id: 7, name: 'Farmacia', icon: 'Pill', amount: 15000, category: 'Salud', color: 'bg-pink-500' },
  { id: 8, name: 'Gym', icon: 'Dumbbell', amount: 35000, category: 'Salud', color: 'bg-purple-500' },
];

// Gastos fijos recurrentes predefinidos
const RECURRING_PRESETS = [
  { id: 'netflix', name: 'Netflix', icon: 'Tv', amount: 13000, category: 'Entretenimiento', day: 15 },
  { id: 'spotify', name: 'Spotify', icon: 'Music', amount: 5500, category: 'Entretenimiento', day: 1 },
  { id: 'internet', name: 'Internet', icon: 'Wifi', amount: 35000, category: 'Servicios', day: 5 },
  { id: 'telefono', name: 'Telefono', icon: 'Smartphone', amount: 25000, category: 'Servicios', day: 10 },
  { id: 'luz', name: 'Luz', icon: 'Zap', amount: 40000, category: 'Servicios', day: 20 },
  { id: 'agua', name: 'Agua', icon: 'Droplet', amount: 15000, category: 'Servicios', day: 15 },
  { id: 'gas', name: 'Gas', icon: 'Flame', amount: 20000, category: 'Servicios', day: 25 },
  { id: 'arriendo', name: 'Arriendo/Renta', icon: 'Home', amount: 500000, category: 'Servicios', day: 1 },
  { id: 'amazon', name: 'Amazon Prime', icon: 'ShoppingCart', amount: 8000, category: 'Entretenimiento', day: 1 },
  { id: 'disney', name: 'Disney+', icon: 'Film', amount: 10000, category: 'Entretenimiento', day: 1 },
  { id: 'hbo', name: 'HBO Max', icon: 'Play', amount: 12000, category: 'Entretenimiento', day: 1 },
  { id: 'youtube', name: 'YouTube Premium', icon: 'Play', amount: 12000, category: 'Entretenimiento', day: 1 },
];

// Modal de edicion/creacion
const TemplateModal = ({ isOpen, onClose, template, onSave, categories, isNew = false }) => {
  const [form, setForm] = useState(template || {
    name: '',
    icon: 'Coffee',
    amount: '',
    category: 'Alimentacion',
    color: 'bg-blue-500'
  });

  React.useEffect(() => {
    if (template) {
      setForm(template);
    } else {
      setForm({
        name: '',
        icon: 'Coffee',
        amount: '',
        category: 'Alimentacion',
        color: 'bg-blue-500'
      });
    }
  }, [template, isOpen]);

  const handleSave = () => {
    if (!form.name || !form.amount) {
      toast({ title: 'Error', description: 'Nombre y monto son requeridos', variant: 'destructive' });
      return;
    }
    onSave({
      ...form,
      id: form.id || Date.now(),
      amount: parseFloat(form.amount)
    });
    onClose();
  };

  if (!isOpen) return null;

  const IconComponent = AVAILABLE_ICONS[form.icon] || Coffee;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-background rounded-xl border shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">
              {isNew ? 'Crear Gasto Rapido' : 'Editar Gasto Rapido'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preview */}
          <div className="p-4 bg-muted/50 flex justify-center">
            <div className={`flex flex-col items-center justify-center p-4 rounded-xl ${form.color} text-white shadow-lg min-w-[100px]`}>
              <IconComponent className="w-6 h-6 mb-1" />
              <span className="text-sm font-medium">{form.name || 'Nombre'}</span>
              <span className="text-xs opacity-80">${(form.amount || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Form */}
          <div className="p-4 space-y-4">
            {/* Nombre */}
            <div>
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Cafe, Almuerzo, Uber..."
              />
            </div>

            {/* Monto */}
            <div>
              <Label>Monto</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0"
              />
            </div>

            {/* Categoria */}
            <div>
              <Label>Categoria</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Icono */}
            <div>
              <Label>Icono</Label>
              <div className="grid grid-cols-8 gap-2 mt-2 max-h-24 overflow-y-auto p-2 bg-muted rounded-lg">
                {ICON_LIST.map(iconName => {
                  const Icon = AVAILABLE_ICONS[iconName];
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setForm({ ...form, icon: iconName })}
                      className={`p-2 rounded-lg transition-all ${
                        form.icon === iconName
                          ? 'bg-primary text-primary-foreground scale-110'
                          : 'hover:bg-background'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color */}
            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {AVAILABLE_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`w-8 h-8 rounded-full ${color} transition-all ${
                      form.color === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Modal para editar gasto recurrente
const RecurringModal = ({ isOpen, onClose, expense, onSave, categories }) => {
  const [form, setForm] = useState(expense || {
    name: '',
    amount: '',
    category: 'Servicios',
    day: 1
  });

  React.useEffect(() => {
    if (expense) {
      setForm(expense);
    }
  }, [expense, isOpen]);

  const handleSave = () => {
    if (!form.name || !form.amount) {
      toast({ title: 'Error', description: 'Nombre y monto son requeridos', variant: 'destructive' });
      return;
    }
    onSave({
      ...form,
      id: form.id || `custom_${Date.now()}`,
      amount: parseFloat(form.amount),
      day: parseInt(form.day)
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-background rounded-xl border shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">
              {expense ? 'Editar Gasto Recurrente' : 'Crear Gasto Recurrente'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Netflix, Spotify, Internet..."
              />
            </div>

            <div>
              <Label>Monto Mensual</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Categoria</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Dia del mes (1-31)</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={form.day}
                onChange={(e) => setForm({ ...form, day: e.target.value })}
              />
            </div>
          </div>

          <div className="p-4 border-t flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Componente de gasto rapido (1 tap)
const QuickExpenseButton = ({ template, onAdd, onEdit, onDelete, editMode }) => {
  const [isAdding, setIsAdding] = useState(false);
  const IconComponent = AVAILABLE_ICONS[template.icon] || Coffee;

  const handleClick = async () => {
    if (editMode) return;
    setIsAdding(true);
    await onAdd(template);
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <div className="relative group">
      <motion.button
        whileHover={{ scale: editMode ? 1 : 1.05 }}
        whileTap={{ scale: editMode ? 1 : 0.95 }}
        onClick={handleClick}
        disabled={isAdding || editMode}
        className={`relative flex flex-col items-center justify-center p-3 rounded-xl ${template.color} text-white shadow-lg transition-all min-w-[80px] ${editMode ? 'opacity-80' : ''}`}
      >
        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.div
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex flex-col items-center"
            >
              <IconComponent className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{template.name}</span>
              <span className="text-[10px] opacity-80">${template.amount.toLocaleString()}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Botones de edicion */}
      {editMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 flex gap-1"
        >
          <button
            onClick={() => onEdit(template)}
            className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(template.id)}
            className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

// Componente principal de gastos rapidos
const QuickExpenses = () => {
  const { addTransaction, categories } = useFinance();
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('quickExpenseTemplates');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });
  const [recurringExpenses, setRecurringExpenses] = useState(() => {
    const saved = localStorage.getItem('recurringExpenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [editMode, setEditMode] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);

  const expenseCategories = categories?.expense || ['Transporte', 'Salud', 'Alimentacion', 'Servicios', 'Entretenimiento', 'Ocio', 'Educacion', 'Otros'];

  // Guardar templates
  const saveTemplates = (newTemplates) => {
    setTemplates(newTemplates);
    localStorage.setItem('quickExpenseTemplates', JSON.stringify(newTemplates));
  };

  // Guardar recurrentes
  const saveRecurring = (newRecurring) => {
    setRecurringExpenses(newRecurring);
    localStorage.setItem('recurringExpenses', JSON.stringify(newRecurring));
  };

  // Agregar gasto con 1 tap
  const handleQuickAdd = async (template) => {
    const transaction = {
      type: 'expense',
      amount: template.amount,
      description: template.name,
      category: template.category,
      necessity: 'Necesario',
      date: new Date().toISOString().split('T')[0],
      person: 'Usuario'
    };

    addTransaction(transaction);

    toast({
      title: `${template.name} agregado`,
      description: `$${template.amount.toLocaleString()} en ${template.category}`,
      duration: 2000
    });
  };

  // Editar template
  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setModalOpen(true);
  };

  // Guardar template (nuevo o editado)
  const handleSaveTemplate = (template) => {
    const existing = templates.find(t => t.id === template.id);
    if (existing) {
      saveTemplates(templates.map(t => t.id === template.id ? template : t));
      toast({ title: 'Actualizado', description: `${template.name} guardado` });
    } else {
      saveTemplates([...templates, template]);
      toast({ title: 'Creado', description: `${template.name} agregado` });
    }
  };

  // Eliminar template
  const handleDeleteTemplate = (id) => {
    saveTemplates(templates.filter(t => t.id !== id));
    toast({ title: 'Eliminado', description: 'Gasto rapido eliminado' });
  };

  // Crear nuevo template
  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setModalOpen(true);
  };

  // Agregar gasto recurrente desde preset
  const addRecurringFromPreset = (preset) => {
    const exists = recurringExpenses.find(r => r.id === preset.id);
    if (exists) {
      // Editar existente
      setEditingRecurring(exists);
      setRecurringModalOpen(true);
      return;
    }

    const newExpense = { ...preset, enabled: true };
    saveRecurring([...recurringExpenses, newExpense]);
    toast({
      title: 'Gasto recurrente agregado',
      description: `${preset.name} se registrara el dia ${preset.day} de cada mes`
    });
  };

  // Guardar recurrente
  const handleSaveRecurring = (expense) => {
    const existing = recurringExpenses.find(r => r.id === expense.id);
    if (existing) {
      saveRecurring(recurringExpenses.map(r => r.id === expense.id ? { ...expense, enabled: true } : r));
      toast({ title: 'Actualizado', description: `${expense.name} guardado` });
    } else {
      saveRecurring([...recurringExpenses, { ...expense, enabled: true }]);
      toast({ title: 'Creado', description: `${expense.name} agregado` });
    }
  };

  // Editar recurrente
  const handleEditRecurring = (expense) => {
    setEditingRecurring(expense);
    setRecurringModalOpen(true);
  };

  // Eliminar recurrente
  const removeRecurringExpense = (id) => {
    saveRecurring(recurringExpenses.filter(r => r.id !== id));
    toast({ title: 'Eliminado', description: 'Gasto recurrente eliminado' });
  };

  // Crear nuevo recurrente
  const handleNewRecurring = () => {
    setEditingRecurring(null);
    setRecurringModalOpen(true);
  };

  // Procesar gastos recurrentes del mes actual
  const processRecurringExpenses = () => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const processedKey = `recurring_processed_${currentYear}_${currentMonth}`;
    const processed = JSON.parse(localStorage.getItem(processedKey) || '[]');

    let addedCount = 0;

    recurringExpenses.forEach(expense => {
      if (!expense.enabled) return;
      if (processed.includes(expense.id)) return;
      if (currentDay < expense.day) return;

      addTransaction({
        type: 'expense',
        amount: expense.amount,
        description: `${expense.name} (Auto)`,
        category: expense.category,
        necessity: 'Indispensable',
        date: new Date(currentYear, currentMonth, expense.day).toISOString().split('T')[0],
        person: 'Usuario',
        isRecurring: true
      });

      processed.push(expense.id);
      addedCount++;
    });

    if (addedCount > 0) {
      localStorage.setItem(processedKey, JSON.stringify(processed));
      toast({
        title: 'Gastos automaticos procesados',
        description: `${addedCount} gasto(s) recurrente(s) registrado(s)`
      });
    }
  };

  React.useEffect(() => {
    if (recurringExpenses.length > 0) {
      processRecurringExpenses();
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold">Gastos Rapidos</h3>
          <span className="text-xs text-muted-foreground">1 tap = registrado</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={editMode ? "default" : "ghost"}
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="text-xs"
          >
            <Settings className={`w-4 h-4 mr-1 ${editMode ? 'animate-spin' : ''}`} />
            {editMode ? 'Listo' : 'Editar'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRecurring(!showRecurring)}
            className="text-xs"
          >
            <Repeat className="w-4 h-4 mr-1" />
            Fijos ({recurringExpenses.length})
          </Button>
        </div>
      </div>

      {/* Plantillas de gastos rapidos */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {templates.map(template => (
          <QuickExpenseButton
            key={template.id}
            template={template}
            onAdd={handleQuickAdd}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
            editMode={editMode}
          />
        ))}

        {/* Boton agregar */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNewTemplate}
          className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-all min-w-[80px]"
        >
          <Plus className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Agregar</span>
        </motion.button>
      </div>

      {/* Panel de gastos recurrentes */}
      <AnimatePresence>
        {showRecurring && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-muted/50 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <Repeat className="w-4 h-4" />
                  Gastos Fijos Mensuales
                </h4>
                <Button variant="outline" size="sm" onClick={handleNewRecurring}>
                  <Plus className="w-4 h-4 mr-1" />
                  Crear Nuevo
                </Button>
              </div>

              {/* Gastos recurrentes activos */}
              {recurringExpenses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Activos (tap para editar):</p>
                  <div className="flex flex-wrap gap-2">
                    {recurringExpenses.map(expense => (
                      <button
                        key={expense.id}
                        onClick={() => handleEditRecurring(expense)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-sm hover:bg-green-500/20 transition-colors"
                      >
                        <Check className="w-3 h-3 text-green-500" />
                        <span>{expense.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ${expense.amount.toLocaleString()} - Dia {expense.day}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeRecurringExpense(expense.id); }}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Presets disponibles */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Agregar gasto fijo (tap para personalizar):</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {RECURRING_PRESETS.filter(p => !recurringExpenses.find(r => r.id === p.id)).map(preset => {
                    const IconComponent = AVAILABLE_ICONS[preset.icon] || DollarSign;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => addRecurringFromPreset(preset)}
                        className="flex items-center gap-2 p-2 bg-background border rounded-lg hover:border-primary transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{preset.name}</p>
                          <p className="text-xs text-muted-foreground">${preset.amount.toLocaleString()}</p>
                        </div>
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modales */}
      <TemplateModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTemplate(null); }}
        template={editingTemplate}
        onSave={handleSaveTemplate}
        categories={expenseCategories}
        isNew={!editingTemplate}
      />

      <RecurringModal
        isOpen={recurringModalOpen}
        onClose={() => { setRecurringModalOpen(false); setEditingRecurring(null); }}
        expense={editingRecurring}
        onSave={handleSaveRecurring}
        categories={expenseCategories}
      />
    </div>
  );
};

export default QuickExpenses;
