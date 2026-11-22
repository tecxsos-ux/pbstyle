'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Lock, Minus, Package, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeItem, isLoading } = useCart();

  const freeShippingThreshold = 150;
  const progressPercent = Math.min(100, Math.round((cart.subtotal / freeShippingThreshold) * 100));
  const diffToFree = freeShippingThreshold - cart.subtotal;

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent side="right" className="flex flex-col p-0 sm:max-w-md">
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-bronze" />
            <SheetTitle>Ihr Warenkorb</SheetTitle>
          </div>
          <SheetDescription>
            {cart.item_count} {cart.item_count === 1 ? 'Objekt' : 'Objekte'} im Schweizer Tresor reserviert
          </SheetDescription>
        </SheetHeader>

        {/* Free Shipping Bar */}
        <div className="px-6 py-3.5 bg-muted/50 border-b border-border space-y-2">
          {diffToFree > 0 ? (
            <p className="text-xs text-muted-foreground">
              Noch <span className="font-mono font-semibold text-foreground">CHF {diffToFree.toFixed(2)}</span> für kostenlosen Schweizer Kurierversand
            </p>
          ) : (
            <p className="text-xs text-bronze font-medium flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Kostenloser Schweizer Kurierversand qualifiziert
            </p>
          )}
          <Progress value={progressPercent} />
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-serif text-xl text-foreground">Ihr Tresor ist leer</p>
                <p className="text-xs text-muted-foreground max-w-[240px]">
                  Entdecken Sie unsere Kollektion aus massivem 950er Platin und Chirurgenstahl 316L.
                </p>
              </div>
              <Button variant="bronze" asChild onClick={() => setIsCartOpen(false)}>
                <Link href="/catalog">Kollektion entdecken</Link>
              </Button>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-5 border-b border-border/60 last:border-0">
                <div className="w-20 h-24 rounded-md bg-muted flex-shrink-0 overflow-hidden border border-border">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.product_title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Package className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${item.product_handle}`}
                        onClick={() => setIsCartOpen(false)}
                        className="font-serif text-base text-foreground hover:text-bronze transition-colors line-clamp-1"
                      >
                        {item.product_title}
                      </Link>
                      {item.variant_title && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.variant_title}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeItem(item.id)}
                      aria-label="Entfernen"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <div className="inline-flex items-center rounded-md border border-border bg-background">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={isLoading}
                        className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2.5 font-mono text-xs font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isLoading}
                        className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="font-mono text-sm font-medium text-foreground">
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
          <div className="p-6 bg-muted/30 border-t border-border space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Zwischensumme</span>
                <span className="font-mono text-lg font-semibold text-foreground">
                  CHF {cart.subtotal.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Inklusive 8.1% Schweizer MWST. Versand wird an der Kasse berechnet.
              </p>
            </div>

            <Button size="lg" className="w-full" asChild onClick={() => setIsCartOpen(false)}>
              <Link href="/checkout">
                Sicher zur Kasse
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Separator />

            <div className="flex items-center justify-center gap-5 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-bronze" />
                SSL Verschlüsselt
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="h-3 w-3 text-bronze" />
                Pro Clima Kurier
              </span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
