'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, RotateCcw, SearchX } from 'lucide-react';
import { Product } from '@/lib/types';
import { fetchProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import JsonLd, { generateBreadcrumbSchema } from '@/components/JsonLd';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('search');
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

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

  const resetFilters = () => {
    setSelectedMaterials([]);
    setMaxPrice(5000);
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'all') {
          const catHandle =
            p.category?.handle || (p.category_title ? p.category_title.toLowerCase() : '');
          if (catHandle !== selectedCategory.toLowerCase()) return false;
        }
        if (selectedMaterials.length > 0) {
          const mat = p.material.toLowerCase();
          if (!selectedMaterials.some((m) => mat.includes(m.toLowerCase()))) return false;
        }
        if (p.base_price > maxPrice) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const hay = `${p.title} ${p.subtitle || ''} ${p.material} ${p.description}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.base_price - b.base_price;
        if (sortBy === 'price-desc') return b.base_price - a.base_price;
        if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [products, selectedCategory, selectedMaterials, maxPrice, searchQuery, sortBy]);

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

  const hasActiveFilters =
    selectedMaterials.length > 0 || maxPrice < 5000 || selectedCategory !== 'all' || searchQuery.trim() !== '';

  const FilterControls = () => (
    <div className="space-y-7">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="catalog-search">Suche</Label>
        <div className="relative">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            id="catalog-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ring, Pinzette, Platin..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      <Separator />

      {/* Materials */}
      <div className="space-y-3">
        <Label>Material</Label>
        <div className="space-y-3 pt-1">
          {materials.map((m) => (
            <div key={m.value} className="flex items-center space-x-2.5">
              <Checkbox
                id={`mat-${m.value}`}
                checked={selectedMaterials.includes(m.value)}
                onCheckedChange={() => handleMaterialToggle(m.value)}
              />
              <label
                htmlFor={`mat-${m.value}`}
                className="text-xs text-foreground cursor-pointer select-none"
              >
                {m.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Slider */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Preisgrenze</Label>
          <span className="font-mono text-xs font-semibold text-bronze">
            CHF {maxPrice.toLocaleString('de-CH')}
          </span>
        </div>
        <Slider
          min={50}
          max={5000}
          step={50}
          value={[maxPrice]}
          onValueChange={(v) => setMaxPrice(v[0])}
        />
        <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>CHF 50</span>
          <span>CHF 5&apos;000</span>
        </div>
      </div>

      {hasActiveFilters && (
        <>
          <Separator />
          <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">
            <RotateCcw className="h-3.5 w-3.5" />
            Filter zurücksetzen
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="pb-24">
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
      <header className="pt-14 pb-10 border-b border-border bg-card/50">
        <div className="max-w-container-max mx-auto px-4 md:px-10 text-center space-y-5">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-bronze block">
            Tresor-Kollektion
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-foreground">
            {categories.find((c) => c.handle === selectedCategory)?.title || 'Alle Objekte'}
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Präzisionsgefertigte Schmuckstücke und kosmetische Instrumente aus beständigen Edelmetallen für dauerhaften Wert.
          </p>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {categories.map((c) => {
              const active = selectedCategory === c.handle;
              return (
                <Button
                  key={c.handle}
                  size="sm"
                  variant={active ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(c.handle)}
                >
                  {c.title}
                </Button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-container-max mx-auto px-4 md:px-10 flex flex-col lg:flex-row gap-10 py-12">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <Card className="p-6 sticky top-28">
            <FilterControls />
          </Card>
        </aside>

        {/* Grid Area */}
        <div className="flex-1 space-y-8">
          <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-border">
            <span className="font-mono text-xs text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Objekt' : 'Objekte'}
            </span>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Sheet */}
              <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filter
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                  <SheetHeader className="mb-6">
                    <SheetTitle>Filter & Optionen</SheetTitle>
                  </SheetHeader>
                  <FilterControls />
                  <Button
                    className="w-full mt-6"
                    onClick={() => setIsMobileFilterOpen(false)}
                  >
                    Ergebnisse anzeigen ({filteredProducts.length})
                  </Button>
                </SheetContent>
              </Sheet>

              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-52 h-9 text-xs"
                aria-label="Sortieren"
              >
                <option value="featured">Empfohlen</option>
                <option value="price-asc">Preis: niedrig bis hoch</option>
                <option value="price-desc">Preis: hoch bis niedrig</option>
                <option value="title-asc">Alphabetisch: A–Z</option>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="h-[420px] animate-pulse bg-muted/50" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card className="p-16 text-center space-y-4">
              <SearchX className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="font-serif text-2xl">Keine Objekte gefunden</h3>
              <p className="text-xs text-muted-foreground">
                Passen Sie Ihre Material- oder Preisfilter an, um weitere Kreationen zu entdecken.
              </p>
              <Button variant="bronze" size="sm" onClick={resetFilters}>
                Filter zurücksetzen
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="py-32 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Lade Kollektion...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
