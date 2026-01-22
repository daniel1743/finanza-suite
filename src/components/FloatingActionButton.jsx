
    import React, { useState, useEffect } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Plus, X, UserPlus, PiggyBank, Landmark, Calendar, DollarSign, Wallet } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useFinance } from '@/contexts/FinanceContext';
    import { toast } from '@/components/ui/use-toast';

    // Modal Component - Centrado con flexbox
    const CustomModal = ({ isOpen, onClose, title, children }) => {
      useEffect(() => {
        if (isOpen) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = 'unset';
        }
        return () => {
          document.body.style.overflow = 'unset';
        };
      }, [isOpen]);

      return (
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Overlay con flexbox para centrado */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center"
              >
                {/* Modal centrado - stopPropagation para que click en modal no cierre */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-[calc(100%-2rem)] max-w-lg bg-background rounded-xl border shadow-2xl flex flex-col"
                  style={{ maxHeight: '90vh' }}
                >
                  {/* Header fijo */}
                  <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full p-2 hover:bg-muted transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  {/* Contenido scrolleable */}
                  <div className="overflow-y-auto p-4 md:p-6 flex-1">
                    {children}
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      );
    };

    const FloatingActionButton = ({ hidden }) => {
      const { addTransaction, addCategory, categories, users, addUser, necessityLevels, addNecessityLevel, addDebt } = useFinance();
      const [isOpen, setIsOpen] = useState(false);

      const [isExpenseOpen, setExpenseOpen] = useState(false);
      const [isSavingsOpen, setSavingsOpen] = useState(false);
      const [isSalaryOpen, setSalaryOpen] = useState(false);
      const [isDebtOpen, setDebtOpen] = useState(false);
      const [isPaymentsOpen, setPaymentsOpen] = useState(false);

      const [expenseForm, setExpenseForm] = useState({
        type: 'expense', amount: '', description: '', category: 'Transporte', necessity: 'Necesario', date: new Date().toISOString().split('T')[0], person: users[0]
      });
      const [savingsForm, setSavingsForm] = useState({ amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      const [salaryForm, setSalaryForm] = useState({ amount: '', description: 'Salario Mensual', date: new Date().toISOString().split('T')[0] });
      const [debtForm, setDebtForm] = useState({ name: '', totalAmount: '', monthlyPayment: '', dueDate: '' });

      const [newCategory, setNewCategory] = useState('');
      const [newUser, setNewUser] = useState('');
      const [newNecessity, setNewNecessity] = useState('');

      const [paymentForm, setPaymentForm] = useState({
        name: '',
        amount: '',
        dueDate: '',
        category: 'Servicios',
        recurring: false
      });

      const closeAllModals = () => {
        setIsOpen(false);
        setExpenseOpen(false);
        setSavingsOpen(false);
        setSalaryOpen(false);
        setDebtOpen(false);
        setPaymentsOpen(false);
      };

      const handleExpenseSubmit = (e) => {
        e.preventDefault();
        if (!expenseForm.amount || !expenseForm.description) return;
        addTransaction({ ...expenseForm, type: 'expense' });
        toast({ title: 'Éxito', description: 'Gasto añadido.' });
        closeAllModals();
        setExpenseForm({ type: 'expense', amount: '', description: '', category: 'Transporte', necessity: 'Necesario', date: new Date().toISOString().split('T')[0], person: users[0] });
      };

      const handleSavingsSubmit = (e) => {
        e.preventDefault();
        if (!savingsForm.amount) return;
        addTransaction({ ...savingsForm, type: 'income', category: 'Ahorro' });
        toast({ title: 'Éxito', description: 'Ahorro registrado.' });
        closeAllModals();
        setSavingsForm({ amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      };

      const handleSalarySubmit = (e) => {
        e.preventDefault();
        if (!salaryForm.amount) return;
        addTransaction({ ...salaryForm, type: 'income', category: 'Salario' });
        toast({ title: 'Éxito', description: 'Sueldo registrado.' });
        closeAllModals();
        setSalaryForm({ amount: '', description: 'Salario Mensual', date: new Date().toISOString().split('T')[0] });
      };

      const handleDebtSubmit = (e) => {
        e.preventDefault();
        if (!debtForm.name || !debtForm.totalAmount) return;
        addDebt(debtForm);
        toast({ title: 'Éxito', description: 'Deuda registrada correctamente.' });
        closeAllModals();
        setDebtForm({ name: '', totalAmount: '', monthlyPayment: '', dueDate: '' });
      };

      const handlePaymentSubmit = (e) => {
        e.preventDefault();
        if (!paymentForm.name || !paymentForm.amount || !paymentForm.dueDate) {
          toast({ title: 'Error', description: 'Completa todos los campos requeridos.', variant: 'destructive' });
          return;
        }
        // Guardar como recordatorio (puedes agregar al contexto si quieres)
        toast({
          title: '✅ Pago programado',
          description: `${paymentForm.name} - Vence: ${new Date(paymentForm.dueDate).toLocaleDateString()}`
        });
        closeAllModals();
        setPaymentForm({ name: '', amount: '', dueDate: '', category: 'Servicios', recurring: false });
      };

      const fabVariants = {
        closed: { scale: 1, rotate: 0 },
        open: { scale: 1.1, rotate: 45 },
        hidden: { scale: 0, y: 20 }
      };

      const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.8 },
        visible: (i) => ({
          opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.1, type: 'spring', stiffness: 260, damping: 20 },
        }),
      };

      const actionItems = [
        { label: "Agregar Gastos", icon: Wallet, action: () => setExpenseOpen(true), color: "bg-sky-500", custom: 0},
        { label: "Próximos Pagos", icon: Calendar, action: () => setPaymentsOpen(true), color: "bg-amber-500", custom: 1},
        { label: "Registrar Deudas", icon: Landmark, action: () => setDebtOpen(true), color: "bg-red-500", custom: 2},
        { label: "Registrar Sueldo", icon: DollarSign, action: () => setSalaryOpen(true), color: "bg-green-500", custom: 3},
        { label: "Registrar Ahorros", icon: PiggyBank, action: () => setSavingsOpen(true), color: "bg-indigo-500", custom: 4 },
      ];

      return (
        <>
          <motion.div 
            className="relative"
            variants={{visible: {scale: 1, opacity: 1}, hidden: {scale: 0, opacity: 0, y: 20}}}
            animate={hidden ? "hidden" : "visible"}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <AnimatePresence>
              {isOpen && (
                <motion.div className="flex flex-col items-center gap-4 mb-4 absolute bottom-full right-0">
                   {actionItems.map(item => {
                     const Icon = item.icon;
                     return (
                       <motion.div key={item.label} custom={item.custom} variants={itemVariants} initial="hidden" animate="visible" exit="hidden" className="flex items-center gap-2">
                         <span className="bg-card p-2 rounded-lg shadow-md text-sm whitespace-nowrap">{item.label}</span>
                         <Button size="icon" onClick={() => { item.action(); setIsOpen(false); }} className={`rounded-full shadow-lg w-10 h-10 ${item.color}`}>
                           <Icon className="h-5 w-5" />
                         </Button>
                       </motion.div>
                     )
                   })}
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              variants={fabVariants}
              animate={isOpen ? 'open' : 'closed'}
              onClick={() => setIsOpen(!isOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-2xl"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
            </motion.button>
          </motion.div>

          {/* Modal Gastos */}
          <CustomModal isOpen={isExpenseOpen} onClose={() => setExpenseOpen(false)} title="Agregar Gasto">
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div><Label>Monto</Label><Input type="number" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} placeholder="0.00" /></div>
              <div><Label>Descripción</Label><Input value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="Ej: Café con amigos" /></div>
              <div><Label>Categoría</Label><select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">{categories.expense.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
              <div><Label>Nivel de Necesidad</Label><select value={expenseForm.necessity} onChange={(e) => setExpenseForm({ ...expenseForm, necessity: e.target.value })} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">{necessityLevels.map(level => <option key={level} value={level}>{level}</option>)}</select></div>
              <div><Label>Persona</Label><select value={expenseForm.person} onChange={(e) => setExpenseForm({ ...expenseForm, person: e.target.value })} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">{users.map(user => <option key={user} value={user}>{user}</option>)}</select></div>
              <div><Label>Fecha</Label><Input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} /></div>
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500">Agregar Gasto</Button>
            </form>
          </CustomModal>

          {/* Modal Ahorros */}
          <CustomModal isOpen={isSavingsOpen} onClose={() => setSavingsOpen(false)} title="Registrar Ahorro">
            <form onSubmit={handleSavingsSubmit} className="space-y-4">
              <div><Label>Monto</Label><Input type="number" step="0.01" value={savingsForm.amount} onChange={(e) => setSavingsForm({ ...savingsForm, amount: e.target.value })} placeholder="0.00" /></div>
              <div><Label>Descripción (Opcional)</Label><Input value={savingsForm.description} onChange={(e) => setSavingsForm({ ...savingsForm, description: e.target.value })} placeholder="Ej: Ahorro para vacaciones" /></div>
              <div><Label>Fecha</Label><Input type="date" value={savingsForm.date} onChange={(e) => setSavingsForm({ ...savingsForm, date: e.target.value })} /></div>
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500">Registrar Ahorro</Button>
            </form>
          </CustomModal>

          {/* Modal Sueldo */}
          <CustomModal isOpen={isSalaryOpen} onClose={() => setSalaryOpen(false)} title="Registrar Sueldo">
            <form onSubmit={handleSalarySubmit} className="space-y-4">
              <div><Label>Monto</Label><Input type="number" step="0.01" value={salaryForm.amount} onChange={(e) => setSalaryForm({ ...salaryForm, amount: e.target.value })} placeholder="0.00" /></div>
              <div><Label>Descripción</Label><Input value={salaryForm.description} onChange={(e) => setSalaryForm({ ...salaryForm, description: e.target.value })} /></div>
              <div><Label>Fecha</Label><Input type="date" value={salaryForm.date} onChange={(e) => setSalaryForm({ ...salaryForm, date: e.target.value })} /></div>
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500">Registrar Sueldo</Button>
            </form>
          </CustomModal>

          {/* Modal Deuda */}
          <CustomModal isOpen={isDebtOpen} onClose={() => setDebtOpen(false)} title="Registrar Deuda">
            <form onSubmit={handleDebtSubmit} className="space-y-4">
              <div><Label>Nombre de la Deuda</Label><Input value={debtForm.name} onChange={(e) => setDebtForm({ ...debtForm, name: e.target.value })} placeholder="Ej: Tarjeta de Crédito" /></div>
              <div><Label>Monto Total</Label><Input type="number" step="0.01" value={debtForm.totalAmount} onChange={(e) => setDebtForm({ ...debtForm, totalAmount: e.target.value })} placeholder="0.00" /></div>
              <div><Label>Pago Mensual (Opcional)</Label><Input type="number" step="0.01" value={debtForm.monthlyPayment} onChange={(e) => setDebtForm({ ...debtForm, monthlyPayment: e.target.value })} placeholder="0.00" /></div>
              <div><Label>Fecha de Vencimiento (Opcional)</Label><Input type="date" value={debtForm.dueDate} onChange={(e) => setDebtForm({ ...debtForm, dueDate: e.target.value })} /></div>
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500">Registrar Deuda</Button>
            </form>
          </CustomModal>

          {/* Modal Próximos Pagos */}
          <CustomModal isOpen={isPaymentsOpen} onClose={() => setPaymentsOpen(false)} title="Programar Pago">
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div><Label>Nombre del Pago</Label><Input value={paymentForm.name} onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })} placeholder="Ej: Internet" /></div>
              <div><Label>Monto</Label><Input type="number" step="0.01" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder="0.00" /></div>
              <div><Label>Categoría</Label><select value={paymentForm.category} onChange={(e) => setPaymentForm({ ...paymentForm, category: e.target.value })} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">{categories.expense.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
              <div><Label>Fecha de Vencimiento</Label><Input type="date" value={paymentForm.dueDate} onChange={(e) => setPaymentForm({ ...paymentForm, dueDate: e.target.value })} /></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="recurring" checked={paymentForm.recurring} onChange={(e) => setPaymentForm({ ...paymentForm, recurring: e.target.checked })} className="w-4 h-4" />
                <Label htmlFor="recurring">Pago recurrente mensual</Label>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500">Programar Pago</Button>
            </form>
          </CustomModal>

        </>
      );
    };

    export default FloatingActionButton;
  