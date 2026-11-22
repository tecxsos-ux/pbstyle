'use client';

import React from 'react';
import Link from 'next/link';
import { Package, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const featuredImage = product.featured_image || (product.images && product.images[0]?.image_url);

  const materialLabel = (mat: string) => {
    const m = mat.toLowerCase();
    if (m.includes('platin')) return '950 Platin';
    if (m.includes('titan')) return 'Titan Grade 5';
    if (m.includes('steel') || m.includes('stahl')) return 'Chirurgenstahl 316L';
    return mat;
  };

  return (
    <Card className="group overflow-hidden border-border/80 bg-card transition-all duration-300 hover:border-bronze/50 hover:shadow-lg flex flex-col justify-between">
      {/* Image Viewport */}
      <div className="relative aspect-[4/5] bg-muted overflow-hidden">
        <Link href={`/products/${product.handle}`} className="block w-full h-full">
          {featuredImage ? (
            <img
              src={featuredImage}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Package className="h-10 w-10" />
            </div>
          )}
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.material && (
            <Badge
              variant="secondary"
              className="bg-background/85 backdrop-blur-md text-foreground border-border/60"
            >
              {materialLabel(product.material)}
            </Badge>
          )}
          {product.is_new && (
            <Badge variant="bronze" className="bg-background/90 backdrop-blur-md">
              Neuheit
            </Badge>
          )}
        </div>

        {/* Hover Quick Actions */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <Button variant="default" size="sm" className="flex-1 bg-background/95 text-foreground hover:bg-primary hover:text-primary-foreground backdrop-blur-md border border-border/60" asChild>
            <Link href={`/products/${product.handle}`}>
              Details
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            variant="bronze"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => addToCart(product.id, undefined, 1)}
            aria-label="In den Warenkorb"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Info Footer */}
      <div className="p-4 flex justify-between items-start gap-3">
        <div className="min-w-0">
          <Link href={`/products/${product.handle}`}>
            <h3 className="font-serif text-lg text-foreground group-hover:text-bronze transition-colors leading-snug truncate">
              {product.title}
            </h3>
          </Link>
          {product.subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {product.subtitle}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className="font-mono text-sm font-semibold text-foreground block">
            CHF {product.base_price.toLocaleString('de-CH')}
          </span>
          {product.compare_at_price && (
            <span className="font-mono text-[11px] text-muted-foreground line-through">
              CHF {product.compare_at_price.toLocaleString('de-CH')}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
