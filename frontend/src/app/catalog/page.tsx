'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/lib/types';
import { fetchProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import JsonLd, { generateBreadcrumbSchema } from '@/components/JsonLd';

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync with URL query parameter
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Load products
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleMaterialToggle = (material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material) ? prev.filter((m) => m !== material) : [...prev, material]
    );
  };

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const catHandle = p.category?.handle || (p.category_title ? p.category_title.toLowerCase() : '');
        if (catHandle !== selectedCategory.toLowerCase()) return false;
      }

      // Material filter
      if (selectedMaterials.length > 0) {
        const mat = p.material.toLowerCase();
        if (!selectedMaterials.some((m) => mat.includes(m.toLowerCase()))) {
          return false;
        }
      }

      // Price filter
      if (p.base_price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.base_price - b.base_price;
      if (sortBy === 'price-desc') return b.base_price - a.base_price;
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [products, selectedCategory, selectedMaterials, maxPrice, sortBy]);

  const categories = [
    { title: 'Alle Objekte', handle: 'all' },
    { title: 'Schmuck', handle: 'schmuck' },
    { title: 'Beauty-Tools', handle: 'beauty-tools' },
    { title: 'Neuheiten', handle: 'neuheiten' },
  ];

  const materials = [
    { label: '950 Platin', value: 'platinum' },
    { label: 'Chirurgenstahl 316L', value: 'brushed steel' },
    { label: 'Titan Grade 5', value: 'titanium' },
  ];

  return (
    <div className="bg-background text-on-surface pb-28">
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: 'Home', url: 'https://pbstyle.ch' },
          { name: 'Katalog', url: 'https://pbstyle.ch/catalog' },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: products.map((p, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: `https://pbstyle.ch/products/${p.handle}`,
            name: p.title,
          })),
        }}
      />

      {/* Header */}
      <header className="pt-16 pb-12 bg-surface-container-low/50 border-b border-outline-variant/15">
        <div className="max-w-container-max mx-auto px-4 md:px-12 text-center space-y-6">
          <span className="font-sans text-xs uppercase text-primary tracking-[0.25em] block">
            Tresor-Kollektion
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-on-surface leading-tight">
            {categories.find((c) => c.handle === selectedCategory)?.title || 'Alle Objekte'}
          </h1>
          <p className="font-sans text-sm text-on-surface-variant max-w-xl mx-auto leading-relaxed">
            Ein Katalog präzisionsgefertigter Schmuckstücke und kosmetischer Instrumente, hergestellt aus beständigen Edelmetallen für dauerhaften Wert.
          </p>

          {/* Quick Collection Links */}
          <div className="flex flex-wrap justify-center gap-x-6 md:gap-x-10 gap-y-3 pt-4 font-sans text-xs uppercase tracking-widest">
            {categories.map((c) => {
              const active = selectedCategory === c.handle;
              return (
                <button
                  key={c.handle}
                  onClick={() => setSelectedCategory(c.handle)}
                  className={`pb-1 transition-colors ${
                    active
                      ? 'text-primary border-b border-primary font-bold'
                      : 'text-on-surface-variant/70 hover:text-primary'
                  }`}
                >
                  {c.title}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Grid & Filters */}
      <div className="max-w-container-max mx-auto px-4 md:px-12 flex flex-col lg:flex-row gap-12 py-16">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28 h-fit border-r border-outline-variant/20 pr-8 space-y-10">
          
          {/* Material Filter */}
          <div>
            <h3 className="font-sans text-xs uppercase tracking-widest mb-5 text-on-surface font-semibold">
              Material
            </h3>
            <div className="space-y-3 font-sans text-xs">
              {materials.map((m) => (
                <label key={m.value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedMaterials.includes(m.value)}
                    onChange={() => handleMaterialToggle(m.value)}
                    className="w-4 h-4 rounded-none accent-primary border-outline-variant focus:ring-0 bg-transparent"
                  />
                  <span className="text-on-surface-variant group-hover:text-primary transition-colors">
                    {m.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <h3 className="font-sans text-xs uppercase tracking-widest mb-5 text-on-surface font-semibold">
              Preisgrenze
            </h3>
            <div className="space-y-3 font-sans">
              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-outline-variant/30 appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span>CHF 50</span>
                <span className="text-primary font-medium">CHF {maxPrice.toLocaleString('de-CH')}</span>
              </div>
            </div>
          </div>

          {/* Reset Filters */}
          {(selectedMaterials.length > 0 || maxPrice < 5000 || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSelectedMaterials([]);
                setMaxPrice(5000);
                setSelectedCategory('all');
              }}
              className="text-xs uppercase tracking-widest text-primary border-b border-primary/40 pb-0.5 hover:border-primary transition-colors font-sans"
            >
              Filter zurücksetzen
            </button>
          )}

        </aside>

        {/* Products Grid Content */}
        <div className="flex-1">
          {/* Top Bar with Count & Sort */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-outline-variant/15 font-sans">
            <span className="text-xs uppercase tracking-widest text-on-surface-variant">
              Zeige {filteredProducts.length} {filteredProducts.length === 1 ? 'Objekt' : 'Objekte'}
            </span>

            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-xs uppercase tracking-widest text-on-surface-variant">
                Sortieren nach:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border border-outline-variant/30 py-2 px-3 text-xs uppercase tracking-wider text-on-surface focus:outline-none focus:border-primary cursor-pointer font-sans"
              >
                <option value="featured">Ausgewählt</option>
                <option value="price-asc">Preis: niedrig bis hoch</option>
                <option value="price-desc">Preis: hoch bis niedrig</option>
                <option value="title-asc">Alphabetisch: A-Z</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="py-24 text-center text-on-surface-variant font-sans text-xs uppercase tracking-widest">
              Lade Kollektion...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-24 text-center space-y-4">
              <span className="material-symbols-outlined text-4xl text-outline-variant/60">search_off</span>
              <p className="font-serif text-xl">Keine Objekte für diese Filterkombination gefunden</p>
              <button
                onClick={() => {
                  setSelectedMaterials([]);
                  setMaxPrice(5000);
                  setSelectedCategory('all');
                }}
                className="mt-2 px-6 py-2.5 bg-primary text-on-primary text-xs uppercase tracking-widest font-sans"
              >
                Filter zurücksetzen
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filter Floating Trigger Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 lg:hidden">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 bg-on-background text-background px-6 py-3.5 shadow-2xl font-sans text-xs uppercase tracking-widest active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          <span>Filtern & Sortieren</span>
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 max-h-[80vh] bg-surface rounded-t-2xl p-6 overflow-y-auto space-y-8 border-t border-outline-variant/30">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
              <span className="font-serif text-lg">Filter & Optionen</span>
              <button onClick={() => setIsMobileFilterOpen(false)} className="material-symbols-outlined">
                close
              </button>
            </div>

            {/* Material */}
            <div>
              <h4 className="font-sans text-xs uppercase tracking-widest mb-3 font-semibold">Material</h4>
              <div className="space-y-2">
                {materials.map((m) => (
                  <label key={m.value} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(m.value)}
                      onChange={() => handleMaterialToggle(m.value)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="font-sans text-xs">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <div className="flex justify-between font-sans text-xs mb-2">
                <span>Maximaler Preis</span>
                <span className="text-primary font-medium">CHF {maxPrice.toLocaleString('de-CH')}</span>
              </div>
              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-outline-variant accent-primary"
              />
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-4 bg-primary text-on-primary font-sans text-xs uppercase tracking-widest"
            >
              Ergebnisse anzeigen ({filteredProducts.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="py-32 text-center font-sans text-xs uppercase tracking-widest text-on-surface-variant">
        Lade Kollektion...
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}

