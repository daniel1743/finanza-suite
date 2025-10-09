import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFinance } from '@/contexts/FinanceContext';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { User } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background/80 border border-border rounded-lg shadow-lg">
        <p className="font-bold">{payload[0].name}</p>
        <p className="text-sm text-muted-foreground">{`Total: $${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const CategoryChart = () => {
    const { transactions, necessityLevels } = useFinance();
    const [modalData, setModalData] = useState({ open: false, title: '', transactions: [] });

    const expenseByNecessity = useMemo(() => {
        const UNNECESSARY_LEVELS = ['Poco indispensable', 'Nada indispensable', 'Gasto/Arrepentimiento'];
        const NECESSARY_LEVELS = ['Muy indispensable', 'Indispensable', 'Necesario'];

        const groups = {
            'Gastos Necesarios': { value: 0, levels: NECESSARY_LEVELS, transactions: [] },
            'Gastos Innecesarios': { value: 0, levels: UNNECESSARY_LEVELS, transactions: [] },
            'Sin Clasificar': { value: 0, levels: [], transactions: [] }
        };

        transactions.filter(t => t.type === 'expense').forEach(t => {
            if (UNNECESSARY_LEVELS.includes(t.necessity)) {
                groups['Gastos Innecesarios'].value += parseFloat(t.amount);
                groups['Gastos Innecesarios'].transactions.push(t);
            } else if (NECESSARY_LEVELS.includes(t.necessity)) {
                groups['Gastos Necesarios'].value += parseFloat(t.amount);
                groups['Gastos Necesarios'].transactions.push(t);
            } else {
                groups['Sin Clasificar'].value += parseFloat(t.amount);
                groups['Sin Clasificar'].transactions.push(t);
            }
        });

        return Object.entries(groups)
            .map(([name, data]) => ({ name, value: data.value, transactions: data.transactions }))
            .filter(d => d.value > 0);
    }, [transactions, necessityLevels]);

    const totalExpenses = useMemo(() => expenseByNecessity.reduce((sum, item) => sum + item.value, 0), [expenseByNecessity]);

    const handleLegendClick = (payload) => {
        const group = expenseByNecessity.find(g => g.name === payload.value);
        if (group) {
            setModalData({
                open: true,
                title: group.name,
                transactions: group.transactions
            });
        }
    };

    return (
        <>
            <Card className="p-4 md:p-6 bg-card-subtle">
                <h3 className="text-xl font-bold mb-4">Análisis de Gastos</h3>
                {expenseByNecessity.length > 0 ? (
                    <div className="w-full h-[350px] relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Pie
                                    data={expenseByNecessity}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="60%"
                                    outerRadius="80%"
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    labelLine={false}
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                        return (
                                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                                {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}
                                >
                                    {expenseByNecessity.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <motion.div
                            className="absolute text-center"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <p className="text-sm text-muted-foreground">Total Gastado</p>
                            <p className="text-3xl font-bold">${totalExpenses.toLocaleString()}</p>
                        </motion.div>
                    </div>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No hay datos de gastos para mostrar el gráfico.
                    </div>
                )}
            </Card>

            <Dialog open={modalData.open} onOpenChange={(open) => setModalData({ ...modalData, open })}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Detalle de: {modalData.title}</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
                        {modalData.transactions.length > 0 ? modalData.transactions.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                                <div>
                                    <p className="font-medium">{t.description}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User className="w-3 h-3" />
                                        <span>{t.person}</span>
                                        <span>•</span>
                                        <span>{new Date(t.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <p className="font-bold text-red-500">-${parseFloat(t.amount).toLocaleString()}</p>
                            </div>
                        )) : <p className="text-muted-foreground text-center py-8">No hay transacciones que mostrar.</p>}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CategoryChart;