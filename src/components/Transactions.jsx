import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, TrendingUp, TrendingDown, Trash2, User, UserPlus } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

const Transactions = () => {
  const { transactions, addTransaction, deleteTransaction, categories, addCategory, users, addUser } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewCategoryOpen, setNewCategoryOpen] = useState(false);
  const [isNewUserOpen, setNewUserOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newUser, setNewUser] = useState('');
  
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    person: users[0]
  });

  const handleAddCategory = () => {
    if(newCategory.trim() === '') return;
    addCategory(newCategory, formData.type);
    setFormData({...formData, category: newCategory});
    setNewCategoryOpen(false);
    setNewCategory('');
  }

  const handleAddUser = () => {
    if(newUser.trim() === '') return;
    addUser(newUser);
    setFormData({...formData, person: newUser});
    setNewUserOpen(false);
    setNewUser('');
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.category) {
      toast({ title: "Error", description: "Por favor completa todos los campos", variant: "destructive" });
      return;
    }
    addTransaction(formData);
    toast({ title: "¡Éxito!", description: "Transacción agregada correctamente" });
    setIsDialogOpen(false);
    setFormData({ type: 'expense', amount: '', description: '', category: '', date: new Date().toISOString().split('T')[0], person: users[0] });
  };

  const handleDelete = (id) => {
    deleteTransaction(id);
    toast({ title: "Eliminado", description: "Transacción eliminada correctamente" });
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [transactions, searchTerm]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Transacciones
          </h2>
          <p className="text-muted-foreground mt-1">Gestiona todos tus movimientos financieros</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Transacción
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agregar Transacción</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value, category: ''})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Gasto</SelectItem>
                    <SelectItem value="income">Ingreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Monto</Label>
                <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Ej: Compra de supermercado" />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <div className="flex gap-2">
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger className="flex-grow">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories[formData.type].map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={isNewCategoryOpen} onOpenChange={setNewCategoryOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon"><Plus className="w-4 h-4" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Nueva Categoría</DialogTitle></DialogHeader>
                      <div className="flex gap-2 mt-4">
                        <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Ej: Viajes" />
                        <Button onClick={handleAddCategory}>Agregar</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Persona</Label>
                <div className="flex gap-2">
                  <Select value={formData.person} onValueChange={(value) => setFormData({ ...formData, person: value })}>
                    <SelectTrigger className="flex-grow"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {users.map(user => <SelectItem key={user} value={user}>{user}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Dialog open={isNewUserOpen} onOpenChange={setNewUserOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon"><UserPlus className="w-4 h-4" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Añadir Persona</DialogTitle></DialogHeader>
                      <div className="flex gap-2 mt-4">
                        <Input value={newUser} onChange={e => setNewUser(e.target.value)} placeholder="Ej: Jane Doe" />
                        <Button onClick={handleAddUser}>Agregar</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500">Agregar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input placeholder="Buscar transacciones..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="space-y-3 pb-24 md:pb-8">
        {filteredTransactions.map((transaction, index) => (
          <motion.div key={transaction.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${ transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20' }`}>
                    {transaction.type === 'income' ? (<TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-500" />) : (<TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-red-500" />)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base md:text-lg truncate">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                      <span>{transaction.category}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{transaction.person}</span>
                      <span>•</span>
                      <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                  <p className={`text-lg md:text-2xl font-bold ${ transaction.type === 'income' ? 'text-green-500' : 'text-red-500' }`}>
                    {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toLocaleString()}
                  </p>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(transaction.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 w-8 md:h-9 md:w-9">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
        {filteredTransactions.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg">No se encontraron transacciones</p>
              <p className="text-sm mt-2">{transactions.length > 0 ? "Prueba con otro término de búsqueda." : "Agrega tu primera transacción para comenzar."}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Transactions;