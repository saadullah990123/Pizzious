'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number, customizations?: Record<string, any>) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'pizzious_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load initial cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to storage', e);
      }
    }
  }, [items, isHydrated]);

  const addItem = (item: MenuItem, quantity: number = 1, customizations?: Record<string, any>) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.menuItem.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (customizations) {
          updated[existingIndex].customizations = {
            ...updated[existingIndex].customizations,
            ...customizations,
          };
        }
        return updated;
      }
      return [...prev, { menuItem: item, quantity, customizations }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (itemId: number) => {
    setItems((prev) => prev.filter((i) => i.menuItem.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.menuItem.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => {
    const unitPrice =
      item.menuItem.salePrice && item.menuItem.salePrice > 0 && item.menuItem.salePrice < item.menuItem.price
        ? item.menuItem.salePrice
        : item.menuItem.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};