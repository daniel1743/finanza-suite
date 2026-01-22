import React from 'react';
import { Wallet, Info, HelpCircle, Mail, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const FooterInfoModal = ({ triggerText, title, content }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
        {triggerText}
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <p className="text-muted-foreground">{content}</p>
    </DialogContent>
  </Dialog>
);


const Footer = ({ setCurrentView }) => {
  return (
    <footer className="bg-card/50 border-t border-border mt-8 p-8 text-sm text-muted-foreground">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-lg text-foreground">Financia Suite</p>
            </div>
            <p>© {new Date().getFullYear()} Financia Suite. Todos los derechos reservados.</p>
        </div>

        <div>
          <p className="font-semibold text-foreground mb-4">Acerca de</p>
          <ul className="space-y-2">
            <li>
                <FooterInfoModal
                    triggerText="Quiénes Somos"
                    title="Quiénes Somos"
                    content="Somos un equipo apasionado por las finanzas personales y la tecnología. Creamos Financia Suite para ayudar a las personas a tomar el control de su dinero de forma simple e intuitiva. Nuestro objetivo es democratizar la educación financiera y brindar herramientas accesibles para todos."
                />
            </li>
            <li>
                <FooterInfoModal
                    triggerText="Visión"
                    title="Nuestra Visión"
                    content="Convertirnos en la herramienta de gestión financiera personal más simple, efectiva y recomendada del mercado hispanohablante. Queremos que cada persona pueda alcanzar sus metas financieras sin importar su nivel de conocimiento previo."
                />
            </li>
            <li>
                <FooterInfoModal
                    triggerText="Misión"
                    title="Nuestra Misión"
                    content="Facilitar a los usuarios el control total de su dinero para alcanzar la libertad financiera a través de visualizaciones intuitivas, planificación proactiva y educación financiera personalizada. Creemos que todos merecen las herramientas para construir un futuro financiero sólido."
                />
            </li>
          </ul>
        </div>

         <div>
          <p className="font-semibold text-foreground mb-4">Soporte</p>
          <ul className="space-y-2">
            <li>
                <FooterInfoModal
                    triggerText="Ayuda"
                    title="Centro de Ayuda"
                    content="¿Necesitas ayuda? Puedes reportar problemas directamente desde tu perfil usando el botón 'Reportar un Problema'. También puedes consultar nuestras guías de uso en la sección de configuración. Respondemos todos los tickets en un máximo de 48 horas hábiles."
                />
            </li>
            <li>
                <FooterInfoModal
                    triggerText="Contacto"
                    title="Contacto"
                    content="Para soporte técnico o consultas generales, puedes contactarnos a través del sistema de tickets en la aplicación o enviando un email a: soporte@financiasuite.com. Estamos disponibles de lunes a viernes, de 9:00 a 18:00 (hora local)."
                />
            </li>
          </ul>
        </div>

        <div>
           <p className="font-semibold text-foreground mb-4">Legal</p>
          <ul className="space-y-2">
            <li>
                <FooterInfoModal
                    triggerText="Términos de Uso"
                    title="Términos de Uso"
                    content="Al utilizar Financia Suite, aceptas nuestros términos de servicio. La aplicación es para uso personal y no constituye asesoría financiera profesional. Los usuarios son responsables de la exactitud de los datos ingresados. Nos reservamos el derecho de modificar los términos con previo aviso."
                />
            </li>
            <li>
                <FooterInfoModal
                    triggerText="Privacidad"
                    title="Política de Privacidad"
                    content="Tu privacidad es nuestra prioridad. Los datos financieros que ingresas se almacenan de forma segura y encriptada. No compartimos tu información personal con terceros sin tu consentimiento. Puedes solicitar la eliminación de tus datos en cualquier momento desde la configuración de tu cuenta."
                />
            </li>
            <li>
              <Button variant="link" onClick={() => setCurrentView('settings')} className="p-0 h-auto text-muted-foreground hover:text-primary">
                Configuración
              </Button>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
};

export default Footer;