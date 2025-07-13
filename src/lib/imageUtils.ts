
// Image compression and optimization utilities
export const compressImage = async (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.9
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
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
    };
    
    img.onerror = () => {
      console.error(`Error al cargar la imagen: ${file.name}`);
      resolve(file);
    };
    
    img.src = URL.createObjectURL(file);
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
