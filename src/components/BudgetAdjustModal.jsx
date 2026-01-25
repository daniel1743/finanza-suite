import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shuffle, CheckCircle, AlertCircle, Sparkles, X } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { generateAdjustmentSuggestions } from '@/lib/budgetAlerts';

const BudgetAdjustModal = ({ isOpen, onClose, exceededAlert }) => {
  const { budgets, transactions, updateBudget } = useFinance();
  const [selectedSource, setSelectedSource] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [success, setSuccess] = useState(false);

  // Generar sugerencias de ajuste
  const suggestions = useMemo(() => {
    if (!exceededAlert?.category) return [];
    return generateAdjustmentSuggestions(budgets, transactions, exceededAlert.category);
  }, [budgets, transactions, exceededAlert]);

  // Calcular cuánto se excedió
  const exceededAmount = exceededAlert?.exceeded || 0;

  // Manejar transferencia
  const handleTransfer = async () => {
    if (!selectedSource || !transferAmount || parseFloat(transferAmount) <= 0) return;

    setIsTransferring(true);

    try {
      // Encontrar presupuestos
      const sourceBudget = budgets.find(b =>
        b.category.toLowerCase() === selectedSource.category.toLowerCase()
      );
      const targetBudget = budgets.find(b =>
        b.category.toLowerCase() === exceededAlert.category.toLowerCase()
      );

      if (!sourceBudget || !targetBudget) {
        throw new Error('Presupuesto no encontrado');
      }

      const amount = parseFloat(transferAmount);

      // Reducir presupuesto origen
      await updateBudget(sourceBudget.id, {
        ...sourceBudget,
        amount: parseFloat(sourceBudget.amount) - amount
      });

      // Aumentar presupuesto destino
      await updateBudget(targetBudget.id, {
        ...targetBudget,
        amount: parseFloat(targetBudget.amount) + amount
      });

      setSuccess(true);

      // Cerrar después de mostrar éxito
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSelectedSource(null);
        setTransferAmount('');
      }, 2000);

    } catch (error) {
      console.error('Error transferring budget:', error);
    } finally {
      setIsTransferring(false);
    }
  };

  // Seleccionar sugerencia rápida
  const handleQuickSelect = (suggestion) => {
    setSelectedSource(suggestion);
    // Sugerir transferir lo mínimo necesario o lo que tenga disponible
    const suggestedAmount = Math.min(exceededAmount, suggestion.canTransfer);
    setTransferAmount(suggestedAmount.toString());
  };

  if (!exceededAlert) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-primary" />
            Ajustar Presupuesto
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-8 text-center"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-600">¡Listo!</h3>
            <p className="text-muted-foreground mt-2">
              Presupuesto ajustado correctamente
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Resumen del problema */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400">
                    {exceededAlert.category} excedido
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Te pasaste por <span className="font-bold">${exceededAmount.toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Sugerencias automáticas */}
            {suggestions.length > 0 ? (
              <div>
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  Categorías con presupuesto disponible:
                </p>
                <div className="space-y-2">
                  {suggestions.slice(0, 4).map(suggestion => (
                    <motion.button
                      key={suggestion.category}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickSelect(suggestion)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        selectedSource?.category === suggestion.category
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{suggestion.category}</span>
                        <span className="text-green-600 font-semibold">
                          ${suggestion.available.toLocaleString()} disponible
                        </span>
                      </div>
                      <div className="mt-1">
                        <div className="w-full bg-secondary rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${suggestion.percentageUsed}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {suggestion.percentageUsed}% usado
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No hay categorías con presupuesto disponible para transferir.</p>
                <p className="text-sm mt-2">
                  Considera aumentar tus presupuestos totales.
                </p>
              </div>
            )}

            {/* Monto a transferir */}
            {selectedSource && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-center gap-3 text-sm">
                  <span className="px-3 py-1 bg-accent rounded-lg font-medium">
                    {selectedSource.category}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="px-3 py-1 bg-primary/20 rounded-lg font-medium text-primary">
                    {exceededAlert.category}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium">Monto a transferir:</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <input
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      max={selectedSource.available}
                      className="w-full pl-8 pr-4 py-2 border rounded-lg bg-background"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Necesitas: ${exceededAmount.toLocaleString()}</span>
                    <span>Máximo: ${selectedSource.available.toLocaleString()}</span>
                  </div>
                </div>

                {/* Botones rápidos de monto */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTransferAmount(Math.min(exceededAmount, selectedSource.available).toString())}
                    className="flex-1 text-xs"
                  >
                    Cubrir exceso
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTransferAmount(Math.round(selectedSource.available * 0.25).toString())}
                    className="flex-1 text-xs"
                  >
                    25%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTransferAmount(Math.round(selectedSource.available * 0.5).toString())}
                    className="flex-1 text-xs"
                  >
                    50%
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Botón de acción */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleTransfer}
                disabled={!selectedSource || !transferAmount || parseFloat(transferAmount) <= 0 || isTransferring}
                className="flex-1"
              >
                {isTransferring ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Shuffle className="w-4 h-4" />
                    </motion.div>
                    Transfiriendo...
                  </span>
                ) : (
                  <>
                    <Shuffle className="w-4 h-4 mr-2" />
                    Transferir
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BudgetAdjustModal;
