
import { useState } from 'react';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import ProductModal from './ProductModal';
import { Button } from '@/components/ui/button';
import { Grid3X3, List } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';

const ProductsSection = () => {
  const { products, isLoading: productsLoading } = useProducts();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [showCount, setShowCount] = useState(12);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrar solo productos activos
  const activeProducts = products.filter(product => product.status === 'active');

  const filteredProducts = selectedCategory === 'all' 
    ? activeProducts 
    : activeProducts.filter(product => product.category_id === selectedCategory);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const displayedProducts = sortedProducts.slice(0, showCount);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  if (productsLoading || categoriesLoading) {
    return (
      <section id="productos" className="py-8 md:py-16 bg-background">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-kozy-warm/30 border-t-kozy-warm rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground text-sm">Cargando productos...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="productos" className="py-8 md:py-16 bg-background">
      <div className="container mx-auto px-3 md:px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
            Nuestros
            <span className="block text-kozy-warm">Productos</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Descubre nuestra amplia gama de productos de alta calidad para todas tus necesidades
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6 md:mb-8">
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 md:gap-4 mb-6 md:mb-8 bg-card p-3 md:p-4 rounded-xl md:rounded-2xl border border-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
            <div className="flex items-center">
              <span className="text-xs md:text-sm font-medium text-muted-foreground">
                {filteredProducts.length} productos encontrados
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full md:w-auto">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 md:px-3 py-1.5 md:py-2 border border-border rounded-md md:rounded-lg bg-background text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-kozy-warm"
              >
                <option value="featured">Destacados</option>
                <option value="price-low">Precio: Menor a Mayor</option>
                <option value="price-high">Precio: Mayor a Menor</option>
                <option value="rating">Mejor Valorados</option>
                <option value="name">Nombre A-Z</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-border rounded-md md:rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-none text-xs md:text-sm px-2 md:px-3 h-8 md:h-9 ${viewMode === 'grid' ? 'kozy-gradient text-white' : ''}`}
                >
                  <Grid3X3 className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-none text-xs md:text-sm px-2 md:px-3 h-8 md:h-9 ${viewMode === 'list' ? 'kozy-gradient text-white' : ''}`}
                >
                  <List className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {displayedProducts.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <p className="text-base md:text-lg text-muted-foreground mb-2 md:mb-4">No hay productos disponibles</p>
            <p className="text-xs md:text-sm text-muted-foreground">Los productos se mostrarán aquí cuando estén disponibles.</p>
          </div>
        ) : (
          <div className={`grid gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12 ${
            viewMode === 'grid' 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
              : 'grid-cols-1 md:grid-cols-2'
          }`}>
            {displayedProducts.map((product, index) => (
              <div 
                key={product.id}
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
            ))}
          </div>
        )}

        {/* Load More Button */}
        {showCount < filteredProducts.length && (
          <div className="text-center">
            <Button
              onClick={() => setShowCount(prev => prev + 8)}
              variant="outline"
              size="default"
              className="border-kozy-warm text-kozy-warm hover:bg-kozy-warm/10 px-6 md:px-8 py-2 md:py-3 text-sm md:text-base"
            >
              Cargar Más Productos
            </Button>
          </div>
        )}

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

export default ProductsSection;
