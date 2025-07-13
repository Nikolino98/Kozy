import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { createImagePreview, compressImage } from '@/lib/imageUtils';
import LazyImage from '@/components/ui/LazyImage';

interface ImageUploadPreviewProps {
  files: FileList | null;
  onFilesChange: (files: FileList | null) => void;
  maxFiles?: number;
  className?: string;
}

const ImageUploadPreview = ({
  files,
  onFilesChange,
  maxFiles = 5,
  className = ''
}: ImageUploadPreviewProps) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const fileArray = Array.from(selectedFiles).slice(0, maxFiles);
      const compressedFiles: File[] = [];
      const previewUrls: string[] = [];
      const totalFiles = fileArray.length;

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        // Validar tamaño y tipo de archivo
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} excede el tamaño máximo de 10MB`);
        }

        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} no es un archivo de imagen válido`);
        }

        try {
          // Comprimir imagen
          const compressedFile = await compressImage(file);
          compressedFiles.push(compressedFile);

          // Crear preview
          const previewUrl = await createImagePreview(compressedFile);
          previewUrls.push(previewUrl);

          // Actualizar progreso
          const currentProgress = ((i + 1) / totalFiles) * 100;
          setProgress(currentProgress);
        } catch (error) {
          console.error(`Error procesando ${file.name}:`, error);
          throw new Error(`Error al procesar ${file.name}: ${error.message}`);
        }
      }

      // Crear nuevo FileList con los archivos comprimidos
      const dt = new DataTransfer();
      compressedFiles.forEach(file => dt.items.add(file));
      
      setPreviews(previewUrls);
      onFilesChange(dt.files);
    } catch (error) {
      console.error('Error en la selección de archivos:', error);
      toast({
        variant: "destructive",
        title: "Error al procesar imágenes",
        description: error.message
      });
      
      // Limpiar el input y los previews en caso de error
      e.target.value = '';
      setPreviews([]);
      onFilesChange(null);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const removeFile = (index: number) => {
    if (!files) return;

    const dt = new DataTransfer();
    Array.from(files).forEach((file, i) => {
      if (i !== index) dt.items.add(file);
    });

    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onFilesChange(dt.files.length > 0 ? dt.files : null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-kozy-warm/50 transition-colors">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
          disabled={isProcessing}
        />
        
        <label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          <div className="w-12 h-12 bg-kozy-warm/10 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-kozy-warm" />
          </div>
          
          <div>
            <p className="text-sm font-medium text-foreground">
              Subir imágenes
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG hasta 10MB cada una (máx. {maxFiles})
            </p>
          </div>
        </label>
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Procesando imágenes...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <LazyImage
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full"
                />
              </div>
              
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="w-3 h-3" />
              </Button>
              
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {files?.[index]?.size ? (files[index].size / 1024 / 1024).toFixed(1) + 'MB' : 'Procesando...'}
              </div>
            </div>
          ))}
        </div>
      )}

      {files && files.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {files.length} imagen{files.length > 1 ? 'es' : ''} seleccionada{files.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default ImageUploadPreview;
