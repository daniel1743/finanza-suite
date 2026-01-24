// ========================================
// Fin MEMORY SERVICE - Financia Suite
// ========================================
// Maneja la memoria persistente y de corto plazo de Fin

import { supabase } from './supabase';

// ========================================
// LONG-TERM MEMORY
// ========================================

/**
 * Obtener memoria de largo plazo del usuario
 */
export const getLongTermMemory = async (userId) => {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('fim_user_memory')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting long-term memory:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error in getLongTermMemory:', err);
    return null;
  }
};

/**
 * Crear o actualizar memoria de largo plazo
 */
export const saveLongTermMemory = async (userId, memoryData) => {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('fim_user_memory')
      .upsert({
        user_id: userId,
        ...memoryData,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving long-term memory:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error in saveLongTermMemory:', err);
    return null;
  }
};

/**
 * Actualizar campos especificos de la memoria
 */
export const updateMemoryFields = async (userId, fields) => {
  if (!userId) return null;

  try {
    // Primero verificar si existe
    const existing = await getLongTermMemory(userId);

    if (!existing) {
      // Crear nueva memoria
      return await saveLongTermMemory(userId, fields);
    }

    // Actualizar existente
    const { data, error } = await supabase
      .from('fim_user_memory')
      .update({
        ...fields,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating memory fields:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error in updateMemoryFields:', err);
    return null;
  }
};

// ========================================
// SHORT-TERM MEMORY (Conversation History)
// ========================================

/**
 * Obtener historial de conversacion (ultimos N mensajes)
 */
export const getConversationHistory = async (userId, limit = 25) => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('fim_conversation_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getConversationHistory:', err);
    return [];
  }
};

/**
 * Agregar mensaje al historial
 */
export const addMessageToHistory = async (userId, role, content, intent = null) => {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('fim_conversation_history')
      .insert({
        user_id: userId,
        role,
        content,
        intent
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding message to history:', error);
      return null;
    }

    // Limpiar mensajes antiguos (mantener solo los ultimos 25)
    await cleanupOldMessages(userId);

    return data;
  } catch (err) {
    console.error('Error in addMessageToHistory:', err);
    return null;
  }
};

/**
 * Limpiar mensajes antiguos del historial
 */
export const cleanupOldMessages = async (userId, keepLast = 25) => {
  if (!userId) return;

  try {
    // Obtener IDs de mensajes a mantener
    const { data: recentMessages } = await supabase
      .from('fim_conversation_history')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(keepLast);

    if (!recentMessages || recentMessages.length < keepLast) return;

    const idsToKeep = recentMessages.map(m => m.id);

    // Eliminar mensajes que no estan en la lista
    await supabase
      .from('fim_conversation_history')
      .delete()
      .eq('user_id', userId)
      .not('id', 'in', `(${idsToKeep.join(',')})`);

  } catch (err) {
    console.error('Error in cleanupOldMessages:', err);
  }
};

/**
 * Limpiar todo el historial de un usuario
 */
export const clearConversationHistory = async (userId) => {
  if (!userId) return;

  try {
    await supabase
      .from('fim_conversation_history')
      .delete()
      .eq('user_id', userId);
  } catch (err) {
    console.error('Error in clearConversationHistory:', err);
  }
};

// ========================================
// MEMORY EXTRACTION (from user messages)
// ========================================

/**
 * Extraer informacion relevante del mensaje del usuario
 */
export const extractMemoryFromMessage = (message) => {
  const lowerMessage = message.toLowerCase();
  const extracted = {};

  // Detectar nombre
  const namePatterns = [
    /me llamo\s+(\w+)/i,
    /mi nombre es\s+(\w+)/i,
    /soy\s+(\w+)/i,
  ];
  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match) {
      extracted.user_name = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      break;
    }
  }

  // Detectar frecuencia de ingresos
  if (lowerMessage.includes('me pagan cada 15') || lowerMessage.includes('quincenal')) {
    extracted.income_frequency = 'quincenal';
  } else if (lowerMessage.includes('me pagan semanal') || lowerMessage.includes('cada semana')) {
    extracted.income_frequency = 'semanal';
  } else if (lowerMessage.includes('me pagan mensual') || lowerMessage.includes('cada mes')) {
    extracted.income_frequency = 'mensual';
  }

  // Detectar meta financiera
  if (lowerMessage.includes('quiero ahorrar') || lowerMessage.includes('ahorrar dinero')) {
    extracted.financial_goal = 'ahorrar';
  } else if (lowerMessage.includes('pagar deuda') || lowerMessage.includes('salir de deudas') || lowerMessage.includes('pagar mis deudas')) {
    extracted.financial_goal = 'pagar_deudas';
  } else if (lowerMessage.includes('quiero invertir') || lowerMessage.includes('invertir mi dinero')) {
    extracted.financial_goal = 'invertir';
  } else if (lowerMessage.includes('organizarme') || lowerMessage.includes('ordenar mis finanzas') || lowerMessage.includes('organizar mi dinero')) {
    extracted.financial_goal = 'ordenarme';
  }

  // Detectar tolerancia al riesgo
  if (lowerMessage.includes('no me gusta el riesgo') || lowerMessage.includes('seguro') || lowerMessage.includes('conservador')) {
    extracted.risk_tolerance = 'bajo';
  } else if (lowerMessage.includes('riesgo alto') || lowerMessage.includes('agresivo')) {
    extracted.risk_tolerance = 'alto';
  }

  // Detectar preferencia de tono
  if (lowerMessage.includes('sé directo') || lowerMessage.includes('sin rodeos') || lowerMessage.includes('al grano')) {
    extracted.tone_preference = 'directo';
  } else if (lowerMessage.includes('sé amigable') || lowerMessage.includes('casual')) {
    extracted.tone_preference = 'amigable';
  } else if (lowerMessage.includes('formal') || lowerMessage.includes('profesional')) {
    extracted.tone_preference = 'formal';
  }

  return Object.keys(extracted).length > 0 ? extracted : null;
};

