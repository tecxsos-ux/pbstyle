'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
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
      showToast('Objekt zum Warenkorb hinzugefügt');
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
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-md bg-card text-card-foreground border border-bronze/40 px-5 py-3.5 shadow-2xl text-xs font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-bronze shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
