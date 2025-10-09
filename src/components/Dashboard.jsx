import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, BarChart, Percent, CreditCard } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import CategoryChart from '@/components/CategoryChart';
import PersonalizedTips from '@/components/PersonalizedTips';
import PricingPlans from '@/components/PricingPlans';


const LEISURE_CATEGORIES = ['Entretenimiento', 'Ocio'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background/80 border border-border rounded-lg shadow-lg">
        <p className="font-bold">{label || payload[0].name}</p>
        <p className="text-sm text-muted-foreground">{`Total: $${payload[0].value.toLocaleString()}`}</p>
        {payload[0].payload.person && <p className="text-xs text-muted-foreground">Por: {payload[0].payload.person}</p>}
      </div>
    );
  }
  return null;
};

const InfoCard = ({ title, value, icon: Icon, iconBg, modalContent }) => (
  <Dialog>
    <DialogTrigger asChild>
      <motion.div
        whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(var(--primary-rgb), 0.1)" }}
        className="cursor-pointer"
      >
        <Card className="p-6 h-full flex flex-col justify-between transition-all duration-300 hover:border-primary/50 bg-card">
          <div className="flex items-start justify-between">
            <p className="text-sm font-semibold text-muted-foreground">{title}</p>
            <motion.div 
              className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <Icon className="w-5 h-5 text-white" />
            </motion.div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mt-2">{value}</h3>
        </Card>
      </motion.div>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      {modalContent}
    </DialogContent>
  </Dialog>
);

