
import { supabase } from '@/integrations/supabase/client';
import { compressImage } from './imageUtils';

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
  maxRetries?: number;
}

export interface UploadResult {
  url: string;
  path: string;
  size: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

const DEFAULT_OPTIONS: Required<UploadOptions> = {
  bucket: 'product-images',
  folder: 'uploads',
  maxSizeMB: 2,
  quality: 0.8,
  format: 'webp',
  maxRetries: 3
};

// Generate unique filename
const generateFileName = (originalName: string, format: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const nameWithoutExt = originalName.split('.')[0];
  return `${nameWithoutExt}_${timestamp}_${random}.${format}`;
};

// Single file upload with compression and retries
export const uploadFile = async (
  file: File,
  options: UploadOptions = {},
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  // Compress image with correct parameters
  const compressedFile = await compressImage(
    file,
    800, // maxWidth
    600, // maxHeight
    config.quality
  );

  const fileName = generateFileName(file.name, config.format);
  const filePath = `${config.folder}/${fileName}`;

  let lastError: Error | null = null;

  // Retry logic
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const { data, error } = await supabase.storage
        .from(config.bucket)
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(config.bucket)
        .getPublicUrl(data.path);

      // Simulate progress for UI feedback
      if (onProgress) {
        onProgress({ loaded: compressedFile.size, total: compressedFile.size, percentage: 100 });
      }

      return {
        url: urlData.publicUrl,
        path: data.path,
        size: compressedFile.size
      };
    } catch (error) {
      lastError = error as Error;
      console.warn(`Upload attempt ${attempt} failed:`, error);
      
      if (attempt < config.maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw new Error(`Upload failed after ${config.maxRetries} attempts: ${lastError?.message}`);
};

// Single image upload (for categories)
export const uploadImage = async (
  file: File,
  bucket: string = 'product-images'
): Promise<string> => {
  const result = await uploadFile(file, { bucket });
  return result.url;
};

// Multiple images upload (for products)
export const uploadMultipleImages = async (
  files: File[],
  bucket: string = 'product-images',
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> => {
  const results = await uploadFiles(
    files,
    { bucket },
    (fileIndex, progress) => {
      if (onProgress && progress.percentage === 100) {
        onProgress(fileIndex + 1, files.length);
      }
    }
  );
  return results.map(result => result.url);
};

// Batch upload with concurrency control
export const uploadFiles = async (
  files: File[],
  options: UploadOptions = {},
  onProgress?: (fileIndex: number, progress: UploadProgress) => void,
  maxConcurrency: number = 3
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];
  const errors: { index: number; error: Error }[] = [];

  // Process files in batches
  for (let i = 0; i < files.length; i += maxConcurrency) {
    const batch = files.slice(i, i + maxConcurrency);
    const batchPromises = batch.map(async (file, batchIndex) => {
      const fileIndex = i + batchIndex;
      try {
        const result = await uploadFile(
          file,
          options,
          (progress) => onProgress?.(fileIndex, progress)
        );
        return { index: fileIndex, result };
      } catch (error) {
        errors.push({ index: fileIndex, error: error as Error });
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    
    // Collect successful results
    batchResults.forEach((item) => {
      if (item) {
        results[item.index] = item.result;
      }
    });
  }

  // Throw error if any uploads failed
  if (errors.length > 0) {
    const errorMessage = errors.map(e => `File ${e.index}: ${e.error.message}`).join('; ');
    throw new Error(`Some uploads failed: ${errorMessage}`);
  }

  return results;
};

// Delete file from storage
export const deleteFile = async (
  path: string,
  bucket: string = 'product-images'
): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

// Delete image by URL (extract path from URL)
export const deleteImage = async (
  url: string,
  bucket: string = 'product-images'
): Promise<void> => {
  try {
    // Extract path from Supabase URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === bucket);
    
    if (bucketIndex === -1) {
      console.warn('Could not extract path from URL:', url);
      return;
    }
    
    const filePath = pathParts.slice(bucketIndex + 1).join('/');
    await deleteFile(filePath, bucket);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Get optimized image URL - Supabase Storage doesn't support transformations
export const getOptimizedImageUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string => {
  // Simply return the original URL as Supabase Storage doesn't support image transformations
  return url || '';
};

// Preload images for better UX
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

// Batch preload images
export const preloadImages = async (urls: string[]): Promise<void> => {
  await Promise.all(urls.map(preloadImage));
};
