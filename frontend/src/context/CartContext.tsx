'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartSummary } from '@/lib/types';
import { fetchCart, addToCartApi, updateCartItemApi, removeCartItemApi, clearCart } from '@/lib/api';

interface CartContextType {
  cart: CartSummary;
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toastMessage: string | null;
  addToCart: (productId: number, variantId?: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearUserCart: () => Promise<void>;
}

const defaultCart: CartSummary = {
  session_id: '',
  items: [],
  item_count: 0,
  subtotal: 0,
  currency: 'CHF',
};

const CartContext = createContext<CartContextType>({
  cart: defaultCart,
  isLoading: false,
  isCartOpen: false,
  setIsCartOpen: () => {},
  toastMessage: null,
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeItem: async () => {},
  clearUserCart: async () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartSummary>(defaultCart);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize session ID
  useEffect(() => {
    let sid = localStorage.getItem('pbstyle_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('pbstyle_session_id', sid);
    }
    setSessionId(sid);
    loadCart(sid);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadCart = async (sid: string) => {
    setIsLoading(true);
    try {
      const data = await fetchCart(sid);
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: number, variantId?: number, quantity: number = 1) => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const updated = await addToCartApi(sessionId, productId, variantId, quantity);
      setCart(updated);
      setIsCartOpen(true);
      showToast('Objekt erfolgreich zum Warenkorb hinzugefügt');
    } catch (err) {
      console.error('Failed to add to cart', err);
      showToast('Fehler beim Hinzufügen zum Warenkorb');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    setIsLoading(true);
    try {
      const updated = await updateCartItemApi(itemId, quantity);
      setCart(updated);
    } catch (err) {
      console.error('Failed to update quantity', err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    setIsLoading(true);
    try {
      const updated = await removeCartItemApi(itemId);
      setCart(updated);
      showToast('Objekt aus dem Warenkorb entfernt');
    } catch (err) {
      console.error('Failed to remove item', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearUserCart = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const updated = await clearCart(sessionId);
      setCart(updated);
    } catch (err) {
      console.error('Failed to clear cart', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isCartOpen,
        setIsCartOpen,
        toastMessage,
        addToCart,
        updateQuantity,
        removeItem,
        clearUserCart,
      }}
    >
      {children}
      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-6 py-4 shadow-2xl font-sans text-xs uppercase tracking-widest flex items-center gap-3 animate-fade-in border border-outline-variant/30">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
