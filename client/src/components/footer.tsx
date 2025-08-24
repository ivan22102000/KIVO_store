import { Facebook, Instagram, Twitter, Linkedin, Shield, Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

export function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    alert("¡Gracias por suscribirte!");
  };

  return (
    <footer className="bg-kivo-dark text-white" data-testid="footer">
      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-kivo-purple to-kivo-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-orbitron font-bold text-5xl mb-6 kivo-glow" data-testid="newsletter-title">
              ¡Únete a la Familia KIVO!
            </h2>
            <p className="text-xl mb-12 opacity-90" data-testid="newsletter-description">
              Sé el primero en conocer nuestras ofertas exclusivas, nuevos productos y promociones especiales. 
              Recibe contenido premium directamente en tu inbox.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8" onSubmit={handleNewsletterSubmit} data-testid="newsletter-form">
              <Input 
                type="email" 
                placeholder="tu@email.com" 
                className="flex-1 px-6 py-4 rounded-full text-gray-800 font-semibold text-lg"
                required
                data-testid="newsletter-email"
              />
              <Button 
                type="submit" 
                className="px-12 py-4 bg-kivo-gold text-kivo-dark font-bold text-lg rounded-full hover:bg-white hover:text-kivo-purple transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                data-testid="newsletter-submit"
              >
                Suscribirse 🚀
              </Button>
            </form>
            
            <div className="flex justify-center space-x-8 text-sm opacity-75" data-testid="newsletter-benefits">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-kivo-gold" />
                Sin spam garantizado
              </div>
              <div className="flex items-center">
                <Gift className="h-4 w-4 mr-2 text-kivo-gold" />
                Ofertas exclusivas
              </div>
              <div className="flex items-center">
                <X className="h-4 w-4 mr-2 text-kivo-gold" />
                Cancela cuando quieras
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div data-testid="footer-brand">
              <div className="flex items-center space-x-4 mb-6">
                <h3 className="font-orbitron font-black text-4xl text-kivo-purple kivo-glow">KIVO</h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Justo lo que necesitas. Tu tienda de confianza para tecnología premium y productos únicos.
              </p>
              <div className="flex space-x-4" data-testid="social-links">
                <Button
                  size="icon"
                  className="w-12 h-12 bg-kivo-purple rounded-full hover:bg-kivo-gold transition-all duration-300 hover:scale-110"
                  data-testid="social-facebook"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  className="w-12 h-12 bg-kivo-purple rounded-full hover:bg-kivo-gold transition-all duration-300 hover:scale-110"
                  data-testid="social-instagram"
                >
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  className="w-12 h-12 bg-kivo-purple rounded-full hover:bg-kivo-gold transition-all duration-300 hover:scale-110"
                  data-testid="social-twitter"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  className="w-12 h-12 bg-kivo-purple rounded-full hover:bg-kivo-gold transition-all duration-300 hover:scale-110"
                  data-testid="social-linkedin"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Shop Links */}
            <div data-testid="footer-shop">
              <h4 className="font-bold text-xl mb-6 text-kivo-gold">Comprar</h4>
              <ul className="space-y-3">
                <li><Link href="/products"><a className="text-gray-300 hover:text-kivo-gold transition-colors duration-300" data-testid="link-all-products">Todos los Productos</a></Link></li>
                <li><Link href="/products?category=electronics"><a className="text-gray-300 hover:text-kivo-gold transition-colors duration-300" data-testid="link-electronics">Electrónicos</a></Link></li>
                <li><Link href="/products?category=home"><a className="text-gray-300 hover:text-kivo-gold transition-colors duration-300" data-testid="link-home">Hogar</a></Link></li>
                <li><Link href="/products?category=accessories"><a className="text-gray-300 hover:text-kivo-gold transition-colors duration-300" data-testid="link-accessories">Accesorios</a></Link></li>
                <li><Link href="/offers"><a className="text-gray-300 hover:text-kivo-gold transition-colors duration-300" data-testid="link-offers">Ofertas Especiales</a></Link></li>
              </ul>
            </div>

            {/* Support Links */}
            <div data-testid="footer-support">
              <h4 className="font-bold text-xl mb-6 text-kivo-gold">Soporte</h4>
              <ul className="space-y-3">
                <li><Link href="/help"><a className="text-gray-300 hover:text-kivo-gold transition-colors duration-300" data-testid="link-help">Centro de Ayuda</a></Link></li>
                <li><Link href="/contact"><a className="text-gray-300 hover:text-kivo-gold transition-colors duration-300" data-testid="link-contact">Contacto</a></Link></li>
                <li><Link href="/warranty"><a className="text-gray-300 hover:text-kivo-gold transition-colors duration-300" data-testid="link-warranty">Garantías</a></Link></li>
                <li><Link href="/returns"><a className="text-gray-300 hover:text-kivo-gold transition-colors duration-300" data-testid="link-returns">Devoluciones</a></Link></li>
                <li><Link href="/shipping"><a className="text-gray-300 hover:text-kivo-gold transition-colors duration-300" data-testid="link-shipping">Envíos</a></Link></li>
              </ul>
            </div>

            {/* Company Links */}
            <div data-testid="footer-company">
              <h4 className="font-bold text-xl mb-6 text-kivo-gold">Empresa</h4>
              <ul className="space-y-3">
                <li><Link href="/about"><a className="text-gray-300 hover:text-kivo-gold transition-colors duration-300" data-testid="link-about">Sobre Nosotros</a></Link></li>
                <li><Link href="/careers"><a className="text-gray-300 hover:text-kivo-gold transition-colors duration-300" data-testid="link-careers">Careers</a></Link></li>
                <li><Link href="/privacy"><a className="text-gray-300 hover:text-kivo-gold transition-colors duration-300" data-testid="link-privacy">Privacidad</a></Link></li>
                <li><Link href="/terms"><a className="text-gray-300 hover:text-kivo-gold transition-colors duration-300" data-testid="link-terms">Términos</a></Link></li>
                <li><Link href="/blog"><a className="text-gray-300 hover:text-kivo-gold transition-colors duration-300" data-testid="link-blog">Blog</a></Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400" data-testid="copyright">
              © 2024 KIVO. Todos los derechos reservados. Hecho con ❤️ para una experiencia excepcional.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
