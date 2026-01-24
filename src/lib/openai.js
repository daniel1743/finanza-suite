// ========================================
// FIN - OPENAI SERVICE - Financia Suite
// ========================================
// Copiloto financiero con APP FIRST POLICY
// NUNCA sugiere Excel, libreta u otras apps

import {
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
} from './finMemory';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// ========================================
// SYSTEM PROMPT - Fin (APP FIRST POLICY)
// ========================================
const SYSTEM_PROMPT = `Eres Fin, el copiloto financiero de Financia Suite.
Tu trabajo es GUIAR AL USUARIO DENTRO DE LA APP, paso a paso.

=== REGLA DE ORO: APP FIRST ===
SIEMPRE guia al usuario usando las pantallas y funciones de Financia Suite.
NUNCA sugieras Excel, libreta, Google Sheets, papel, ni ninguna herramienta externa.
Si el usuario pregunta "como registro un gasto" o similar, SIEMPRE responde con pasos DENTRO de la app.

=== PROHIBIDO ABSOLUTAMENTE ===
- "Puedes usar una libreta"
- "Te recomiendo Excel"
- "Anotalo en papel"
- "Usa Google Sheets"
- "Cualquier app de notas"
- Sugerir CUALQUIER herramienta externa a Financia Suite

=== MODULOS DE FINANCIA SUITE ===
La app tiene estos modulos que DEBES usar en tus guias:

1. **Dashboard**: Vista general, balance, graficos
2. **Registros/Transacciones**: Donde se agregan gastos e ingresos
   - Boton "+ Agregar" o "+" flotante
   - Campos: monto, categoria, fecha, descripcion
3. **Presupuestos**: Crear limites por categoria
   - Boton "Crear presupuesto"
   - Campos: categoria, monto limite, periodo
4. **Metas de Ahorro**: Objetivos financieros
   - Boton "Nueva meta"
   - Campos: nombre, monto objetivo, fecha limite
5. **Patrimonio Neto**: Activos y pasivos
6. **Configuracion**: Perfil, preferencias

=== FORMATO DE RESPUESTA OBLIGATORIO ===
1) Confirmacion breve de lo que entendiste
2) Pasos DENTRO de Financia Suite (3 a 5 pasos maximo)
3) Pregunta corta para avanzar

EJEMPLO CORRECTO - Registrar gasto:
"Perfecto, vamos a registrar ese gasto en Financia Suite:
1) Toca el boton **+** en la esquina inferior
2) Selecciona **Gasto**
3) Ingresa el **monto** (ej: $50.000)
4) Elige la **categoria** (Alimentacion, Transporte, etc.)
5) Presiona **Guardar**
Listo. ¿Cual es el monto y categoria del gasto?"

EJEMPLO CORRECTO - Crear presupuesto:
"Entendido. Para crear tu presupuesto en Financia Suite:
1) Ve a **Presupuestos** en el menu
2) Toca **Crear presupuesto**
3) Selecciona la **categoria** (ej: Alimentacion)
4) Define el **monto limite** mensual
5) Presiona **Guardar**
¿Para que categoria quieres crear el presupuesto?"

=== PERSONALIDAD ===
- Claro y directo
- Empatico pero practico
- Profesional
- Orientado a acciones concretas
- Usa espanol natural (Chile/Latam)
- Emojis con moderacion

=== REGLAS ADICIONALES ===
- NO inventes datos financieros del usuario
- Si no tienes datos, pregunta
- Usa el nombre del usuario ocasionalmente, no en cada mensaje
- NO saludes con "Hola, ¿en que te puedo ayudar?" repetidamente
- Responde directo al punto

=== SI EL USUARIO PIDE AYUDA EXTERNA ===
Solo si el usuario EXPLICITAMENTE pide usar Excel/libreta, puedes decir:
"Entiendo, aunque te recomiendo usar Financia Suite porque guarda todo automaticamente y te da graficos. Pero si prefieres Excel, adelante."

=== RESTRICCIONES ===
- NO des consejos de inversion especificos (acciones, cripto)
- NO menciones productos financieros por marca
- Recomienda consultar profesional para decisiones importantes
- NO des instrucciones para fraude`;

// ========================================
// RESCUE MODE PROMPT (Anti-abandono)
// ========================================
const RESCUE_MODE_PROMPT = `
=== MODO RESCATE ACTIVADO ===
El usuario esta frustrado o molesto. Debes:
1) Disculparte BREVEMENTE (1 linea)
2) Ofrecer guia INMEDIATA dentro de Financia Suite
3) Dar pasos concretos para resolver su necesidad

PLANTILLA DE RESPUESTA:
"Tienes razon, me disculpo. Dejame guiarte directamente en Financia Suite:
1) [Paso 1 dentro de la app]
2) [Paso 2 dentro de la app]
3) [Paso 3 dentro de la app]
¿Que necesitas registrar? Te ayudo paso a paso."

NO TE JUSTIFIQUES. NO DES EXCUSAS LARGAS. ACTUA.
`;

// ========================================
// ONBOARDING MESSAGE (Solo usuarios nuevos)
// ========================================
const ONBOARDING_MESSAGE = `¡Bienvenido a Financia Suite! Soy Fin, tu copiloto financiero.

Estoy aqui para ayudarte a:
- Registrar tus gastos e ingresos
- Crear presupuestos
- Alcanzar tus metas de ahorro

¿Quieres que empecemos registrando tu primer gasto o ingreso? Solo dime el monto y la categoria.`;

