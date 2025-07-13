
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiX } from "react-icons/si"; // Simple Icons (SiX = "X" logo)

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-kozy-cream/30 to-kozy-warm/10 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/images/0a46e880-ecd2-4d0d-af4d-3b55a4cb0225.png" 
                alt="Kozy Logo" 
                className="h-10 w-10"
              />
              <span className="text-2xl font-bold text-kozy-warm">KOZY</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Tu tienda de confianza con los mejores productos de calidad. 
              Descubre comodidad, estilo en cada compra.
            </p>
            <div className="flex space-x-3">
              <Button size="icon" variant="ghost" className="hover:bg-kozy-warm/10 hover:text-[#0000FF]">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" className="hover:bg-kozy-warm/10 hover:text-[#E1306C]">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" className="hover:bg-kozy-warm/10 hover:text-kozy-warm">
             <SiX className="w-5 h-5" />
            </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              {['Inicio', 'Productos', 'Ofertas'].map((link) => (
                <li key={link}>
                  <a 
                    href={`#${link.toLowerCase()}`} 
                    className="text-muted-foreground hover:text-kozy-warm transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Categorías</h3>
            <ul className="space-y-2">
              {[
                'Belleza', 
                'Electrónicos', 
                'Auriculares', 
                'Bijouterie', 
                'Material Escolar',
                'Arte y Craft'
              ].map((category) => (
                <li key={category}>
                  <a 
                    href="#productos" 
                    className="text-muted-foreground hover:text-kozy-warm transition-colors"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-kozy-warm" />
                <span className="text-muted-foreground text-sm">
                  Cordoba, Argentina
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-kozy-warm" />
                <span className="text-muted-foreground text-sm">
                  +54 (351) 351-7716373
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-kozy-warm" />
                <span className="text-muted-foreground text-sm">
                  kozytienda@gmail.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-kozy-warm/10 rounded-2xl p-6 mb-8">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              ¡Mantente al día con nuestras ofertas!
            </h3>
            <p className="text-muted-foreground mb-4">
              Suscríbete a nuestro newsletter y recibe descuentos exclusivos
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu email..."
                className="flex-1 px-4 py-2 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-kozy-warm"
              />
              <Button className="kozy-gradient text-white hover:opacity-90 px-6 py-2 rounded-full">
                Suscribirse
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-muted-foreground text-sm">
                © 2025 Kozy. Todos los derechos reservados.  <br/> NPM - Dandole vida a tus ideas
              </p>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground text-sm">
              <span>Hecho con</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>para nuestros clientes</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
