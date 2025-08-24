import { useState } from "react";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { KivoLogo } from "@/components/kivo-logo";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Productos", href: "/products" },
    { name: "Ofertas", href: "/offers" },
    { name: "Categorías", href: "/categories" },
    { name: "Contacto", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 glass-effect border-b" data-testid="header">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* KIVO Logo - Ultra Prominent */}
          <KivoLogo 
            size="lg" 
            animated={true} 
            showSlogan={true}
            className="hover:scale-105 transition-all duration-300"
          />

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-8" data-testid="navigation">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <a 
                  className={`font-semibold transition-all duration-300 hover:scale-110 ${
                    location === item.href 
                      ? "text-kivo-purple" 
                      : "text-gray-700 hover:text-kivo-purple"
                  }`}
                  data-testid={`nav-link-${item.name.toLowerCase()}`}
                >
                  {item.name}
                </a>
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4" data-testid="user-actions">
            {/* Search */}
            <div className="hidden md:flex items-center">
              <Input 
                type="search" 
                placeholder="Buscar productos..." 
                className="w-64"
                data-testid="search-input"
              />
            </div>
            
            <Button 
              size="icon" 
              className="p-3 rounded-full bg-kivo-purple text-white hover:bg-kivo-gold transition-all duration-300 hover:scale-110 hover:rotate-12"
              data-testid="search-button"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Cart */}
            <Button 
              size="icon" 
              className="relative p-3 rounded-full bg-kivo-purple text-white hover:bg-kivo-gold transition-all duration-300 hover:scale-110 hover:rotate-12"
              data-testid="cart-button"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="absolute -top-2 -right-2 bg-kivo-gold text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce-slow" data-testid="cart-count">
                0
              </span>
            </Button>

            {/* User */}
            <Button 
              className="px-6 py-3 bg-gradient-to-r from-kivo-purple to-kivo-gold text-white font-semibold rounded-full hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              data-testid="login-button"
            >
              <User className="h-4 w-4 mr-2" />
              Ingresar
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              size="icon"
              variant="ghost"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t" data-testid="mobile-menu">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a 
                    className={`font-semibold transition-colors duration-300 ${
                      location === item.href 
                        ? "text-kivo-purple" 
                        : "text-gray-700 hover:text-kivo-purple"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                    data-testid={`mobile-nav-link-${item.name.toLowerCase()}`}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t">
              <Input 
                type="search" 
                placeholder="Buscar productos..." 
                className="w-full"
                data-testid="mobile-search-input"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
