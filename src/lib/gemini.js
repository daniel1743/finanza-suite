// ========================================
// GEMINI AI SERVICE
// ========================================
// En desarrollo usa la API key directamente
// En produccion usar Edge Function de Supabase

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Usar gemini-2.0-flash que es el modelo actual disponible
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// System prompt para el asistente financiero
const SYSTEM_PROMPT = `Eres "Fin", un asistente financiero inteligente y amigable de Financia Suite.

PERSONALIDAD:
- Eres profesional pero cercano
- Usas un lenguaje claro y simple
- Respondes en espanol
- Eres positivo y motivador sobre las finanzas
- Usas emojis ocasionalmente para ser mas amigable

CAPACIDADES:
- Analizar gastos y patrones de consumo
- Dar consejos de ahorro personalizados
- Ayudar a crear presupuestos
- Explicar conceptos financieros
- Motivar al usuario a alcanzar sus metas

FORMATO:
- Respuestas concisas (2-4 parrafos max)
- Usa listas cuando sea apropiado
- Da consejos accionables

RESTRICCIONES:
- NO des consejos de inversion especificos
- NO menciones productos financieros por nombre
- Siempre recomienda consultar un profesional para decisiones importantes`;

// Formatear contexto financiero del usuario
export const formatFinancialContext = (financeData) => {
  if (!financeData) return '';

  const { transactions = [], budgets = [], goals = [] } = financeData;

  // Calcular totales del mes actual
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

  // Gastos por categoria
  const expensesByCategory = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  // Formatear contexto
  let context = `
CONTEXTO FINANCIERO DEL USUARIO (este mes):
- Ingresos totales: $${totalIncome.toLocaleString('es-CL')}
- Gastos totales: $${totalExpenses.toLocaleString('es-CL')}
- Balance: $${(totalIncome - totalExpenses).toLocaleString('es-CL')}
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

  return context;
};

// Enviar mensaje a Gemini
export const sendMessageToGemini = async (userMessage, conversationHistory = [], financeData = null) => {
  if (!GEMINI_API_KEY) {
    throw new Error('API key de Gemini no configurada');
  }

  // Construir contexto
  const financialContext = formatFinancialContext(financeData);

  // Construir historial de conversacion para Gemini
  const contents = [];

  // Agregar system prompt + contexto como primer mensaje del usuario
  contents.push({
    role: 'user',
    parts: [{ text: `${SYSTEM_PROMPT}\n\n${financialContext}\n\nRecuerda este contexto para responder las preguntas del usuario.` }]
  });

  contents.push({
    role: 'model',
    parts: [{ text: 'Entendido. Soy Fin, tu asistente financiero. Tengo acceso a tu informacion financiera y estoy listo para ayudarte. ¿En que puedo asistirte?' }]
  });

  // Agregar historial de conversacion
  conversationHistory.forEach(msg => {
    contents.push({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  });

  // Agregar mensaje actual
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(errorData.error?.message || 'Error al comunicarse con Gemini');
    }

    const data = await response.json();

    // Extraer texto de la respuesta
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('Respuesta vacia de Gemini');
    }

    return responseText;

  } catch (error) {
    console.error('Error en sendMessageToGemini:', error);
    throw error;
  }
};

// Sugerencias rapidas basadas en el contexto
export const getQuickSuggestions = (financeData) => {
  const suggestions = [
    '¿Como puedo reducir mis gastos?',
    '¿Cuanto deberia ahorrar cada mes?',
    'Analiza mis gastos de este mes',
    '¿En que categoria gasto mas?'
  ];

  if (financeData?.budgets?.length > 0) {
    suggestions.push('¿Como voy con mis presupuestos?');
  }

  if (financeData?.goals?.length > 0) {
    suggestions.push('¿Cuanto me falta para mi meta?');
  }

  return suggestions.slice(0, 4);
};

export default {
  sendMessageToGemini,
  formatFinancialContext,
  getQuickSuggestions
};
