import React from 'react';
import { motion } from 'framer-motion';
import { Home, ArrowLeftRight, Target, TrendingUp, Settings, Wallet, UserCircle, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { id: 'dashboard', label: 'Inicio', icon: Home },
  { id: 'records', label: 'Registros', icon: ArrowLeftRight },
  { id: 'budgets', label: 'Presupuestos y Metas', icon: Target },
  { id: 'networth', label: 'Patrimonio Neto', icon: TrendingUp },
  { id: 'connect_banks', label: 'Conectar Bancos', icon: Landmark },
  { id: 'profile', label: 'Perfil', icon: UserCircle },
  { id: 'settings', label: 'Configuración', icon: Settings }
];

const SidebarContent = ({ currentView, setCurrentView }) => (
  <div className="w-64 bg-card border-r border-border flex flex-col h-full">
    <div className="p-6 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            FinanzApp
          </h1>
          <p className="text-xs text-muted-foreground">Tu libertad financiera</p>
        </div>
      </div>
    </div>
    <nav className="flex-1 p-4 space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <motion.button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              isActive 
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </motion.button>
        );
      })}
    </nav>
  </div>
);

const Sidebar = ({ currentView, setCurrentView }) => {
  return (
    <div className="hidden md:flex">
      <SidebarContent currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
};

export default Sidebar;