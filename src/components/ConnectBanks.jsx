import React from 'react';
import { motion } from 'framer-motion';
import { Landmark, ShieldCheck, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ConnectBanks = () => {
  return (
    <div className="p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="p-8 md:p-12 text-center glass-effect">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
            <Landmark className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Conexión Bancaria Segura
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            ¡Próximamente! Podrás conectar tus cuentas bancarias para sincronizar tus transacciones automáticamente y tener una visión completa de tus finanzas en un solo lugar.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">Seguridad de Nivel Bancario</h3>
                <p className="text-sm text-muted-foreground">Utilizaremos proveedores líderes en la industria para garantizar que tus datos estén siempre encriptados y protegidos.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Lock className="w-8 h-8 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">Solo Lectura</h3>
                <p className="text-sm text-muted-foreground">La conexión será de solo lectura. Nadie, ni siquiera nosotros, podrá realizar movimientos en tus cuentas.</p>
              </div>
            </div>
          </div>

          <Button size="lg" disabled>
            Próximamente
          </Button>
        </Card>
      </motion.div>
    </div>
  );
};

export default ConnectBanks;