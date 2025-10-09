import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, PiggyBank, BarChart, Target, Shield } from 'lucide-react';

const tips = [
    {
        icon: Lightbulb,
        title: "Revisa gastos pequeños",
        text: "Los cafés diarios o suscripciones suman. ¡Revisarlos puede liberar una cantidad sorprendente de dinero!",
        color: "bg-yellow-400/20 text-yellow-500",
    },
    {
        icon: PiggyBank,
        title: "Automatiza tus ahorros",
        text: "Configura una transferencia automática a tu cuenta de ahorros cada día de pago. ¡Ahorrarás sin pensarlo!",
        color: "bg-green-400/20 text-green-500",
    },
    {
        icon: BarChart,
        title: "Presupuesto 50/30/20",
        text: "Destina el 50% de tus ingresos a necesidades, 30% a deseos y 20% a ahorros e inversiones.",
        color: "bg-blue-400/20 text-blue-500",
    },
    {
        icon: Target,
        title: "Define metas claras",
        text: "Tener un objetivo claro, como un viaje o un coche, te mantendrá motivado para ahorrar.",
        color: "bg-purple-400/20 text-purple-500",
    },
    {
        icon: Shield,
        title: "Crea un fondo de emergencia",
        text: "Intenta tener de 3 a 6 meses de tus gastos básicos ahorrados para imprevistos. Te dará tranquilidad.",
        color: "bg-red-400/20 text-red-500",
    },
];

const PersonalizedTips = () => {
    const duplicatedTips = [...tips, ...tips];

    return (
        <div className="py-6">
            <h3 className="text-xl font-bold mb-4 px-4 md:px-0">Consejos para ti</h3>
            <div className="relative w-full overflow-hidden tips-container">
                <div className="tips-carousel">
                    {duplicatedTips.map((tip, index) => {
                        const Icon = tip.icon;
                        return (
                            <motion.div
                                key={index}
                                className="flex-shrink-0 w-[280px] md:w-[320px] mx-3"
                                whileHover={{ y: -5 }}
                            >
                                <div className="p-5 rounded-xl h-full bg-card-subtle border flex flex-col items-start">
                                    <div className={`p-3 rounded-full ${tip.color} mb-3`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold text-md mb-1">{tip.title}</h4>
                                    <p className="text-sm text-muted-foreground">{tip.text}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PersonalizedTips;