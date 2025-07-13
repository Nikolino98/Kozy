
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface ShoppingContextType {
  cartItems: CartItem[];
  favorites: string[];
  products: any[];
  isLoading: boolean;
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleFavorite: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

const ShoppingContext = createContext<ShoppingContextType | undefined>(undefined);

export const ShoppingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { products, isLoading } = useProducts();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Cargar favoritos desde localStorage al inicializar
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToCart = (product: any) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images_urls?.[0] || '/placeholder.svg',
        quantity: 1
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <ShoppingContext.Provider value={{
      cartItems,
      favorites,
      products: products || [],
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      toggleFavorite,
      clearCart,
      getCartTotal,
      getCartItemsCount
    }}>
      {children}
    </ShoppingContext.Provider>
  );
};

export const useShoppingCart = () => {
  const context = useContext(ShoppingContext);
  if (context === undefined) {
    throw new Error('useShoppingCart must be used within a ShoppingProvider');
  }
  return context;
};
