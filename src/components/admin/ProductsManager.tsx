import { useState } from 'react';
import { Plus, Edit, Trash2, Image, Eye, EyeOff, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { uploadMultipleImages, deleteImage } from '@/lib/storage';
import ImageUploadPreview from '@/components/ImageUploadPreview';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import LazyImage from '@/components/ui/LazyImage';

const ProductsManager = () => {
  const { products, isLoading, createProduct, updateProduct, deleteProduct } = useProducts();
  const { categories } = useCategories();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category_id: '',
    stock: '',
    rating: '5',
    reviews_count: '0',
    is_new: false,
    is_on_sale: false,
    discount: '',
    status: 'active' as 'active' | 'inactive' | 'draft',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      category_id: '',
      stock: '',
      rating: '5',
      reviews_count: '0',
      is_new: false,
      is_on_sale: false,
      discount: '',
      status: 'active',
    });
    setImageFiles(null);
    setEditingProduct(null);
  };

  const handleOpenDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        original_price: product.original_price?.toString() || '',
        category_id: product.category_id || '',
        stock: product.stock?.toString() || '',
        rating: product.rating?.toString() || '5',
        reviews_count: product.reviews_count?.toString() || '0',
        is_new: product.is_new || false,
        is_on_sale: product.is_on_sale || false,
        discount: product.discount?.toString() || '',
        status: product.status || 'active',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageFiles(e.target.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadProgress(0);
  
    try {
      // Acceder a los valores del formData
      const { name, price, description, category_id } = formData;
  
      if (!name || !price || !description || !category_id) {
        throw new Error('Por favor, complete todos los campos requeridos');
      }
  
      let imageUrls = editingProduct?.images_urls || [];
  
      // Upload new images with progress tracking
      if (imageFiles && imageFiles.length > 0) {
        const filesArray = Array.from(imageFiles);
        
        toast({
          title: "Procesando imágenes",
          description: "Comprimiendo y optimizando imágenes...",
        });
  
        try {
          // Delete old images if updating
          if (editingProduct?.images_urls) {
            await Promise.all(
              editingProduct.images_urls.map(url => deleteImage(url))
            );
            imageUrls = [];
          }
  
          // Upload new images
          const uploadedUrls = await uploadMultipleImages(
            filesArray,
            'product-images',
            (progress) => setUploadProgress(progress)
          );
  
          if (!uploadedUrls || uploadedUrls.length === 0) {
            throw new Error('Error al subir las imágenes');
          }
  
          imageUrls = uploadedUrls;
        } catch (error) {
          console.error('Error al procesar imágenes:', error);
          throw new Error(`Error al procesar imágenes: ${error.message}`);
        }
      }
  
      const productData = {
        name,
        price: Number(price),
        description,
        category_id,
        images_urls: imageUrls,
        is_new: formData.is_new,
        is_on_sale: formData.is_on_sale,
        status: formData.status,
        stock: Number(formData.stock || 0),
        rating: Number(formData.rating || 5),
        reviews_count: Number(formData.reviews_count || 0),
        discount: Number(formData.discount || 0)
      };
  
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast({
          title: "Éxito",
          description: "Producto actualizado correctamente",
        });
      } else {
        await createProduct(productData);
        toast({
          title: "Éxito",
          description: "Producto creado correctamente",
        });
      }
  
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error al guardar producto:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error al guardar el producto"
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (product: any) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      toast({
        title: "Eliminando producto...",
        description: "Por favor espera mientras se elimina el producto.",
      });

      const success = await deleteProduct(product.id);
      if (success) {
        // Eliminar imágenes del storage en segundo plano
        if (product.images_urls) {
          for (const url of product.images_urls) {
            deleteImage(url, 'product-images').catch(console.error);
          }
        }
        toast({
          title: "✅ Producto eliminado",
          description: "El producto se ha eliminado correctamente.",
        });
      } else {
        toast({
          title: "❌ Error",
          description: "No se pudo eliminar el producto.",
          variant: "destructive",
        });
      }
    }
  };

  const toggleStatus = async (product: any) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    await updateProduct(product.id, { status: newStatus });
    toast({
      title: newStatus === 'active' ? "✅ Producto activado" : "⏸️ Producto desactivado",
      description: `El producto se ha ${newStatus === 'active' ? 'activado' : 'desactivado'} correctamente.`,
    });
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-kozy-warm/30 border-t-kozy-warm rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Gestión de Productos</h2>
          <p className="text-muted-foreground">
            Administra el catálogo de productos
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => handleOpenDialog()}
              className="kozy-gradient text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre del producto"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Categoría</label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del producto"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Precio *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Precio Original</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Stock</label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Rating (Estrellas)</label>
                  <Select value={formData.rating} onValueChange={(value) => setFormData(prev => ({ ...prev, rating: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">⭐ 1 Estrella</SelectItem>
                      <SelectItem value="2">⭐⭐ 2 Estrellas</SelectItem>
                      <SelectItem value="3">⭐⭐⭐ 3 Estrellas</SelectItem>
                      <SelectItem value="4">⭐⭐⭐⭐ 4 Estrellas</SelectItem>
                      <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Estrellas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Número de Reseñas</label>
                  <Input
                    type="number"
                    value={formData.reviews_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, reviews_count: e.target.value }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Descuento (%)</label>
                  <Input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Imágenes del Producto</label>
                <ImageUploadPreview
                  files={imageFiles}
                  onFilesChange={setImageFiles}
                  maxFiles={5}
                />
                
                {editingProduct?.images_urls && editingProduct.images_urls.length > 0 && !imageFiles && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Imágenes actuales:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {editingProduct.images_urls.map((url: string, index: number) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden">
                          <LazyImage
                            src={url}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_new"
                    checked={formData.is_new}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_new: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="is_new" className="text-sm font-medium">
                    Producto nuevo
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_on_sale"
                    checked={formData.is_on_sale}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_on_sale: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="is_on_sale" className="text-sm font-medium">
                    En oferta
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 kozy-gradient text-white hover:opacity-90"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    </div>
                  ) : (
                    editingProduct ? 'Actualizar Producto' : 'Crear Producto'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.images_urls && product.images_urls.length > 0 ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <LazyImage
                        src={product.images_urls[0]}
                        alt={product.name}
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Image className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  {(product as any).categories?.name || 'Sin categoría'}
                </TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>
                  {renderStarRating(product.rating || 0)}
                </TableCell>
                <TableCell>{product.stock || 0}</TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleStatus(product)}
                    >
                      {product.status === 'active' ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenDialog(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(product)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {products.length === 0 && (
          <div className="p-8 text-center">
            <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hay productos
            </h3>
            <p className="text-muted-foreground">
              Crea tu primer producto para comenzar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsManager;
