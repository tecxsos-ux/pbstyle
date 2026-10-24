'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeItem, isLoading } = useCart();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 150;
  const progressPercent = Math.min(100, Math.round((cart.subtotal / freeShippingThreshold) * 100));
  const diffToFree = freeShippingThreshold - cart.subtotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface border-l border-outline-variant/30 flex flex-col justify-between shadow-2xl animate-slide-left">
          
          {/* Header */}
          <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[22px]">shopping_bag</span>
              <h2 className="font-serif text-xl tracking-tight text-on-surface">Warenkorb</h2>
              <span className="text-xs uppercase tracking-widest text-on-surface-variant font-sans">
                ({cart.item_count} {cart.item_count === 1 ? 'Objekt' : 'Objekte'})
              </span>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              close
            </button>
          </div>

          {/* Shipping Free Progress */}
          <div className="px-6 py-4 bg-surface-container-low/60 border-b border-outline-variant/10 text-xs font-sans">
            {diffToFree > 0 ? (
              <p className="text-on-surface-variant mb-2">
                Noch <span className="font-semibold text-primary">CHF {diffToFree.toFixed(2)}</span> für kostenlosen Schweizer Kurierversand
              </p>
            ) : (
              <p className="text-primary font-semibold flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Kostenloser Schweizer Kurierversand qualifiziert!
              </p>
            )}
            <div className="w-full bg-outline-variant/20 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-500 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <span className="material-symbols-outlined text-5xl text-outline-variant/50">inventory_2</span>
                <p className="font-serif text-lg text-on-surface">Ihr Tresor ist noch leer</p>
                <p className="text-sm text-on-surface-variant max-w-xs font-sans">
                  Entdecken Sie unsere Kollektion aus 950er Platin und Schweizer Chirurgenstahl.
                </p>
                <Link
                  href="/catalog"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-6 py-3 bg-primary text-on-primary text-xs uppercase tracking-widest font-sans hover:opacity-90 transition-opacity inline-block"
                >
                  Kollektion durchstöbern
                </Link>
              </div>
            ) : (
              cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-6 border-b border-outline-variant/10">
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-surface-container-low flex-shrink-0 overflow-hidden relative border border-outline-variant/20">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.product_title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined">image</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link 
                          href={`/products/${item.product_handle}`}
                          onClick={() => setIsCartOpen(false)}
                          className="font-serif text-base text-on-surface hover:text-primary transition-colors leading-tight"
                        >
                          {item.product_title}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="material-symbols-outlined text-on-surface-variant/60 hover:text-primary transition-colors text-[18px]"
                          title="Entfernen"
                        >
                          delete
                        </button>
                      </div>
                      {item.variant_title && (
                        <p className="text-xs text-on-surface-variant font-sans mt-0.5">{item.variant_title}</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-outline-variant/30 text-xs">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="px-2.5 py-1 text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                          disabled={isLoading}
                        >
                          -
                        </button>
                        <span className="px-3 font-mono font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                          disabled={isLoading}
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <span className="font-serif text-base text-primary font-medium">
                        CHF {item.total_price.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/20 space-y-4">
              <div className="flex justify-between items-baseline font-sans text-sm">
                <span className="text-on-surface-variant uppercase tracking-widest text-xs">Zwischensumme</span>
                <span className="font-serif text-xl text-on-surface font-semibold">
                  CHF {cart.subtotal.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant/70 font-sans">
                Inklusive Schweizer Mehrwertsteuer. Zölle und Versandkosten werden an der Kasse berechnet.
              </p>
              
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-4 bg-on-background text-background flex items-center justify-center gap-3 font-sans text-xs uppercase tracking-widest hover:bg-primary transition-colors active:scale-[0.99] shadow-lg"
              >
                <span>Sicher zur Kasse</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>

              <div className="pt-2 flex items-center justify-center gap-4 text-[10px] uppercase tracking-wider text-on-surface-variant font-sans">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-primary">lock</span>
                  SSL Verschlüsselt
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-primary">local_shipping</span>
                  Schweiz Kurier Frei
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
