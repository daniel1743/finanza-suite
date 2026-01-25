import { useState, useCallback, useEffect } from 'react';

const UNDO_TIMEOUT = 5000; // 5 segundos para deshacer
const MAX_UNDO_STACK = 10;

/**
 * Hook para manejar acciones con opción de deshacer
 */
export const useUndo = () => {
  const [undoStack, setUndoStack] = useState([]);
  const [activeUndo, setActiveUndo] = useState(null);

  // Limpiar undos expirados
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setUndoStack(prev => prev.filter(item => now - item.timestamp < UNDO_TIMEOUT));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Registrar una acción que se puede deshacer
   * @param {Object} action - Información de la acción
   * @param {string} action.type - Tipo de acción (add, delete, update)
   * @param {string} action.entity - Entidad afectada (transaction, budget, goal)
   * @param {any} action.data - Datos necesarios para deshacer
   * @param {string} action.description - Descripción para mostrar al usuario
   * @param {Function} action.undoFn - Función para deshacer la acción
   */
  const registerUndo = useCallback((action) => {
    const undoItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...action
    };

    setUndoStack(prev => {
      const newStack = [undoItem, ...prev].slice(0, MAX_UNDO_STACK);
      return newStack;
    });

    setActiveUndo(undoItem);

    // Limpiar activeUndo después del timeout
    setTimeout(() => {
      setActiveUndo(prev => prev?.id === undoItem.id ? null : prev);
    }, UNDO_TIMEOUT);

    return undoItem;
  }, []);

  /**
   * Deshacer la última acción o una acción específica
   */
  const undo = useCallback(async (undoId = null) => {
    const itemToUndo = undoId
      ? undoStack.find(item => item.id === undoId)
      : undoStack[0];

    if (!itemToUndo) return false;

    try {
      await itemToUndo.undoFn();
      setUndoStack(prev => prev.filter(item => item.id !== itemToUndo.id));
      if (activeUndo?.id === itemToUndo.id) {
        setActiveUndo(null);
      }
      return true;
    } catch (error) {
      console.error('Error undoing action:', error);
      return false;
    }
  }, [undoStack, activeUndo]);

  /**
   * Descartar una acción del stack (ya no se puede deshacer)
   */
  const dismissUndo = useCallback((undoId) => {
    setUndoStack(prev => prev.filter(item => item.id !== undoId));
    if (activeUndo?.id === undoId) {
      setActiveUndo(null);
    }
  }, [activeUndo]);

  /**
   * Limpiar todo el stack
   */
  const clearUndoStack = useCallback(() => {
    setUndoStack([]);
    setActiveUndo(null);
  }, []);

  return {
    undoStack,
    activeUndo,
    registerUndo,
    undo,
    dismissUndo,
    clearUndoStack,
    canUndo: undoStack.length > 0
  };
};

export default useUndo;
