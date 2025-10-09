import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const plans = [
  {
    name: "Gratis",
    price: "$0",
    features: [
      "Seguimiento de 1 cuenta",
      "Categorización básica",
      "Creación de 1 presupuesto",
      "Soporte por comunidad",
    ],
    cta: "Comenzar ahora",
    color: "from-gray-500 to-gray-600",
  },
  {
    name: "Básico",
    price: "$5",
    features: [
      "Seguimiento de 5 cuentas",
      "Categorización avanzada",
      "Presupuestos ilimitados",
      "Metas de ahorro",
      "Soporte por email",
    ],
    cta: "Seleccionar plan",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Pro",
    price: "$7",
    features: [
      "Todo en Básico",
      "Sincronización bancaria",
      "Análisis de gastos con IA",
      "Informes personalizados",
      "Soporte prioritario",
    ],
    cta: "Seleccionar plan",
    color: "from-purple-500 to-pink-500",
    popular: true,
  },
  {
    name: "Familia",
    price: "$10",
    features: [
      "Todo en Pro",
      "Hasta 5 miembros",
      "Presupuestos compartidos",
      "Metas familiares",
      "Gestión de gastos por usuario",
    ],
    cta: "Seleccionar plan",
    color: "from-green-500 to-teal-500",
  },
];

const PricingPlans = () => {
  const handleSelectPlan = (planName) => {
    toast({
      title: `Plan ${planName} seleccionado`,
      description: "🚧 ¡La función de pago aún no está implementada, pero gracias por tu interés! 🚀",
    });
  };

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Planes a tu medida
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Elige el plan que se adapte a tus necesidades y toma el control de tus finanzas.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="relative"
            >
              <Card className="h-full flex flex-col overflow-hidden">
                {plan.popular && (
                  <div className={`absolute top-0 right-0 m-2 bg-gradient-to-r ${plan.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                    Popular
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-4xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent">{plan.price}<span className="text-lg text-muted-foreground">/mes</span></p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSelectPlan(plan.name)}
                    className={`w-full bg-gradient-to-r ${plan.color} text-white hover:opacity-90 transition-opacity`}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;