
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShoppingCart } from '@/contexts/ShoppingContext';
import { useToast } from '@/hooks/use-toast';
import LazyImage from '@/components/ui/LazyImage';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewsCount: number;
  isNew?: boolean;
  isOnSale?: boolean;
  discount?: number;
  onClick?: () => void;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviewsCount,
  isNew,
  isOnSale,
  discount,
  onClick
}: ProductCardProps) => {
  const { addToCart, toggleFavorite, favorites } = useShoppingCart();
  const { toast } = useToast();
  const isFavorite = favorites.includes(id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id,
      name,
      price,
      images_urls: [image]
    });
    toast({
      title: "Producto agregado",
      description: `${name} ha sido agregado al carrito`,
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(id);
    toast({
      title: isFavorite ? "Eliminado de favoritos" : "Agregado a favoritos",
      description: `${name} ${isFavorite ? 'eliminado de' : 'agregado a'} tus favoritos`,
    });
  };

  return (
    <div 
      className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-border"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        <div className="aspect-square bg-muted">
          <LazyImage
            src={image}
            alt={name}
            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
            fallback="/placeholder.svg"
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <span className="bg-kozy-green text-white text-xs font-semibold px-2 py-1 rounded-full">
              Nuevo
            </span>
          )}
          {isOnSale && discount && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 w-8 h-8 rounded-full transition-colors ${
            isFavorite 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
          onClick={handleToggleFavorite}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>

        {/* Add to Cart Button */}
        <Button
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full kozy-gradient text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-kozy-warm transition-colors">
          {name}
        </h3>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-muted-foreground">
              {rating.toFixed(1)} ({reviewsCount})
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-kozy-warm">
              ${price.toFixed(2)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
