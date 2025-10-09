import React from 'react';
import { motion } from 'framer-motion';
import { Home, ArrowLeftRight, Target, TrendingUp, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'dashboard', label: 'Inicio', icon: Home },
  { id: 'records', label: 'Registros', icon: ArrowLeftRight },
  { id: 'budgets', label: 'Metas', icon: Target },
  { id: 'networth', label: 'Patrimonio', icon: TrendingUp },
  { id: 'profile', label: 'Perfil', icon: UserCircle },
];

const BottomNav = ({ currentView, setCurrentView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex md:hidden items-center justify-around z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <motion.button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <motion.div whileHover={{ y: -2 }}>
              <Icon className="w-6 h-6" />
            </motion.div>
            <span className="text-xs font-medium">{item.label}</span>
            {isActive && (
              <motion.div
                layoutId="underline-mobile"
                className="absolute bottom-0 h-1 w-8 rounded-full bg-primary"
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
};

export default BottomNav;