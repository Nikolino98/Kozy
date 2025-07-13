
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
type ProductUpdate = Partial<ProductInsert>;

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching products');
    } finally {
      setIsLoading(false);
    }
  };

  const createProduct = async (product: ProductInsert): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      
      await fetchProducts(); // Refresh to get category info
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating product');
      return null;
    }
  };

  const updateProduct = async (id: string, updates: ProductUpdate): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchProducts(); // Refresh to get category info
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating product');
      return null;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProducts(prev => prev.filter(prod => prod.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting product');
      return false;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
};
