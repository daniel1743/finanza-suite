import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, TrendingUp, TrendingDown, Trash2, User, UserPlus, X } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const Transactions = () => {
  const { transactions, addTransaction, deleteTransaction, categories, addCategory, users, addUser, necessityLevels } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    person: users[0],
    necessity: ''
  });

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (isDialogOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDialogOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.category) {
      toast({ title: "Error", description: "Por favor completa todos los campos", variant: "destructive" });
      return;
    }
    addTransaction(formData);
    toast({ title: "¡Éxito!", description: "Transacción agregada correctamente" });
    setIsDialogOpen(false);
    setFormData({ type: 'expense', amount: '', description: '', category: '', date: new Date().toISOString().split('T')[0], person: users[0], necessity: '' });
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
        <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Transacción
        </Button>
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

      {/* Modal custom */}
      <AnimatePresence>
        {isDialogOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDialogOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[60] md:w-full md:max-w-lg md:inset-auto bg-background rounded-lg border shadow-lg flex flex-col"
              style={{ maxHeight: 'calc(100vh - 2rem)' }}
            >
              <div className="overflow-y-auto p-4 md:p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Agregar Transacción</h2>
                  <button
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value, category: ''})}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="expense">Gasto</option>
                      <option value="income">Ingreso</option>
                    </select>
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
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories[formData.type].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Nivel de Necesidad</Label>
                    <select
                      value={formData.necessity}
                      onChange={(e) => setFormData({...formData, necessity: e.target.value})}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="">Selecciona nivel de necesidad</option>
                      {necessityLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Persona</Label>
                    <select
                      value={formData.person}
                      onChange={(e) => setFormData({...formData, person: e.target.value})}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {users.map(user => (
                        <option key={user} value={user}>{user}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500">Agregar</Button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;