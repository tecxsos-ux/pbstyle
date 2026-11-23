'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const FALLBACK_HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBwNQ1qvT8pN4BHlHMAnesDlNwFzWVc5C4MCgMKvjG6Dgi0wINdiMz6xIKg0pghaC970is5ojjKQBwOXo-XPzDwD5pM_u1CCdycEwwLT5D9oQasqR_VtBLpo7hKvEGdUPmTXLS_p7L_7hW6syTQ8B0FWOLJARlFNI--4EtFtRScQzSf_rYSG6do9C_qxEgjjpMv6sTxgn7gPepLNq6P5fQ6SexplAfCcLoaBp2UAmEMEaseVIG_orJ9PrUEsJ3f5hP3So0oi8KJXd0';

const DETAIL_INSET_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBTnOF-EQ40OwuZ0ZU27tQmsN-13iuaRYLileGEV_ZUsvB__23n3zRDNNf-qHgdweB6KRm6ck0uGD6SRIwI3pR_ulHsVdfgqC8VkKhdotEjeZA_4G_Bwe0pKZRiEbBlgCu87izJN5spl_cyDJMfoKSHHM9A9dbolPqfVZTKXbByG5tn7TX4vIH0Dj24KCecbPFtwHIOQB1Mz13-2GFR0sZCkLkoEkPPu3DiDsl7LWoCWhe2TQ9OcjK1GIRHtNB47a2wytHhKmvD5gA';

function materialLabel(mat?: string) {
  const m = (mat || '').toLowerCase();
  if (m.includes('platin')) return '950 Platin';
  if (m.includes('titan')) return 'Titan Grade 5';
  if (m.includes('steel') || m.includes('stahl')) return 'Chirurgenstahl 316L';
  return mat || 'Atelier Edition';
}

export default function HeroSlideshow({ products }: { products: Product[] }) {
  const slides = products.slice(0, 5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const count = slides.length;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, 5000);
    return () => clearInterval(timer);
  }, [count, paused]);

  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + count) % count);
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % count);

  const active = slides[currentIndex];
  const activeImage =
    active?.featured_image ||
    (active?.images && active.images[0]?.image_url) ||
    FALLBACK_HERO_IMAGE;

  const nextSlide = count > 1 ? slides[(currentIndex + 1) % count] : null;
  const insetImage =
    nextSlide?.featured_image ||
    (nextSlide?.images && nextSlide.images[0]?.image_url) ||
    DETAIL_INSET_IMAGE;

  return (
    <div
      className="relative pl-4 sm:pl-12 pb-8 sm:pb-12 select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null || count <= 1) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (dx > 40) goPrev();
        else if (dx < -40) goNext();
        touchStartX.current = null;
      }}
    >
      {/* Primary Tall Gallery Frame */}
      <div className="relative aspect-[4/5] max-h-[600px] w-full rounded-lg overflow-hidden border border-border shadow-2xl bg-muted group">
        <img
          key={active?.id ?? 'fallback'}
          src={activeImage}
          alt={active?.title || 'PBSTYLE Kollektion'}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 animate-in fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/30" />

        {/* Top Bar: Progress Indicators & Slide Counter */}
        {count > 0 && (
          <div className="absolute top-4 inset-x-4 flex items-center justify-between gap-3 z-10">
            <div className="flex items-center gap-1.5 flex-1 max-w-[200px]">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Slide ${idx + 1}: ${s.title}`}
                  className="h-1 flex-1 rounded-full overflow-hidden bg-white/30 cursor-pointer"
                >
                  <div
                    className={`h-full transition-all duration-500 ${
                      idx === currentIndex
                        ? 'w-full bg-bronze'
                        : idx < currentIndex
                        ? 'w-full bg-white/75'
                        : 'w-0'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="bronze"
                className="bg-black/65 backdrop-blur-md text-white border-bronze/50 font-mono text-[9px]"
              >
                <Sparkles className="h-2.5 w-2.5 text-bronze" />
                Neuheiten
              </Badge>
              <span className="font-mono text-[10px] text-white/90 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded">
                {String(currentIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
              </span>
            </div>
          </div>
        )}

        {/* Prev / Next Controls */}
        {count > 1 && (
          <div className="absolute top-1/2 -translate-y-1/2 inset-x-3 flex justify-between pointer-events-none z-10">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Vorheriges Produkt"
              className="pointer-events-auto h-9 w-9 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Nächstes Produkt"
              className="pointer-events-auto h-9 w-9 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Floating Live Featured Object Plaque */}
        {active && (
          <Link
            href={`/products/${active.handle}`}
            className="absolute bottom-4 right-4 left-24 sm:left-auto sm:w-72 rounded-md bg-background/92 backdrop-blur-md border border-border/80 p-3.5 shadow-xl hover:border-bronze transition-colors flex items-center justify-between gap-3 group/plaque z-10"
          >
            <div className="min-w-0">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-bronze block">
                {materialLabel(active.material)}
              </span>
              <span className="font-serif text-sm sm:text-base font-medium text-foreground truncate block">
                {active.title}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                CHF {active.base_price.toLocaleString('de-CH')}
              </span>
            </div>
            <span className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 group-hover/plaque:bg-bronze transition-colors">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        )}
      </div>

      {/* Inset Next-Up Preview Frame */}
      <button
        type="button"
        onClick={count > 1 ? goNext : undefined}
        aria-label="Nächstes neues Produkt anzeigen"
        className="absolute bottom-0 left-0 w-32 sm:w-44 aspect-[4/5] p-1.5 rounded-lg bg-card border border-border shadow-2xl z-20 group text-left cursor-pointer hover:border-bronze transition-colors"
      >
        <div className="w-full h-full rounded-md overflow-hidden bg-muted relative">
          <img
            src={insetImage}
            alt={nextSlide?.title || 'PBSTYLE Detail'}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {nextSlide && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <span className="font-mono text-[8px] uppercase tracking-widest text-bronze block">
                Nächstes
              </span>
              <span className="text-[10px] text-white font-serif truncate block">
                {nextSlide.title}
              </span>
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
