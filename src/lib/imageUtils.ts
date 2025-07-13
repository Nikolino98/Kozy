
// Image compression and optimization utilities
export const compressImage = async (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.9
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Validar el archivo de entrada
    if (!file || !(file instanceof File)) {
      console.error('Archivo inválido:', file);
      reject(new Error('Archivo inválido'));
      return;
    }

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      console.error('El archivo no es una imagen:', file.type);
      reject(new Error('El archivo debe ser una imagen'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('No se pudo obtener el contexto 2D');
      reject(new Error('Error al procesar la imagen'));
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        const { width: newWidth, height: newHeight } = calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Mantener el formato original del archivo
        const mimeType = file.type || 'image/jpeg';
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: mimeType,
                lastModified: Date.now(),
              });
              console.log(`Compresión exitosa: ${file.name}`);
              console.log(`Tamaño original: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
              console.log(`Tamaño comprimido: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
              resolve(compressedFile);
            } else {
              console.warn(`No se pudo comprimir: ${file.name}, usando original`);
              resolve(file);
            }
          },
          mimeType,
          quality
        );
      } catch (error) {
        console.error('Error al procesar la imagen:', error);
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      console.error(`Error al cargar la imagen: ${file.name}`, error);
      reject(new Error(`Error al cargar la imagen: ${file.name}`));
    };
    
    // Limpiar la URL del objeto cuando ya no se necesite
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
  });
};

const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
) => {
  let { width, height } = { width: originalWidth, height: originalHeight };
  
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }
  
  return { width: Math.round(width), height: Math.round(height) };
};

export const generateImageSizes = async (file: File) => {
  const thumbnail = await compressImage(file, 150, 150, 0.7);
  const medium = await compressImage(file, 400, 300, 0.8);
  const large = await compressImage(file, 800, 600, 0.85);
  
  return { thumbnail, medium, large, original: file };
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
};
