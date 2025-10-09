import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const AIChatButton = ({ hidden }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: '¡Hola! Soy tu asistente financiero. ¿Cómo puedo ayudarte a alcanzar tus metas hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const aiResponseText = "Esta es una respuesta simulada. Para obtener respuestas reales, necesitarías conectar esto a una API de IA. Podrías preguntarme sobre cómo crear un presupuesto, estrategias de ahorro o analizar tus gastos.";

    const aiMessage = { sender: 'ai', text: aiResponseText };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const fabVariants = {
    visible: { scale: 1, opacity: 1 },
    hidden: { scale: 0, opacity: 0, y: 20 }
  };

  return (
    <>
      <motion.div
        className="relative"
        variants={fabVariants}
        animate={hidden ? "hidden" : "visible"}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-400 shadow-lg"
        >
          <Bot className="w-5 h-5" />
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 right-0 md:bottom-24 md:right-8 w-full h-full md:w-[400px] md:h-[calc(100vh-8rem)] max-h-[600px] z-[60]"
          >
            <Card className="w-full h-full flex flex-col shadow-2xl rounded-none md:rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <div className="flex items-center gap-3">
                  <Bot className="w-6 h-6 text-primary" />
                  <CardTitle>Asistente IA</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    {msg.sender === 'ai' && <Bot className="w-6 h-6 flex-shrink-0 text-primary" />}
                    <div className={`max-w-[80%] p-3 rounded-xl ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2">
                    <Bot className="w-6 h-6 flex-shrink-0 text-primary" />
                    <div className="max-w-[80%] p-3 rounded-xl bg-muted flex items-center">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              <CardFooter className="p-4 border-t">
                <div className="flex w-full items-center gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Escribe tu pregunta..."
                    disabled={isLoading}
                  />
                  <Button onClick={handleSend} disabled={isLoading}>
                    <Send className="w-5 h-5" />
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