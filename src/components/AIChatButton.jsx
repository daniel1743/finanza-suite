import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Loader2, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { sendMessageToOpenAI, getQuickSuggestions, clearChat, checkOnboarding } from '@/lib/openai';

const AIChatButton = ({ hidden }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Obtener usuario autenticado
  const { user } = useAuth();
  const userId = user?.id;

  // Obtener datos financieros del contexto
  const { transactions, budgets, goals } = useFinance();

  const financeData = {
    transactions,
    budgets,
    goals
  };

  const quickSuggestions = getQuickSuggestions(financeData);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Verificar onboarding cuando se abre el chat (SOLO primera vez)
  useEffect(() => {
    const checkUserOnboarding = async () => {
      if (isOpen && userId && !onboardingChecked) {
        try {
          const result = await checkOnboarding(userId);
          if (result.showOnboarding && result.message) {
            // Mostrar mensaje de bienvenida solo para usuarios nuevos
            setMessages([{ sender: 'ai', text: result.message }]);
          }
          setOnboardingChecked(true);
        } catch (err) {
          console.warn('Error checking onboarding:', err);
          setOnboardingChecked(true);
        }
      }
    };

    checkUserOnboarding();
  }, [isOpen, userId, onboardingChecked]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (messageText = null) => {
    const text = messageText || input.trim();
    if (text === '') return;

    setShowSuggestions(false);
    setError(null);

    const userMessage = { sender: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Llamar a OpenAI API con userId para memoria
      const response = await sendMessageToOpenAI(text, userId, financeData);

      const aiMessage = { sender: 'ai', text: response };
      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error('Error en chat:', err);
      setError(err.message || 'Error al procesar tu mensaje. Intenta de nuevo.');

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: 'Lo siento, hubo un problema al procesar tu mensaje. Por favor intenta de nuevo.',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  const handleClearChat = async () => {
    // Limpiar historial en Supabase
    if (userId) {
      await clearChat(userId);
    }
    // Limpiar mensajes locales (sin mensaje de bienvenida)
    setMessages([]);
    setShowSuggestions(true);
    setError(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const fabVariants = {
    visible: { scale: 1, opacity: 1 },
    hidden: { scale: 0, opacity: 0, y: 20 }
  };

  return (
    <>
      {/* Botón flotante */}
      <motion.div
        className="relative"
        variants={fabVariants}
        animate={hidden ? "hidden" : "visible"}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-400 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <Bot className="w-6 h-6" />
        </Button>
        {/* Indicador de IA */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500 items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-white" />
          </span>
        </span>
      </motion.div>

      {/* Modal de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 right-0 md:bottom-24 md:right-8 w-full h-full md:w-[400px] md:h-[calc(100vh-8rem)] max-h-[600px] z-[60]"
          >
            <Card className="w-full h-full flex flex-col shadow-2xl rounded-none md:rounded-xl border-0 md:border">
              {/* Header */}
              <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-t-none md:rounded-t-xl py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Fin - Asistente IA</CardTitle>
                    <p className="text-xs text-white/80">Powered by OpenAI</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={handleClearChat}
                    title="Reiniciar chat"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>

              {/* Mensajes */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                {/* Estado vacío cuando no hay mensajes */}
                {messages.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-400 rounded-full flex items-center justify-center mb-4">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Soy Fin, tu copiloto financiero</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Escríbeme tu pregunta o elige una sugerencia
                    </p>
                  </div>
                )}

                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.isError ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gradient-to-br from-blue-500 to-teal-400'
                      }`}>
                        {msg.isError ? (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-br-md'
                          : msg.isError
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-bl-md'
                            : 'bg-white dark:bg-gray-800 shadow-sm rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 shadow-sm p-3 rounded-2xl rounded-bl-md">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Sugerencias rápidas - siempre visibles cuando no hay mensajes */}
                {showSuggestions && messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Sugerencias:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {quickSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input */}
              <CardFooter className="p-3 border-t bg-white dark:bg-gray-800">
                <div className="flex w-full items-center gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe tu pregunta..."
                    disabled={isLoading}
                    className="rounded-full bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-1 focus-visible:ring-blue-400"
                  />
                  <Button
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="rounded-full bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatButton;
