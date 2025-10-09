import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, TrendingUp, TrendingDown, Trash2, User, UserPlus, PiggyBank, Landmark, Calendar, Filter, X } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const Records = () => {
  const { transactions, addTransaction, deleteTransaction, categories, addCategory, users, addUser, necessityLevels, addNecessityLevel } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showNewUserInput, setShowNewUserInput] = useState(false);
  const [showNewNecessityInput, setShowNewNecessityInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newUser, setNewUser] = useState('');
  const [newNecessity, setNewNecessity] = useState('');

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

  const [filters, setFilters] = useState({
    searchTerm: '',
    category: 'all',
    necessity: 'all',
    person: 'all',
    startDate: '',
    endDate: '',
  });

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    person: users[0],
    necessity: ''
  });

  const handleNotImplemented = () => {
    toast({
      title: '🚧 Función no implementada',
      description: "¡Esta característica estará disponible pronto! 🚀",
    });
  };

  const handleAddCategory = () => {
    if(newCategory.trim() === '') return;
    addCategory(newCategory, formData.type);
    setFormData({...formData, category: newCategory});
    setNewCategory('');
    setShowNewCategoryInput(false);
    toast({ title: "¡Éxito!", description: `Categoría "${newCategory}" agregada` });
  }

  const handleAddUser = () => {
    if(newUser.trim() === '') return;
    addUser(newUser);
    setFormData({...formData, person: newUser});
    setNewUser('');
    setShowNewUserInput(false);
    toast({ title: "¡Éxito!", description: `Persona "${newUser}" agregada` });
  }

  const handleAddNecessity = () => {
    if(newNecessity.trim() === '') return;
    addNecessityLevel(newNecessity);
    setFormData({...formData, necessity: newNecessity});
    setNewNecessity('');
    setShowNewNecessityInput(false);
    toast({ title: "¡Éxito!", description: `Nivel "${newNecessity}" agregado` });
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
    setFormData({ type: 'expense', amount: '', description: '', category: '', date: new Date().toISOString().split('T')[0], person: users[0], necessity: '' });
  };

  const handleDelete = (id) => {
    deleteTransaction(id);
    toast({ title: "Eliminado", description: "Transacción eliminada correctamente" });
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const searchTermMatch = t.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const categoryMatch = filters.category === 'all' || t.category === filters.category;
      const necessityMatch = filters.necessity === 'all' || t.necessity === filters.necessity;
      const personMatch = filters.person === 'all' || t.person === filters.person;
      const date = new Date(t.date);
      const startDateMatch = !filters.startDate || date >= new Date(filters.startDate);
      const endDateMatch = !filters.endDate || date <= new Date(filters.endDate);
      return searchTermMatch && categoryMatch && necessityMatch && personMatch && startDateMatch && endDateMatch;
    });
  }, [transactions, filters]);

  const resetFilters = () => {
    setFilters({ searchTerm: '', category: 'all', necessity: 'all', person: 'all', startDate: '', endDate: '' });
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Registros
          </h2>
          <p className="text-muted-foreground mt-1">Gestiona todos tus movimientos financieros</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>Registrar Gasto/Ingreso</DropdownMenuItem>
            <DropdownMenuItem onClick={handleNotImplemented}><PiggyBank className="w-4 h-4 mr-2" />Registrar Ahorro</DropdownMenuItem>
            <DropdownMenuItem onClick={handleNotImplemented}><Landmark className="w-4 h-4 mr-2" />Registrar Deuda</DropdownMenuItem>
            <DropdownMenuItem onClick={handleNotImplemented}><Calendar className="w-4 h-4 mr-2" />Próximos Pagos</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Buscar por descripción..." value={filters.searchTerm} onChange={(e) => setFilters({...filters, searchTerm: e.target.value})} className="pl-10" />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filtros Avanzados
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Filtros</h4>
                <p className="text-sm text-muted-foreground">Ajusta la vista de tus registros.</p>
              </div>
              <div className="grid gap-2">
                <Label>Categoría</Label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="all">Todas</option>
                  {categories.expense.map(c => <option key={c} value={c}>{c}</option>)}
                  {categories.income.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <Label>Necesidad</Label>
                <select
                  value={filters.necessity}
                  onChange={(e) => setFilters({...filters, necessity: e.target.value})}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="all">Todas</option>
                  {necessityLevels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>

                <Label>Persona</Label>
                <select
                  value={filters.person}
                  onChange={(e) => setFilters({...filters, person: e.target.value})}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="all">Todas</option>
                  {users.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Desde</Label><Input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} /></div>
                  <div><Label>Hasta</Label><Input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} /></div>
                </div>
                <Button variant="ghost" onClick={resetFilters} className="w-full justify-start p-0 h-auto"><X className="w-4 h-4 mr-2" />Limpiar filtros</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </Card>

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
              <p className="text-lg">No se encontraron registros</p>
              <p className="text-sm mt-2">{transactions.length > 0 ? "Ajusta los filtros o agrega un nuevo registro." : "Agrega tu primer registro para comenzar."}</p>
            </div>
          </Card>
        )}
      </div>

      <AnimatePresence>
        {isDialogOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDialogOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-background rounded-lg border shadow-lg"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Agregar Registro</h2>
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
              {!showNewCategoryInput ? (
                <div className="flex gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex-grow"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories[formData.type].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <Button type="button" variant="outline" size="icon" onClick={() => setShowNewCategoryInput(true)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    placeholder="Ej: Viajes"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory();
                      }
                      if (e.key === 'Escape') {
                        setShowNewCategoryInput(false);
                        setNewCategory('');
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddCategory}>Agregar</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowNewCategoryInput(false); setNewCategory(''); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>Persona</Label>
              {!showNewUserInput ? (
                <div className="flex gap-2">
                  <select
                    value={formData.person}
                    onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex-grow"
                  >
                    {users.map(user => <option key={user} value={user}>{user}</option>)}
                  </select>
                  <Button type="button" variant="outline" size="icon" onClick={() => setShowNewUserInput(true)}>
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={newUser}
                    onChange={e => setNewUser(e.target.value)}
                    placeholder="Ej: Jane Doe"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddUser();
                      }
                      if (e.key === 'Escape') {
                        setShowNewUserInput(false);
                        setNewUser('');
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddUser}>Agregar</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowNewUserInput(false); setNewUser(''); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Nivel de Necesidad</Label>
              {!showNewNecessityInput ? (
                <div className="flex gap-2">
                  <select
                    value={formData.necessity}
                    onChange={(e) => setFormData({ ...formData, necessity: e.target.value })}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex-grow"
                  >
                    <option value="">Selecciona nivel de necesidad</option>
                    {necessityLevels.map(level => <option key={level} value={level}>{level}</option>)}
                  </select>
                  <Button type="button" variant="outline" size="icon" onClick={() => setShowNewNecessityInput(true)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={newNecessity}
                    onChange={e => setNewNecessity(e.target.value)}
                    placeholder="Ej: Muy necesario"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNecessity();
                      }
                      if (e.key === 'Escape') {
                        setShowNewNecessityInput(false);
                        setNewNecessity('');
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddNecessity}>Agregar</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowNewNecessityInput(false); setNewNecessity(''); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
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

export default Records;