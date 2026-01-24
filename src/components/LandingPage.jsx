import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, PieChart, Target, Shield, Smartphone,
  ChevronRight, Check, Star, ArrowRight, Menu, X,
  BarChart3, CreditCard, Bell, Users, Zap, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Schema.org JSON-LD para SEO
const schemaData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Financia Suite",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web, Android, iOS",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1250"
  },
  "description": "App gratis para control de gastos y finanzas personales. Registra ingresos, crea presupuestos, establece metas de ahorro y recibe consejos con inteligencia artificial.",
  "screenshot": "https://financiasuite.com/screenshot.jpg",
  "featureList": "Control de gastos, Presupuestos, Metas de ahorro, Chat con IA, Dashboard financiero, Reportes",
  "softwareVersion": "1.0",
  "author": {
    "@type": "Organization",
    "name": "Financia Suite"
  }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Financia Suite",
  "url": "https://financiasuite.com",
  "description": "App de control de gastos y finanzas personales gratis con inteligencia artificial",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://financiasuite.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Es realmente gratis la app de control de gastos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Si, Financia Suite es 100% gratis. Todas las funciones estan disponibles sin costo: dashboard, registro de gastos, metas de ahorro, chat con IA y mas."
      }
    },
    {
      "@type": "Question",
      "name": "Como puedo controlar mis gastos con esta app?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Registra tus gastos e ingresos facilmente, crea presupuestos por categoria, establece metas de ahorro y recibe consejos personalizados de nuestra IA financiera."
      }
    },
    {
      "@type": "Question",
      "name": "Mis datos financieros estan seguros?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutamente. Usamos encriptacion de nivel bancario y nunca compartimos tus datos con terceros. Tu informacion financiera es privada."
      }
    },
    {
      "@type": "Question",
      "name": "Como funciona el asistente IA para finanzas?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nuestro asistente Fin analiza tus patrones de gasto y te da consejos personalizados para ahorrar mas y administrar mejor tu dinero."
      }
    }
  ]
};

// Animaciones
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

// Componente de Navegacion
const Navbar = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Financia Suite
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Caracteristicas
            </a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={onGetStarted}>
              Iniciar Sesion
            </Button>
            <Button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              Empezar Gratis
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-muted-foreground hover:text-foreground">
                Caracteristicas
              </a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground">
                FAQ
              </a>
              <Button onClick={onGetStarted} className="w-full">
                Empezar Gratis
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

