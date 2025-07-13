
import { useState } from 'react';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

const OffersSection = () => {
  const { products, isLoading } = useProducts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrar productos en oferta y activos
  const offerProducts = products.filter(product => 
    product.is_on_sale && product.status === 'active'
  );

  const itemsPerView = window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 3 : 4;
  const maxIndex = Math.max(0, offerProducts.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  if (isLoading) {
    return (
      <section className="py-8 md:py-16 bg-gradient-to-br from-kozy-warm/5 to-kozy-orange/5">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-kozy-warm/30 border-t-kozy-warm rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground text-sm">Cargando ofertas...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (offerProducts.length === 0) {
    return (
      <section className="py-8 md:py-16 bg-gradient-to-br from-kozy-warm/5 to-kozy-orange/5">
        <div className="container mx-auto px-3 md:px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
              Ofertas
              <span className="block text-kozy-warm">Especiales</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              No hay ofertas disponibles en este momento. ¡Vuelve pronto para ver nuestras mejores promociones!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-16 bg-gradient-to-br from-kozy-warm/5 to-kozy-orange/5">
      <div className="container mx-auto px-3 md:px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
            Ofertas
            <span className="block text-kozy-warm">Especiales</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Descubre nuestras mejores ofertas con descuentos increíbles por tiempo limitado
          </p>
        </div>

        {/* Products Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          {offerProducts.length > itemsPerView && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full h-8 w-8 md:h-10 md:w-10"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full h-8 w-8 md:h-10 md:w-10"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </>
          )}

          {/* Products Grid */}
          <div className="overflow-hidden mx-6 md:mx-8">
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-2 md:gap-4"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {offerProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className="flex-shrink-0"
                  style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 8 / itemsPerView}px)` }}
                >
                  <div 
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ProductCard
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
                      onClick={() => handleProductClick(product)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          {offerProducts.length > itemsPerView && (
            <div className="flex justify-center mt-6 md:mt-8 space-x-2">
              {Array.from({ length: maxIndex + 1 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors ${
                    i === currentIndex ? 'bg-kozy-warm' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Modal */}
        {selectedProduct && (
          <ProductModal
            product={{
              id: selectedProduct.id,
              name: selectedProduct.name,
              price: selectedProduct.price,
              originalPrice: selectedProduct.original_price,
              images: selectedProduct.images_urls || ['/placeholder.svg'],
              category: selectedProduct.category_id || 'Sin categoría',
              rating: selectedProduct.rating || 0,
              reviews: selectedProduct.reviews_count || 0,
              isNew: selectedProduct.is_new,
              isOnSale: selectedProduct.is_on_sale,
              discount: selectedProduct.discount,
              description: selectedProduct.description
            }}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </section>
  );
};

export default OffersSection;
