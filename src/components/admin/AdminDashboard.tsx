
import { Package, Tag, TrendingUp, Eye } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';

const AdminDashboard = () => {
  const { products } = useProducts();
  const { categories } = useCategories();

  const activeProducts = products.filter(p => p.status === 'active').length;
  const totalProducts = products.length;
  const activeCategories = categories.filter(c => c.is_active).length;

  const stats = [
    {
      title: 'Total Productos',
      value: totalProducts,
      icon: Package,
      color: 'text-kozy-warm',
      bgColor: 'bg-kozy-warm/10'
    },
    {
      title: 'Productos Activos',
      value: activeProducts,
      icon: Eye,
      color: 'text-kozy-green',
      bgColor: 'bg-kozy-green/10'
    },
    {
      title: 'Categorías',
      value: activeCategories,
      icon: Tag,
      color: 'text-kozy-orange',
      bgColor: 'bg-kozy-orange/10'
    },
    {
      title: 'Productos en Oferta',
      value: products.filter(p => p.is_on_sale).length,
      icon: TrendingUp,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">
          Resumen general de tu tienda
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Products */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Productos Recientes
        </h3>
        
        {totalProducts === 0 ? (
          <p className="text-muted-foreground">No hay productos registrados aún.</p>
        ) : (
          <div className="space-y-4">
            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
              >
                <div className="flex items-center space-x-4">
                  {product.images_urls && product.images_urls.length > 0 ? (
                    <img
                      src={product.images_urls[0]}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-foreground">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      ${product.price}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    product.status === 'active' 
                      ? 'bg-kozy-green/10 text-kozy-green'
                      : product.status === 'inactive'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {product.status === 'active' && 'Activo'}
                    {product.status === 'inactive' && 'Inactivo'}
                    {product.status === 'draft' && 'Borrador'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
