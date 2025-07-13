
import { Heart, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useShoppingCart } from '@/contexts/ShoppingContext';
import ProductCard from './ProductCard';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FavoritesModal = ({ isOpen, onClose }: FavoritesModalProps) => {
  const { favorites, products, toggleFavorite } = useShoppingCart();
  
  const favoriteProducts = products.filter(product => 
    favorites.includes(product.id) && product.status === 'active'
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Mis Favoritos ({favoriteProducts.length})
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {favoriteProducts.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No tienes favoritos aún
              </h3>
              <p className="text-muted-foreground">
                Explora nuestros productos y marca los que más te gusten
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.original_price}
                  image={product.images_urls?.[0] || '/placeholder.svg'}
                  rating={product.rating || 0}
                  reviewsCount={product.reviews_count || 0}
                  isNew={product.is_new}
                  isOnSale={product.is_on_sale}
                  discount={product.discount}
                />
              ))}
            </div>
          )}
        </div>

        {favoriteProducts.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => {
                favorites.forEach(id => toggleFavorite(id));
              }}
              className="w-full"
            >
              Limpiar todos los favoritos
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FavoritesModal;
