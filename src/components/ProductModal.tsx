
import { useState } from 'react';
import { X, Heart, ShoppingCart, Star, Minus, Plus, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useShoppingCart } from '@/contexts/ShoppingContext';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isOnSale?: boolean;
  discount?: number;
  description?: string;
}

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal = ({ product, isOpen, onClose }: ProductModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart, toggleFavorite, favorites } = useShoppingCart();

  const isFavorite = favorites.includes(product.id.toString());
  const productDescription = product.description || `${product.name} es un producto de alta calidad en la categoría de ${product.category}. Perfecto para satisfacer tus necesidades con la mejor relación calidad-precio del mercado.`;

  const handleAddToCart = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        images_urls: product.images
      });
    }
    
    setIsLoading(false);
    console.log(`Agregado al carrito: ${product.name} x${quantity}`);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product.id.toString());
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Mira este increíble producto: ${product.name}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      console.log('URL copiada al portapapeles');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-background rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border p-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-semibold text-foreground">Vista Previa</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery Section */}
            <div className="space-y-4">
              {/* Main Image with Slider */}
              <div className="relative group">
                <div className="aspect-square bg-muted rounded-2xl overflow-hidden">
                  <img
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>

                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  {product.isNew && (
                    <Badge className="bg-kozy-green text-white shadow-lg">
                      Nuevo
                    </Badge>
                  )}
                  {product.isOnSale && product.discount && (
                    <Badge className="bg-kozy-warm text-white shadow-lg">
                      -{product.discount}%
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={handleToggleFavorite}
                    className={`bg-white/90 hover:bg-white shadow-lg transition-all ${
                      isFavorite 
                        ? 'text-red-500 bg-red-50' 
                        : ''
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={handleShare}
                    className="bg-white/90 hover:bg-white shadow-lg"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Image Counter */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex 
                          ? 'border-kozy-warm' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category */}
              <span className="text-sm font-medium text-kozy-warm uppercase tracking-wide">
                {product.category}
              </span>

              {/* Title */}
              <h1 className="text-4xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-kozy-warm text-kozy-warm'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviews} reseñas)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3">
                <span className="text-4xl font-bold text-foreground">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Descripción</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {productDescription}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Cantidad</h3>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="rounded-full"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="rounded-full"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="w-full kozy-gradient text-white hover:opacity-90 transition-all transform hover:scale-105 disabled:transform-none disabled:opacity-70 py-4 text-lg font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Agregando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Agregar al Carrito - ${(product.price * quantity).toFixed(2)}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
