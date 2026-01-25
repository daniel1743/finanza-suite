import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UNDO_DURATION = 5000; // 5 segundos

const UndoToast = ({ activeUndo, onUndo, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const [isUndoing, setIsUndoing] = useState(false);

  useEffect(() => {
    if (!activeUndo) {
      setProgress(100);
      return;
    }

    const startTime = Date.now();
    const endTime = startTime + UNDO_DURATION;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const newProgress = (remaining / UNDO_DURATION) * 100;
      setProgress(newProgress);

      if (newProgress <= 0) {
        clearInterval(interval);
        onDismiss(activeUndo.id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [activeUndo, onDismiss]);

  const handleUndo = async () => {
    if (isUndoing) return;
    setIsUndoing(true);
    await onUndo(activeUndo.id);
    setIsUndoing(false);
  };

  return (
    <AnimatePresence>
      {activeUndo && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-gray-900 text-white rounded-xl shadow-2xl overflow-hidden min-w-[300px]">
            {/* Progress bar */}
            <div className="h-1 bg-gray-700">
              <motion.div
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium">{activeUndo.description}</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.ceil(progress / 20)}s para deshacer
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleUndo}
                  disabled={isUndoing}
                  className="bg-white text-gray-900 hover:bg-gray-100"
                >
                  <Undo2 className="w-4 h-4 mr-1" />
                  {isUndoing ? 'Deshaciendo...' : 'Deshacer'}
                </Button>
                <button
                  onClick={() => onDismiss(activeUndo.id)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UndoToast;
