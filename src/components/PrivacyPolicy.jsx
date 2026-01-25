import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Lock, Eye, Server, Trash2, Download,
  Smartphone, Database, CheckCircle, ArrowLeft
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PrivacyPolicy = ({ onBack }) => {
  const sections = [
    {
      icon: Database,
      title: 'Almacenamiento Local',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
      content: [
        'Todos tus datos financieros se almacenan únicamente en tu dispositivo.',
        'Utilizamos el almacenamiento local del navegador (localStorage).',
        'Tus datos NUNCA se envían a servidores externos.',
        'No tenemos acceso a tu información financiera.'
      ]
    },
    {
      icon: Server,
      title: 'Sin Servidores',
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
      content: [
        'Esta aplicación funciona 100% en tu dispositivo.',
        'No hay bases de datos en la nube.',
        'No hay riesgo de hackeos masivos porque no hay servidor central.',
        'Tu información está tan segura como tu propio dispositivo.'
      ]
    },
    {
      icon: Eye,
      title: 'Sin Rastreo',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20',
      content: [
        'No utilizamos cookies de rastreo.',
        'No recopilamos analíticas de uso.',
        'No vendemos ni compartimos datos con terceros.',
        'No hay publicidad ni perfiles de usuario.'
      ]
    },
    {
      icon: Lock,
      title: 'Seguridad',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/20',
      content: [
        'Puedes proteger la app con un PIN de acceso.',
        'El PIN se almacena de forma segura usando hash SHA-256.',
        'Bloqueo automático después de intentos fallidos.',
        'Bloqueo por inactividad configurable.'
      ]
    },
    {
      icon: Download,
      title: 'Exportación de Datos',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/20',
      content: [
        'Puedes exportar todos tus datos en cualquier momento.',
        'Formatos disponibles: JSON (backup completo) y CSV.',
        'Los archivos se descargan directamente a tu dispositivo.',
        'Eres dueño total de tu información.'
      ]
    },
    {
      icon: Trash2,
      title: 'Eliminación de Datos',
      color: 'text-red-500',
      bgColor: 'bg-red-500/20',
      content: [
        'Puedes eliminar todos tus datos cuando quieras.',
        'La eliminación es inmediata e irreversible.',
        'No quedan copias en ningún servidor.',
        'También puedes restablecer la app completamente.'
      ]
    }
  ];

  const commitments = [
    'Nunca venderemos tus datos',
    'Nunca compartiremos tu información',
    'Nunca te rastrearemos',
    'Siempre tendrás control total de tus datos',
    'La app siempre funcionará sin conexión'
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Política de Privacidad
            </h1>
            <p className="text-muted-foreground text-lg">
              Tu privacidad es nuestra prioridad
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>
        </div>

        {/* Resumen principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 mb-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">En Resumen</h2>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Financia Suite</strong> es una aplicación que funciona
                  100% en tu dispositivo. Tus datos financieros nunca salen de tu teléfono o computadora.
                  No tenemos servidores, no recopilamos información, y no podemos ver tus datos aunque quisiéramos.
                  <span className="text-green-500 font-medium"> Tú tienes el control total.</span>
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Secciones detalladas */}
        <div className="grid gap-6 mb-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${section.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <section.icon className={`w-6 h-6 ${section.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-3">{section.title}</h3>
                    <ul className="space-y-2">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Compromisos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-center">Nuestros Compromisos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {commitments.map((commitment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-primary/5"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{commitment}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Nota importante */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-orange-500/10 border-orange-500/30">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              Importante
            </h3>
            <p className="text-sm text-muted-foreground">
              Como tus datos solo están en tu dispositivo, es <strong className="text-foreground">tu responsabilidad</strong> hacer
              backups periódicos. Si borras la app, limpias el caché del navegador, o pierdes tu dispositivo,
              tus datos se perderán a menos que tengas un backup. Te recomendamos exportar tus datos
              regularmente y guardar el archivo en un lugar seguro.
            </p>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>¿Tienes preguntas sobre privacidad?</p>
          <p className="mt-1">
            Esta política es simple porque nuestra filosofía es simple:
            <span className="text-primary font-medium"> tus datos son tuyos</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
