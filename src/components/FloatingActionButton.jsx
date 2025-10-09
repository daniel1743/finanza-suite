
    import React, { useState } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Plus, X, UserPlus, PiggyBank, Landmark, Calendar, DollarSign, Wallet } from 'lucide-react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useFinance } from '@/contexts/FinanceContext';
    import { toast } from '@/components/ui/use-toast';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

    const FloatingActionButton = ({ hidden }) => {
      const { addTransaction, addCategory, categories, users, addUser, necessityLevels, addNecessityLevel, addDebt } = useFinance();
      const [isOpen, setIsOpen] = useState(false);
      
      const [isExpenseOpen, setExpenseOpen] = useState(false);
      const [isSavingsOpen, setSavingsOpen] = useState(false);
      const [isSalaryOpen, setSalaryOpen] = useState(false);
      const [isDebtOpen, setDebtOpen] = useState(false);
      
      const [isNewCategoryOpen, setNewCategoryOpen] = useState(false);
      const [isNewUserOpen, setNewUserOpen] = useState(false);
      const [isNewNecessityOpen, setNewNecessityOpen] = useState(false);

      const [expenseForm, setExpenseForm] = useState({
        type: 'expense', amount: '', description: '', category: 'Transporte', necessity: 'Necesario', date: new Date().toISOString().split('T')[0], person: users[0]
      });
      const [savingsForm, setSavingsForm] = useState({ amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      const [salaryForm, setSalaryForm] = useState({ amount: '', description: 'Salario Mensual', date: new Date().toISOString().split('T')[0] });
      const [debtForm, setDebtForm] = useState({ name: '', totalAmount: '', monthlyPayment: '', dueDate: '' });

      const [newCategory, setNewCategory] = useState('');
      const [newUser, setNewUser] = useState('');
      const [newNecessity, setNewNecessity] = useState('');

      const closeAllModals = () => {
        setIsOpen(false);
        setExpenseOpen(false);
        setSavingsOpen(false);
        setSalaryOpen(false);
        setDebtOpen(false);
      };
      
      const handleNotImplemented = () => {
        toast({
            title: "🚧 Función no implementada",
            description: "¡Esta característica estará disponible pronto! 🚀",
        });
        setIsOpen(false);
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
        toast({ title: 'Éxito', description: 'Deuda registrada.' });
        closeAllModals();
        setDebtForm({ name: '', totalAmount: '', monthlyPayment: '', dueDate: '' });
      };

      const handleAddCategory = () => {
          if(newCategory.trim() === '') return;
          addCategory(newCategory);
          setExpenseForm({...expenseForm, category: newCategory});
          setNewCategoryOpen(false);
          setNewCategory('');
      };

      const handleAddUser = () => {
        if(newUser.trim() === '') return;
        addUser(newUser);
        setExpenseForm({...expenseForm, person: newUser});
        setNewUserOpen(false);
        setNewUser('');
      };

      const handleAddNecessity = () => {
        if(newNecessity.trim() === '') return;
        addNecessityLevel(newNecessity);
        setExpenseForm({...expenseForm, necessity: newNecessity});
        setNewNecessityOpen(false);
        setNewNecessity('');
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
        { label: "Próximos Pagos", icon: Calendar, action: handleNotImplemented, color: "bg-amber-500", custom: 1},
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

           <Dialog open={isExpenseOpen} onOpenChange={setExpenseOpen}>
             <DialogContent className="max-h-[90vh] overflow-y-auto">
               <DialogHeader><DialogTitle>Agregar Gasto</DialogTitle></DialogHeader>
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                 <div><Label>Monto</Label><Input type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} placeholder="0.00" /></div>
                 <div><Label>Descripción</Label><Input value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="Ej: Café con amigos" /></div>
                 <div>
                   <Label>Categoría</Label>
                   <div className="flex gap-2">
                     <Select value={expenseForm.category} onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}>
                       <SelectTrigger className="flex-grow"><SelectValue /></SelectTrigger>
                       <SelectContent>{categories.expense.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                     </Select>
                     <Dialog open={isNewCategoryOpen} onOpenChange={setNewCategoryOpen}><DialogTrigger asChild><Button type="button" variant="outline" size="icon"><Plus className="w-4 h-4" /></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nueva Categoría</DialogTitle></DialogHeader><div className="flex gap-2 mt-4"><Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Ej: Viajes" /><Button onClick={handleAddCategory}>Agregar</Button></div></DialogContent></Dialog>
                   </div>
                 </div>
                  <div>
                     <Label>Nivel de Necesidad</Label>
                     <div className="flex gap-2">
                     <Select value={expenseForm.necessity} onValueChange={(value) => setExpenseForm({ ...expenseForm, necessity: value })}>
                         <SelectTrigger className="flex-grow"><SelectValue /></SelectTrigger>
                         <SelectContent>{necessityLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent>
                     </Select>
                      <Dialog open={isNewNecessityOpen} onOpenChange={setNewNecessityOpen}><DialogTrigger asChild><Button type="button" variant="outline" size="icon"><Plus className="w-4 h-4" /></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nuevo Nivel de Necesidad</DialogTitle></DialogHeader><div className="flex gap-2 mt-4"><Input value={newNecessity} onChange={e => setNewNecessity(e.target.value)} placeholder="Ej: Lujo Ocasional" /><Button onClick={handleAddNecessity}>Agregar</Button></div></DialogContent></Dialog>
                     </div>
                  </div>
                  <div>
                   <Label>Persona</Label>
                   <div className="flex gap-2">
                     <Select value={expenseForm.person} onValueChange={(value) => setExpenseForm({ ...expenseForm, person: value })}>
                       <SelectTrigger className="flex-grow"><SelectValue /></SelectTrigger>
                       <SelectContent>{users.map(user => <SelectItem key={user} value={user}>{user}</SelectItem>)}</SelectContent>
                     </Select>
                     <Dialog open={isNewUserOpen} onOpenChange={setNewUserOpen}><DialogTrigger asChild><Button type="button" variant="outline" size="icon"><UserPlus className="w-4 h-4" /></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Añadir Persona</DialogTitle></DialogHeader><div className="flex gap-2 mt-4"><Input value={newUser} onChange={e => setNewUser(e.target.value)} placeholder="Ej: Jane Doe" /><Button onClick={handleAddUser}>Agregar</Button></div></DialogContent></Dialog>
                   </div>
                 </div>
                 <div><Label>Fecha</Label><Input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} /></div>
                 <Button type="submit" className="w-full">Agregar Gasto</Button>
               </form>
             </DialogContent>
           </Dialog>

           <Dialog open={isSavingsOpen} onOpenChange={setSavingsOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Registrar Ahorro</DialogTitle></DialogHeader>
                    <form onSubmit={handleSavingsSubmit} className="space-y-4">
                        <div><Label>Monto</Label><Input type="number" value={savingsForm.amount} onChange={(e) => setSavingsForm({ ...savingsForm, amount: e.target.value })} placeholder="0.00" /></div>
                        <div><Label>Descripción (Opcional)</Label><Input value={savingsForm.description} onChange={(e) => setSavingsForm({ ...savingsForm, description: e.target.value })} placeholder="Ej: Ahorro para vacaciones" /></div>
                        <div><Label>Fecha</Label><Input type="date" value={savingsForm.date} onChange={(e) => setSavingsForm({ ...savingsForm, date: e.target.value })} /></div>
                        <Button type="submit" className="w-full">Registrar Ahorro</Button>
                    </form>
                </DialogContent>
           </Dialog>

            <Dialog open={isSalaryOpen} onOpenChange={setSalaryOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Registrar Sueldo</DialogTitle></DialogHeader>
                    <form onSubmit={handleSalarySubmit} className="space-y-4">
                        <div><Label>Monto</Label><Input type="number" value={salaryForm.amount} onChange={(e) => setSalaryForm({ ...salaryForm, amount: e.target.value })} placeholder="0.00" /></div>
                        <div><Label>Descripción</Label><Input value={salaryForm.description} onChange={(e) => setSalaryForm({ ...salaryForm, description: e.target.value })} /></div>
                        <div><Label>Fecha</Label><Input type="date" value={salaryForm.date} onChange={(e) => setSalaryForm({ ...salaryForm, date: e.target.value })} /></div>
                        <Button type="submit" className="w-full">Registrar Sueldo</Button>
                    </form>
                </DialogContent>
           </Dialog>

            <Dialog open={isDebtOpen} onOpenChange={setDebtOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Registrar Deuda</DialogTitle></DialogHeader>
                    <form onSubmit={handleDebtSubmit} className="space-y-4">
                        <div><Label>Nombre de la Deuda</Label><Input value={debtForm.name} onChange={(e) => setDebtForm({ ...debtForm, name: e.target.value })} placeholder="Ej: Tarjeta de Crédito" /></div>
                        <div><Label>Monto Total</Label><Input type="number" value={debtForm.totalAmount} onChange={(e) => setDebtForm({ ...debtForm, totalAmount: e.target.value })} placeholder="0.00" /></div>
                        <div><Label>Pago Mensual (Opcional)</Label><Input type="number" value={debtForm.monthlyPayment} onChange={(e) => setDebtForm({ ...debtForm, monthlyPayment: e.target.value })} placeholder="0.00" /></div>
                        <div><Label>Fecha de Vencimiento (Opcional)</Label><Input type="date" value={debtForm.dueDate} onChange={(e) => setDebtForm({ ...debtForm, dueDate: e.target.value })} /></div>
                        <Button type="submit" className="w-full">Registrar Deuda</Button>
                    </form>
                </DialogContent>
           </Dialog>

        </>
      );
    };

    export default FloatingActionButton;
  