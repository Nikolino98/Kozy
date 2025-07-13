
import { supabase } from '@/integrations/supabase/client';

// Upload with retry logic and better error handling
export const uploadImage = async (
  file: File,
  bucket: 'product-images' | 'category-images',
  path?: string
): Promise<string | null> => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const fileName = path || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`;
      
      console.log(`Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) - Attempt ${attempt + 1}`);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '31536000', // 1 year cache
          upsert: false,
          duplex: 'half'
        });

      if (error) {
        console.error(`Upload attempt ${attempt + 1} failed:`, error);
        if (attempt === maxRetries - 1) throw error;
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        continue;
      }

      // Get optimized public URL with transformations
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path, {
          transform: {
            width: 800,
            height: 600,
            resize: 'contain',
            format: 'webp',
            quality: 85
          }
        });

      console.log(`Successfully uploaded: ${fileName}`);
      return urlData.publicUrl;
    } catch (error) {
      console.error(`Upload error on attempt ${attempt + 1}:`, error);
      if (attempt === maxRetries - 1) {
        console.error('Max retries reached, upload failed');
        return null;
      }
      attempt++;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  return null;
};

export const uploadMultipleImages = async (
  files: File[],
  bucket: 'product-images' | 'category-images',
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> => {
  const results: string[] = [];
  
  console.log(`Starting batch upload of ${files.length} images`);
  
  // Upload in parallel with concurrency limit
  const concurrencyLimit = 3;
  const batches: File[][] = [];
  
  for (let i = 0; i < files.length; i += concurrencyLimit) {
    batches.push(files.slice(i, i + concurrencyLimit));
  }
  
  let completed = 0;
  
  for (const batch of batches) {
    const batchPromises = batch.map(async (file) => {
      const url = await uploadImage(file, bucket);
      completed++;
      onProgress?.(completed, files.length);
      return url;
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter(Boolean) as string[]);
  }
  
  console.log(`Batch upload completed: ${results.length}/${files.length} successful`);
  return results;
};

export const deleteImage = async (
  url: string,
  bucket: 'product-images' | 'category-images'
): Promise<boolean> => {
  try {
    // Extract path from URL - handle both old and new URL formats
    const urlParts = url.split('/');
    let fileName = '';
    
    // Find the file path in the URL
    const bucketIndex = urlParts.findIndex(part => part === bucket);
    if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
      fileName = urlParts.slice(bucketIndex + 1).join('/');
    } else {
      // Fallback for older URL format
      fileName = urlParts[urlParts.length - 1].split('?')[0];
    }
    
    console.log(`Deleting file: ${fileName} from bucket: ${bucket}`);
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    console.log(`Successfully deleted: ${fileName}`);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

// Get optimized image URL with transformations
export const getOptimizedImageUrl = (
  bucket: string,
  path: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
): string => {
  const { width = 400, height = 300, quality = 80, format = 'webp' } = options;
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path, {
      transform: {
        width,
        height,
        resize: 'cover',
        format,
        quality
      }
    });
    
  return data.publicUrl;
};