const Dashboard = ({ setCurrentView }) => {
  const { transactions, goals, budgets } = useFinance();

  const {
    totalIncome,
    totalExpenses,
    balance,
    leisureBudget,
    leisureSpent,
    goalProgress,
    recentTransactions,
    expenseByCategory,
    weeklyExpenseData,
    expenseByPerson
  } = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const balance = totalIncome - totalExpenses;

    const leisureBudgetObj = budgets.find(b => LEISURE_CATEGORIES.some(cat => b.category.toLowerCase().includes(cat.toLowerCase())));
    const leisureBudget = leisureBudgetObj ? parseFloat(leisureBudgetObj.amount) : 0;
    
    const leisureSpent = transactions
        .filter(t => t.type === 'expense' && LEISURE_CATEGORIES.includes(t.category))
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const totalGoalTarget = goals.reduce((sum, g) => sum + parseFloat(g.target || 0), 0);
    const totalGoalCurrent = goals.reduce((sum, g) => sum + parseFloat(g.current || 0), 0);
    const goalProgress = totalGoalTarget > 0 ? (totalGoalCurrent / totalGoalTarget) * 100 : 0;
    
    const recentTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);


    const categories = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + parseFloat(t.amount);
    });
    const expenseByCategory = Object.entries(categories).map(([name, value]) => ({name, value})).sort((a,b) => b.value - a.value);

    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const weeklyData = days.map(day => ({ name: day, gasto: 0 }));
    
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)));
    startOfWeek.setHours(0, 0, 0, 0);

    transactions.forEach(t => {
      const transactionDate = new Date(t.date);
      if (t.type === 'expense' && transactionDate >= startOfWeek) {
        let dayIndex = transactionDate.getDay() - 1;
        if(dayIndex === -1) dayIndex = 6;
        if (weeklyData[dayIndex]) {
            weeklyData[dayIndex].gasto += parseFloat(t.amount);
        }
      }
    });

    const expenseByPerson = {};
    transactions.filter(t => t.type === 'expense' && t.person).forEach(t => {
        expenseByPerson[t.person] = (expenseByPerson[t.person] || 0) + parseFloat(t.amount);
    });

    return { totalIncome, totalExpenses, balance, leisureBudget, leisureSpent, goalProgress, recentTransactions, expenseByCategory, weeklyExpenseData: weeklyData, expenseByPerson };
  }, [transactions, goals, budgets]);

  return (
    <div className="p-4 md:p-8 space-y-8">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Inicio
          </h2>
          <p className="text-muted-foreground mt-1">Visión general de tu salud financiera</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <InfoCard 
          title="Saldo Total"
          value={`$${balance.toLocaleString()}`}
          icon={Wallet}
          iconBg="bg-blue-500"
          modalContent={
            <div className="p-4 text-center">
              <p className="text-4xl font-bold">${balance.toLocaleString()}</p>
              <p className="text-muted-foreground mt-2">Este es tu patrimonio neto actual.</p>
            </div>
          }
        />
         <InfoCard 
          title="Ingresos Totales"
          value={`$${totalIncome.toLocaleString()}`}
          icon={TrendingUp}
          iconBg="bg-green-500"
          modalContent={
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactions.filter(t => t.type === 'income').map(t => (
                <div key={t.id} className="flex justify-between items-center p-2 rounded bg-accent">
                  <span>{t.description}</span>
                  <span className="font-bold text-green-500">+${parseFloat(t.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          }
        />
         <InfoCard 
          title="Gastos Totales"
          value={`$${totalExpenses.toLocaleString()}`}
          icon={TrendingDown}
          iconBg="bg-red-500"
          modalContent={
             <div className="max-h-80 overflow-y-auto">
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Gastos por Persona</h4>
                {Object.entries(expenseByPerson).map(([person, amount]) => (
                    <div key={person} className="flex justify-between text-sm mb-1">
                        <span>{person}</span>
                        <span className="font-semibold">${amount.toLocaleString()}</span>
                    </div>
                ))}
              </div>
              <hr className="my-4"/>
              <h4 className="font-semibold mb-2">Gastos por Categoría</h4>
              {expenseByCategory.map(cat => {
                const percentage = totalExpenses > 0 ? ((cat.value / totalExpenses) * 100).toFixed(1) : 0;
                return (
                  <div key={cat.name} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{cat.name}</span>
                      <span className="font-semibold">${cat.value.toLocaleString()} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                       <div className="bg-red-500 h-2 rounded-full" style={{width: `${percentage}%`}}></div>
                    </div>
                  </div>
                )
              })}
             </div>
          }
        />
        <InfoCard 
          title="Registros"
          value={transactions.length}
          icon={BarChart}
          iconBg="bg-yellow-500"
          modalContent={
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentTransactions.map(t => (
                <div key={t.id} className="flex justify-between items-center p-2 rounded bg-accent">
                  <div>
                    <p>{t.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`font-bold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toLocaleString()}
                  </span>
                </div>
              ))}
               <Button onClick={() => setCurrentView('records')} className="w-full mt-4">Ver Todos</Button>
            </div>
          }
        />
        <InfoCard 
            title="Presupuesto de Ocio"
            value={`$${(leisureBudget - leisureSpent).toLocaleString()}`}
            icon={CreditCard}
            iconBg="bg-pink-500"
            modalContent={
                <div className="space-y-4">
                    <div className="text-center">
                        <p className="text-muted-foreground">Disponible este mes</p>
                        <p className="text-4xl font-bold">${(leisureBudget - leisureSpent).toLocaleString()}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between"><span>Presupuesto total</span><span>${leisureBudget.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Gastado</span><span>-${leisureSpent.toLocaleString()}</span></div>
                    </div>
                     <div className="w-full bg-secondary rounded-full h-2.5 mt-2">
                        <div className="bg-pink-500 h-2.5 rounded-full" style={{width: `${leisureBudget > 0 ? ((leisureSpent / leisureBudget) * 100) : 0}%`}}></div>
                    </div>
                    <Button onClick={() => setCurrentView('budgets')} className="w-full mt-4">Gestionar Presupuestos</Button>
                </div>
            }
        />
         <InfoCard 
          title="Progreso de Metas"
          value={`${goalProgress.toFixed(1)}%`}
          icon={Percent}
          iconBg="bg-purple-500"
          modalContent={
            <div className="space-y-4">
              {goals.length > 0 ? goals.map(goal => {
                const progress = (goal.current / goal.target) * 100;
                return (
                  <div key={goal.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{goal.name}</span>
                      <span className="font-semibold">${parseFloat(goal.current).toLocaleString()} / ${parseFloat(goal.target).toLocaleString()}</span>
                    </div>
                     <div className="w-full bg-secondary rounded-full h-2">
                       <div className="bg-purple-500 h-2 rounded-full" style={{width: `${progress}%`}}></div>
                    </div>
                  </div>
                )
              }) : <p className="text-center text-muted-foreground">No tienes metas definidas.</p>}
               <Button onClick={() => setCurrentView('budgets')} className="w-full mt-4">Gestionar Metas</Button>
            </div>
          }
        />
      </div>

      <div className="space-y-6">
          <CategoryChart />
          
          <Card className="p-4 md:p-6 bg-card-subtle">
            <h3 className="text-xl font-bold mb-4">Tendencia de Gastos Semanales</h3>
            {weeklyExpenseData.some(d => d.gasto > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `$${value}`} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="gasto" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay gastos esta semana para mostrar la tendencia.
              </div>
            )}
          </Card>

          <PersonalizedTips />
          <PricingPlans />
      </div>
    </div>
  );
};

export default Dashboard;