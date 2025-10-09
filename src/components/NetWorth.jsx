import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Trash2 } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const NetWorth = () => {
  const { accounts, debts, addDebt, deleteDebt } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [debtForm, setDebtForm] = useState({
    name: '',
    amount: '',
    interestRate: '',
    monthlyPayment: ''
  });

  const totalAssets = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
  const totalDebts = debts.reduce((sum, debt) => sum + parseFloat(debt.amount || 0), 0);
  const netWorth = totalAssets - totalDebts;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!debtForm.name || !debtForm.amount) {
      toast({
        title: "Error",
        description: "Por favor completa los campos requeridos",
        variant: "destructive"
      });
      return;
    }
    addDebt(debtForm);
    toast({
      title: "¡Éxito!",
      description: "Deuda agregada correctamente"
    });
    setIsDialogOpen(false);
    setDebtForm({ name: '', amount: '', interestRate: '', monthlyPayment: '' });
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Patrimonio Neto
        </h2>
        <p className="text-muted-foreground mt-1">Visualiza tu situación financiera completa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 glass-effect border-2 border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activos Totales</p>
                <h3 className="text-3xl font-bold mt-2 text-green-500">
                  ${totalAssets.toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 glass-effect border-2 border-red-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pasivos Totales</p>
                <h3 className="text-3xl font-bold mt-2 text-red-500">
                  ${totalDebts.toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white rotate-180" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 glass-effect border-2 border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Patrimonio Neto</p>
                <h3 className={`text-3xl font-bold mt-2 ${netWorth >= 0 ? 'text-purple-500' : 'text-red-500'}`}>
                  ${netWorth.toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Cuentas y Activos</h3>
            <div className="space-y-3">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{account.type}</p>
                  </div>
                  <p className="text-xl font-bold text-green-500">
                    ${parseFloat(account.balance).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Deudas</h3>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Deuda</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input
                        value={debtForm.name}
                        onChange={(e) => setDebtForm({...debtForm, name: e.target.value})}
                        placeholder="Ej: Préstamo Personal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Monto Total</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={debtForm.amount}
                        onChange={(e) => setDebtForm({...debtForm, amount: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tasa de Interés (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={debtForm.interestRate}
                        onChange={(e) => setDebtForm({...debtForm, interestRate: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pago Mensual</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={debtForm.monthlyPayment}
                        onChange={(e) => setDebtForm({...debtForm, monthlyPayment: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                      Agregar Deuda
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-3">
              {debts.map((debt) => (
                <div key={debt.id} className="p-4 rounded-lg bg-accent/50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{debt.name}</p>
                      {debt.interestRate && (
                        <p className="text-sm text-muted-foreground">
                          Interés: {debt.interestRate}%
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        deleteDebt(debt.id);
                        toast({ title: "Deuda eliminada" });
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-red-500">
                      ${parseFloat(debt.amount).toLocaleString()}
                    </p>
                    {debt.monthlyPayment && (
                      <p className="text-sm text-muted-foreground">
                        ${parseFloat(debt.monthlyPayment).toLocaleString()}/mes
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {debts.length === 0 && (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  No hay deudas registradas
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default NetWorth;