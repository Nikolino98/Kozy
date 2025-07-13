
import { useState } from 'react';
import { ShoppingCart, Search, Menu, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShoppingCart } from '@/contexts/ShoppingContext';
import CartSidebar from './CartSidebar';
import FavoritesModal from './FavoritesModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const { getCartItemsCount, favorites } = useShoppingCart();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <div className="flex items-center space-x-1 md:space-x-2">
              <img 
                src="/images/0a46e880-ecd2-4d0d-af4d-3b55a4cb0225.png" 
                alt="Kozy Logo" 
                className="h-8 w-8 md:h-10 md:w-10"
              />
              <span className="text-xl md:text-2xl font-bold text-kozy-warm">KOZY</span>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a href="#" className="text-sm lg:text-base text-foreground hover:text-kozy-warm transition-colors duration-300">Inicio</a>
              <a href="#productos" className="text-sm lg:text-base text-foreground hover:text-kozy-warm transition-colors duration-300">Productos</a>
              <a href="#ofertas" className="text-sm lg:text-base text-foreground hover:text-kozy-warm transition-colors duration-300">Ofertas</a>
              <a href="#contacto" className="text-sm lg:text-base text-foreground hover:text-kozy-warm transition-colors duration-300">Contacto</a>
            </nav>

            

            {/* Cart, Favorites and Menu */}
            <div className="flex items-center space-x-1 md:space-x-2">
              {/* Favorites Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsFavoritesOpen(true)}
                className="relative hover:bg-kozy-warm/10 transition-all duration-300 hover:scale-110 h-8 w-8 md:h-10 md:w-10"
              >
                <Heart className="h-4 w-4 md:h-5 md:w-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-kozy-warm text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center animate-bounce-gentle">
                    {favorites.length}
                  </span>
                )}
              </Button>

              {/* Cart Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsCartOpen(true)}
                className="relative hover:bg-kozy-warm/10 transition-all duration-300 hover:scale-110 h-8 w-8 md:h-10 md:w-10"
              >
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-kozy-warm text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center animate-bounce-gentle">
                    {getCartItemsCount()}
                  </span>
                )}
              </Button>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-kozy-warm/10 transition-all duration-300 h-8 w-8"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-background border-t border-border animate-fade-in-up">
              <div className="px-3 py-3 space-y-3">
                
                {/* Mobile Navigation */}
                <nav className="flex flex-col space-y-1">
                  <a href="#" className="text-foreground hover:text-kozy-warm transition-colors duration-300 py-2 text-sm">Inicio</a>
                  <a href="#productos" className="text-foreground hover:text-kozy-warm transition-colors duration-300 py-2 text-sm">Productos</a>
                  <a href="#ofertas" className="text-foreground hover:text-kozy-warm transition-colors duration-300 py-2 text-sm">Ofertas</a>
                  <a href="#contacto" className="text-foreground hover:text-kozy-warm transition-colors duration-300 py-2 text-sm">Contacto</a>
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      {/* Favorites Modal */}
      <FavoritesModal isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} />
    </>
  );
};

export default Header;
