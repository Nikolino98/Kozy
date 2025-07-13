
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Category = Tables<'categories'>;
type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
type CategoryUpdate = Partial<CategoryInsert>;

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching categories');
    } finally {
      setIsLoading(false);
    }
  };

  const createCategory = async (category: CategoryInsert): Promise<Category | null> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      
      setCategories(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating category');
      return null;
    }
  };

  const updateCategory = async (id: string, updates: CategoryUpdate): Promise<Category | null> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setCategories(prev => 
        prev.map(cat => cat.id === id ? data : cat)
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating category');
      return null;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCategories(prev => prev.filter(cat => cat.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting category');
      return false;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};
