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
              <p className="font-bold text-lg text-foreground">FinanzApp</p>
            </div>
            <p>© {new Date().getFullYear()} FinanzApp. Todos los derechos reservados.</p>
        </div>

        <div>
          <p className="font-semibold text-foreground mb-4">Acerca de</p>
          <ul className="space-y-2">
            <li>
                <FooterInfoModal 
                    triggerText="Quiénes Somos" 
                    title="Quiénes Somos" 
                    content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." 
                />
            </li>
            <li>
                <FooterInfoModal 
                    triggerText="Visión" 
                    title="Nuestra Visión" 
                    content="Convertirse en la herramienta de gestión financiera personal más simple, efectiva y recomendada del mercado hispanohablante." 
                />
            </li>
            <li>
                <FooterInfoModal 
                    triggerText="Misión" 
                    title="Nuestra Misión" 
                    content="Facilitar a los usuarios el control total de su dinero para alcanzar la libertad financiera a través de la visualización intuitiva y la planificación proactiva." 
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
                    content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." 
                />
            </li>
            <li>
                <FooterInfoModal 
                    triggerText="Contacto" 
                    title="Contacto" 
                    content="Para soporte, por favor envíe un email a: soporte@finanzapp.example" 
                />
            </li>
          </ul>
        </div>
        
        <div>
           <p className="font-semibold text-foreground mb-4">Acceso Rápido</p>
          <ul className="space-y-2">
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