// Hero Section - Optimizado para SEO
const HeroSection = ({ onGetStarted }) => (
  <section className="pt-32 pb-20 px-4 overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center lg:text-left"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            App de finanzas personales con IA - 100% Gratis
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            App para{' '}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              controlar gastos
            </span>
            {' '}y administrar tu dinero
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
            La mejor app gratis para control de gastos personales. Registra ingresos y egresos, crea presupuestos, ahorra mas con consejos de inteligencia artificial.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-lg px-8"
            >
              Comenzar Gratis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Ver Demo
            </Button>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex items-center gap-6 mt-8 justify-center lg:justify-start">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 border-2 border-background" />
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">+1,000 usuarios activos</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Image/Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
            <div className="p-6">
              {/* Mock Dashboard */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">Dashboard</h3>
                <span className="text-sm text-muted-foreground">Enero 2026</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <p className="text-sm text-muted-foreground">Ingresos</p>
                  <p className="text-2xl font-bold text-green-600">$2,450,000</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/20">
                  <p className="text-sm text-muted-foreground">Gastos</p>
                  <p className="text-2xl font-bold text-red-600">$1,230,000</p>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="h-32 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 flex items-end justify-around p-4">
                {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="w-6 bg-gradient-to-t from-violet-600 to-purple-500 rounded-t-md"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-violet-500/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </div>
  </section>
);

// Features Section - Optimizado para SEO
const features = [
  {
    icon: BarChart3,
    title: 'Dashboard de Control Financiero',
    description: 'Ve todos tus gastos e ingresos en un solo lugar. Graficos claros para entender tu situacion financiera.'
  },
  {
    icon: CreditCard,
    title: 'Registro Facil de Gastos',
    description: 'Anota tus gastos en segundos. Categorias automaticas para saber en que gastas tu dinero.'
  },
  {
    icon: Target,
    title: 'Metas de Ahorro',
    description: 'Crea objetivos de ahorro y ve tu progreso. Ideal para ahorrar para vacaciones, emergencias o compras.'
  },
  {
    icon: PieChart,
    title: 'Presupuesto Personal',
    description: 'Crea presupuestos por categoria. Recibe alertas cuando estes cerca del limite para no gastar de mas.'
  },
  {
    icon: Users,
    title: 'Finanzas Familiares',
    description: 'Administra gastos compartidos con tu familia o roommates. Control de gastos en grupo.'
  },
  {
    icon: Zap,
    title: 'Asistente IA Financiero',
    description: 'Recibe consejos personalizados para ahorrar mas. Tu copiloto financiero con inteligencia artificial.'
  }
];

const FeaturesSection = () => (
  <section id="features" className="py-20 px-4 bg-muted/50">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="text-center mb-16"
      >
        <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
          Funciones para{' '}
          <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            administrar tu dinero
          </span>
          {' '}facilmente
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Todo lo que necesitas para controlar gastos, crear presupuestos y ahorrar mas. App de finanzas personales completa y gratis.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            whileHover={{ y: -5 }}
            className="p-6 rounded-2xl bg-card border border-border hover:border-violet-500/50 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4">
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

/*
// =============================================
// PRICING SECTION - Comentado para futuro uso
// La app es 100% gratis por ahora
// =============================================

const plans = [
  {
    name: 'Gratis',
    price: '$0',
    description: 'Perfecto para empezar',
    features: [
      'Dashboard completo',
      'Registro ilimitado de gastos',
      'Hasta 3 metas de ahorro',
      'Categorias predefinidas',
      'Modo oscuro/claro',
      'Exportar a CSV'
    ],
    cta: 'Empezar Gratis',
    popular: false
  },
  {
    name: 'Pro',
    price: '$4.990',
    period: '/mes',
    description: 'Para usuarios avanzados',
    features: [
      'Todo lo del plan Gratis',
      'Metas ilimitadas',
      'Categorias personalizadas',
      'Chat IA ilimitado',
      'Reportes avanzados',
      'Sincronizacion en la nube',
      'Soporte prioritario'
    ],
    cta: 'Probar 7 dias gratis',
    popular: true
  },
  {
    name: 'Familia',
    price: '$9.990',
    period: '/mes',
    description: 'Hasta 5 miembros',
    features: [
      'Todo lo del plan Pro',
      '5 cuentas de usuario',
      'Gastos compartidos',
      'Presupuesto familiar',
      'Dashboard grupal',
      'Notificaciones'
    ],
    cta: 'Contactar Ventas',
    popular: false
  }
];

const PricingSection = () => (
  <section id="pricing" className="py-20 px-4">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="text-center mb-16"
      >
        <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
          Planes simples,{' '}
          <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            sin sorpresas
          </span>
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-lg text-muted-foreground">
          Empieza gratis. Mejora cuando lo necesites.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
      >
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            className={`relative p-8 rounded-2xl border ${
              plan.popular
                ? 'border-violet-500 bg-gradient-to-b from-violet-500/10 to-purple-500/10'
                : 'border-border bg-card'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full text-white text-sm font-medium">
                Mas Popular
              </div>
            )}

            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>

            <div className="mb-6">
              <span className="text-4xl font-bold">{plan.price}</span>
              {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className={`w-full ${
                plan.popular
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700'
                  : ''
              }`}
              variant={plan.popular ? 'default' : 'outline'}
            >
              {plan.cta}
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);
*/

// FAQ Section - Optimizado para SEO con preguntas que la gente busca
const faqs = [
  {
    question: 'Es gratis la app para controlar gastos?',
    answer: 'Si, Financia Suite es 100% gratis. Todas las funciones estan disponibles sin costo: dashboard, registro de gastos e ingresos, metas de ahorro, presupuestos, chat con IA y mas. No hay planes de pago ocultos.'
  },
  {
    question: 'Como puedo controlar mis gastos personales?',
    answer: 'Con Financia Suite puedes registrar cada gasto en segundos, categorizarlo automaticamente, crear presupuestos por categoria y recibir consejos de IA para gastar menos. Veras graficos claros de en que se va tu dinero.'
  },
  {
    question: 'Es segura esta app de finanzas personales?',
    answer: 'Absolutamente. Usamos encriptacion de nivel bancario y nunca compartimos tus datos con terceros. Tu informacion financiera es 100% privada y segura.'
  },
  {
    question: 'Como puedo ahorrar mas dinero?',
    answer: 'La app te ayuda a identificar gastos innecesarios, crear metas de ahorro con seguimiento visual, y recibir consejos personalizados de nuestro asistente IA. Muchos usuarios ahorran hasta un 20% mas usando Financia Suite.'
  },
  {
    question: 'Como funciona el asistente IA para finanzas?',
    answer: 'Fin, nuestro copiloto financiero, analiza tus patrones de gasto y te guia paso a paso dentro de la app para registrar gastos, crear presupuestos y alcanzar tus metas de ahorro. Es como tener un asesor financiero personal gratis.'
  },
  {
    question: 'Puedo usar la app para administrar gastos familiares?',
    answer: 'Si, Financia Suite permite gestionar gastos compartidos con familia o roommates. Puedes crear presupuestos familiares y ver los gastos de todos en un solo lugar.'
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-20 px-4 bg-muted/50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
            Preguntas Frecuentes
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-muted-foreground">
            Resolvemos tus dudas
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="border border-border rounded-xl overflow-hidden bg-card"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium">{faq.question}</span>
                <ChevronRight className={`w-5 h-5 transition-transform ${openIndex === index ? 'rotate-90' : ''}`} />
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6"
                >
                  <p className="text-muted-foreground">{faq.answer}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// CTA Section - Optimizado para SEO
const CTASection = ({ onGetStarted }) => (
  <section className="py-20 px-4">
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="p-12 rounded-3xl bg-gradient-to-r from-violet-600 to-purple-600 text-white"
      >
        <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
          Empieza a controlar tus gastos hoy
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
          Unete a miles de personas que ya administran mejor su dinero con nuestra app de finanzas personales gratis.
        </motion.p>
        <motion.div variants={fadeInUp}>
          <Button
            size="lg"
            onClick={onGetStarted}
            className="bg-white text-violet-600 hover:bg-white/90 text-lg px-8"
          >
            Empezar Gratis - Sin Tarjeta
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

// Footer
const FooterSection = () => (
  <footer className="py-12 px-4 border-t border-border">
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">Financia Suite</span>
          </div>
          <p className="text-muted-foreground text-sm">
            App gratis para control de gastos, presupuestos y ahorro. Tu asistente de finanzas personales con IA.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Producto</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#features" className="hover:text-foreground">Caracteristicas</a></li>
            <li><a href="#" className="hover:text-foreground">Actualizaciones</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Soporte</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
            <li><a href="#" className="hover:text-foreground">Contacto</a></li>
            <li><a href="#" className="hover:text-foreground">Documentacion</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Privacidad</a></li>
            <li><a href="#" className="hover:text-foreground">Terminos</a></li>
            <li><a href="#" className="hover:text-foreground">Cookies</a></li>
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          2026 Financia Suite. Todos los derechos reservados.
        </p>
        <div className="flex items-center gap-4">
          <a href="#" className="text-muted-foreground hover:text-foreground">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
);

// Main Landing Page Component
const LandingPage = ({ onGetStarted }) => {
  return (
    <>
      {/* SEO: Schema.org JSON-LD */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar onGetStarted={onGetStarted} />
        <HeroSection onGetStarted={onGetStarted} />
        <FeaturesSection />
        {/* PricingSection comentado - app 100% gratis */}
        <FAQSection />
        <CTASection onGetStarted={onGetStarted} />
        <FooterSection />
      </div>
    </>
  );
};

export default LandingPage;
