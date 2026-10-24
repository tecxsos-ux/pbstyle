'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const featuredImage = product.featured_image || (product.images && product.images[0]?.image_url);

  const materialLabel = (mat: string) => {
    switch (mat.toLowerCase()) {
      case 'platinum': return '950 Platin';
      case 'brushed steel': return 'Chirurgenstahl 316L';
      case 'titanium': return 'Titan Grade 5';
      default: return mat;
    }
  };

  return (
    <div className="product-item group flex flex-col justify-between">
      {/* Image Container */}
      <div className="relative aspect-[4/5] bg-surface-container-low overflow-hidden mb-6 border border-outline-variant/15">
        {featuredImage ? (
          <img
            src={featuredImage}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl">inventory_2</span>
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-inverse-surface/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Link
            href={`/products/${product.handle}`}
            className="bg-surface px-6 py-3 font-sans text-xs uppercase tracking-widest text-on-surface shadow-xl translate-y-3 group-hover:translate-y-0 transition-transform duration-300 hover:bg-primary hover:text-on-primary"
          >
            Details ansehen
          </Link>
          <button
            onClick={() => addToCart(product.id, undefined, 1)}
            aria-label="Schnell in den Warenkorb"
            className="bg-surface p-3 text-on-surface shadow-xl translate-y-3 group-hover:translate-y-0 transition-transform duration-300 hover:bg-primary hover:text-on-primary flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_bag</span>
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.is_new && (
            <span className="bg-surface/90 backdrop-blur-md px-3 py-1 font-sans text-[10px] uppercase tracking-widest text-primary border border-outline-variant/30">
              Neuheit
            </span>
          )}
          {product.material && (
            <span className="bg-surface/90 backdrop-blur-md px-2.5 py-0.5 font-sans text-[9px] uppercase tracking-widest text-on-surface-variant border border-outline-variant/20">
              {materialLabel(product.material)}
            </span>
          )}
        </div>
      </div>

      {/* Info Container */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <Link href={`/products/${product.handle}`}>
            <h3 className="font-serif text-lg text-on-surface group-hover:text-primary transition-colors leading-tight">
              {product.title}
            </h3>
          </Link>
          {product.subtitle && (
            <p className="font-sans text-xs text-on-surface-variant mt-1 line-clamp-1">
              {product.subtitle}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <span className="font-serif text-base text-primary font-medium block">
            CHF {product.base_price.toLocaleString('de-CH')}
          </span>
          {product.compare_at_price && (
            <span className="font-sans text-xs text-on-surface-variant/60 line-through">
              CHF {product.compare_at_price.toLocaleString('de-CH')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
