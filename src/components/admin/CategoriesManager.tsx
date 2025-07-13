
import { useState } from 'react';
import { Plus, Edit, Trash2, Image, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCategories } from '@/hooks/useCategories';
import { uploadImage, deleteImage } from '@/lib/storage';
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

const CategoriesManager = () => {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } = useCategories();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', is_active: true });
    setImageFile(null);
    setEditingCategory(null);
  };

  const handleOpenDialog = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        is_active: category.is_active,
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
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = editingCategory?.image_url || null;

      // Subir nueva imagen si se seleccionó
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile, 'category-images');
        if (uploadedUrl) {
          // Eliminar imagen anterior si existe
          if (editingCategory?.image_url) {
            await deleteImage(editingCategory.image_url, 'category-images');
          }
          imageUrl = uploadedUrl;
        }
      }

      const categoryData = {
        ...formData,
        image_url: imageUrl,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
        toast({
          title: "Categoría actualizada",
          description: "La categoría se ha actualizado correctamente.",
        });
      } else {
        await createCategory(categoryData);
        toast({
          title: "Categoría creada",
          description: "La nueva categoría se ha creado correctamente.",
        });
      }

      handleCloseDialog();
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al guardar la categoría.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: any) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      const success = await deleteCategory(category.id);
      if (success) {
        if (category.image_url) {
          await deleteImage(category.image_url, 'category-images');
        }
        toast({
          title: "Categoría eliminada",
          description: "La categoría se ha eliminado correctamente.",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar la categoría.",
          variant: "destructive",
        });
      }
    }
  };

  const toggleStatus = async (category: any) => {
    await updateCategory(category.id, { is_active: !category.is_active });
    toast({
      title: category.is_active ? "Categoría desactivada" : "Categoría activada",
      description: `La categoría se ha ${category.is_active ? 'desactivado' : 'activado'} correctamente.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-kozy-warm/30 border-t-kozy-warm rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Gestión de Categorías</h2>
          <p className="text-muted-foreground">
            Administra las categorías de productos
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => handleOpenDialog()}
              className="kozy-gradient text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre de la categoría"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción de la categoría"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Imagen</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {editingCategory?.image_url && !imageFile && (
                  <div className="mt-2">
                    <img
                      src={editingCategory.image_url}
                      alt="Imagen actual"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Categoría activa
                </label>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 kozy-gradient text-white"
                >
                  {isSubmitting ? 'Guardando...' : (editingCategory ? 'Actualizar' : 'Crear')}
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
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Image className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {category.description || 'Sin descripción'}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    category.is_active 
                      ? 'bg-kozy-green/10 text-kozy-green'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(category.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleStatus(category)}
                    >
                      {category.is_active ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenDialog(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(category)}
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
        
        {categories.length === 0 && (
          <div className="p-8 text-center">
            <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hay categorías
            </h3>
            <p className="text-muted-foreground">
              Crea tu primera categoría para comenzar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesManager;