// ========================================
// FORMAT FINANCIAL CONTEXT
// ========================================
export const formatFinancialContext = (financeData) => {
  if (!financeData) return '';

  const { transactions = [], budgets = [], goals = [] } = financeData;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expensesByCategory = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  let context = `
--- DATOS REALES DE FINANCIA SUITE (este mes) ---
Ingresos: $${totalIncome.toLocaleString('es-CL')}
Gastos: $${totalExpenses.toLocaleString('es-CL')}
Balance: $${(totalIncome - totalExpenses).toLocaleString('es-CL')}
`;

  if (Object.keys(expensesByCategory).length > 0) {
    context += '\nGastos por categoria:\n';
    Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, amount]) => {
        context += `- ${cat}: $${amount.toLocaleString('es-CL')}\n`;
      });
  }

  if (budgets.length > 0) {
    context += '\nPresupuestos activos:\n';
    budgets.forEach(b => {
      const spent = expensesByCategory[b.category] || 0;
      const percentage = Math.round((spent / b.amount) * 100);
      context += `- ${b.category}: $${spent.toLocaleString('es-CL')} / $${b.amount.toLocaleString('es-CL')} (${percentage}%)\n`;
    });
  }

  if (goals.length > 0) {
    context += '\nMetas de ahorro:\n';
    goals.forEach(g => {
      const percentage = Math.round((g.current_amount / g.target_amount) * 100);
      context += `- ${g.name}: $${g.current_amount?.toLocaleString('es-CL') || 0} / $${g.target_amount.toLocaleString('es-CL')} (${percentage}%)\n`;
    });
  }

  context += '--- FIN DATOS ---\n';

  return context;
};

// ========================================
// SEND MESSAGE TO OPENAI (with memory + rescue mode)
// ========================================
export const sendMessageToOpenAI = async (userMessage, userId = null, financeData = null) => {
  if (!OPENAI_API_KEY) {
    throw new Error('API key de OpenAI no configurada. Revisa el archivo .env.local');
  }

  // Cargar memoria del usuario
  let userMemory = null;
  let conversationHistory = [];

  if (userId) {
    try {
      userMemory = await getLongTermMemory(userId);
      conversationHistory = await getConversationHistory(userId, 25);
    } catch (err) {
      console.warn('Could not load memory:', err);
    }
  }

  // Detectar intencion
  const intent = detectIntent(userMessage);

  // Detectar emociones negativas (modo rescate)
  const emotionResult = detectNegativeEmotion(userMessage);

  // Extraer informacion del mensaje
  const extractedData = extractMemoryFromMessage(userMessage);

  // Construir contexto
  const financialContext = formatFinancialContext(financeData);
  const memoryContext = formatMemoryForPrompt(userMemory);

  // Construir system prompt
  let systemPrompt = SYSTEM_PROMPT;

  // Si modo rescate activado, agregar instrucciones especiales
  if (emotionResult.rescueModeRequired) {
    systemPrompt += '\n\n' + RESCUE_MODE_PROMPT;
  }

  // Agregar contexto de memoria y datos financieros
  systemPrompt += '\n\n' + memoryContext + '\n' + financialContext;

  // Construir mensajes para OpenAI
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    }
  ];

  // Agregar historial de conversacion
  conversationHistory.forEach(msg => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    });
  });

  // Agregar mensaje actual
  messages.push({
    role: 'user',
    content: userMessage
  });

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.95,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(errorData.error?.message || 'Error al comunicarse con OpenAI');
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error('Respuesta vacia de OpenAI');
    }

    // Guardar en historial
    if (userId) {
      try {
        await addMessageToHistory(userId, 'user', userMessage, intent);
        await addMessageToHistory(userId, 'assistant', responseText);

        // Actualizar memoria si se extrajo informacion
        if (extractedData) {
          await updateMemoryFields(userId, {
            ...extractedData,
            recent_intent: intent
          });
        } else {
          // Solo actualizar intencion
          await updateMemoryFields(userId, { recent_intent: intent });
        }
      } catch (err) {
        console.warn('Could not save to memory:', err);
      }
    }

    return responseText;

  } catch (error) {
    console.error('Error en sendMessageToOpenAI:', error);
    throw error;
  }
};

// ========================================
// CHECK IF SHOULD SHOW ONBOARDING
// ========================================
export const checkOnboarding = async (userId) => {
  if (!userId) return { showOnboarding: false, message: null };

  try {
    const userMemory = await getLongTermMemory(userId);
    const conversationHistory = await getConversationHistory(userId, 25);

    const needsOnboarding = isNewUser(userMemory, conversationHistory);

    if (needsOnboarding) {
      // Marcar que se mostro onboarding
      await markOnboardingComplete(userId);
      return {
        showOnboarding: true,
        message: ONBOARDING_MESSAGE
      };
    }

    return { showOnboarding: false, message: null };
  } catch (err) {
    console.warn('Error checking onboarding:', err);
    return { showOnboarding: false, message: null };
  }
};

// ========================================
// QUICK SUGGESTIONS (basadas en datos reales)
// ========================================
export const getQuickSuggestions = (financeData) => {
  const suggestions = [
    'Registrar un gasto',
    'Ver mi resumen del mes',
    'Crear un presupuesto',
    '¿Como puedo ahorrar mas?'
  ];

  if (financeData?.budgets?.length > 0) {
    suggestions.push('¿Como voy con mis presupuestos?');
  }

  if (financeData?.goals?.length > 0) {
    suggestions.push('¿Cuanto me falta para mi meta?');
  }

  return suggestions.slice(0, 4);
};

// ========================================
// CLEAR CHAT
// ========================================
export const clearChat = async (userId) => {
  if (userId) {
    await clearConversationHistory(userId);
  }
};

export default {
  sendMessageToOpenAI,
  formatFinancialContext,
  getQuickSuggestions,
  clearChat,
  checkOnboarding
};