// ========================================
// INTENT DETECTION
// ========================================

/**
 * Detectar intencion del mensaje
 */
export const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase();

  // Mapeo de palabras clave a intenciones
  const intentPatterns = {
    budget_help: ['presupuesto', 'budget', 'cuanto gastar', 'distribuir dinero', 'planificar gastos'],
    debt_plan: ['deuda', 'debo', 'pagar deuda', 'salir de deudas', 'tarjeta de crédito', 'préstamo'],
    savings_goal: ['ahorrar', 'ahorro', 'guardar dinero', 'meta de ahorro', 'fondo de emergencia'],
    investment_question: ['invertir', 'inversión', 'acciones', 'fondos', 'rendimiento', 'interés compuesto'],
    income_tracking: ['ingreso', 'salario', 'sueldo', 'me pagan', 'gano', 'cobro'],
    expense_tracking: ['gasté', 'gasto', 'compré', 'pagué', 'cuanto llevo', 'mis gastos'],
    financial_stress: ['estresado', 'preocupado', 'no me alcanza', 'deudas me agobian', 'no sé qué hacer', 'ayuda'],
    general_question: ['qué es', 'cómo funciona', 'explícame', 'qué significa', 'diferencia entre']
  };

  for (const [intent, keywords] of Object.entries(intentPatterns)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        return intent;
      }
    }
  }

  return 'general_question';
};

// ========================================
// EMOTION DETECTION (Rescue Mode Trigger)
// ========================================

/**
 * Detectar emociones negativas que activan modo rescate
 */
export const detectNegativeEmotion = (message) => {
  const lowerMessage = message.toLowerCase();

  // Palabras clave que activan modo rescate
  const rescueTriggers = [
    'me voy',
    'esto no sirve',
    'no confío',
    'no funciona',
    'qué basura',
    'no me ayuda',
    'cancelar',
    'molesto',
    'frustrado',
    'inútil',
    'pérdida de tiempo',
    'horrible',
    'pésimo',
    'no entiendes',
    'para qué sirves',
    'mejor me voy',
    'no sirve de nada',
    'desinstalar',
    'borrar app',
    'estafa'
  ];

  for (const trigger of rescueTriggers) {
    if (lowerMessage.includes(trigger)) {
      return {
        isNegative: true,
        trigger: trigger,
        rescueModeRequired: true
      };
    }
  }

  return {
    isNegative: false,
    trigger: null,
    rescueModeRequired: false
  };
};

// ========================================
// CHECK IF USER IS NEW
// ========================================

/**
 * Verificar si el usuario es nuevo (necesita onboarding)
 */
export const isNewUser = (memory, conversationHistory) => {
  // Usuario NO es nuevo si ya completo onboarding
  if (memory?.onboarding_completed) return false;

  // Usuario es nuevo si:
  // 1. No tiene memoria guardada
  // 2. O no tiene historial de conversacion

  if (!memory) return true;
  if (!conversationHistory || conversationHistory.length === 0) return true;

  return false;
};

/**
 * Marcar onboarding como completado
 */
export const markOnboardingComplete = async (userId) => {
  return await updateMemoryFields(userId, {
    onboarding_completed: true,
    onboarding_date: new Date().toISOString()
  });
};

// ========================================
// FORMAT MEMORY FOR PROMPT
// ========================================

/**
 * Formatear memoria para incluir en el prompt
 */
export const formatMemoryForPrompt = (memory) => {
  if (!memory) return '';

  let formatted = '\n--- MEMORIA DEL USUARIO ---\n';

  if (memory.user_name) {
    formatted += `Nombre: ${memory.user_name}\n`;
  }

  if (memory.financial_goal) {
    const goalMap = {
      'ahorrar': 'Quiere ahorrar dinero',
      'pagar_deudas': 'Quiere pagar sus deudas',
      'invertir': 'Quiere invertir',
      'ordenarme': 'Quiere organizar sus finanzas'
    };
    formatted += `Meta: ${goalMap[memory.financial_goal] || memory.financial_goal}\n`;
  }

  if (memory.income_frequency) {
    formatted += `Frecuencia de ingresos: ${memory.income_frequency}\n`;
  }

  if (memory.tone_preference) {
    formatted += `Prefiere tono: ${memory.tone_preference}\n`;
  }

  if (memory.debts && memory.debts.length > 0) {
    formatted += `Deudas: ${JSON.stringify(memory.debts)}\n`;
  }

  if (memory.fixed_expenses && memory.fixed_expenses.length > 0) {
    formatted += `Gastos fijos: ${JSON.stringify(memory.fixed_expenses)}\n`;
  }

  if (memory.habits && memory.habits.length > 0) {
    formatted += `Patrones detectados: ${memory.habits.map(h => h.pattern).join(', ')}\n`;
  }

  if (memory.conversation_summary) {
    formatted += `Resumen: ${memory.conversation_summary}\n`;
  }

  formatted += '--- FIN MEMORIA ---\n';

  return formatted;
};

export default {
  getLongTermMemory,
  saveLongTermMemory,
  updateMemoryFields,
  getConversationHistory,
  addMessageToHistory,
  clearConversationHistory,
  extractMemoryFromMessage,
  detectIntent,
  detectNegativeEmotion,
  isNewUser,
  markOnboardingComplete,
  formatMemoryForPrompt
};
