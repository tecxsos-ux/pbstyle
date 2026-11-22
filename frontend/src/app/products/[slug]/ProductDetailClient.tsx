'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { Product, ProductVariant } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { formatMaterialLabel } from '@/components/JsonLd';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useCart();

  const allImages =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.image_url)
      : [product.featured_image || ''];

  const [activeImage, setActiveImage] = useState<string>(allImages[0]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Reviews
  const [reviews, setReviews] = useState(product.reviews || []);
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const currentPrice = product.base_price + (selectedVariant ? selectedVariant.price_offset : 0);
  const materialLabel = formatMaterialLabel(product.material);
  const isPlatinum = product.material.toLowerCase().includes('platin');

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(product.id, selectedVariant?.id, quantity);
    setIsAdding(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !reviewTitle || !comment) return;

    try {
      const res = await fetch(`/api/v1/products/${product.handle}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, rating, title: reviewTitle, comment }),
      });
      if (res.ok) {
        const newRev = await res.json();
        setReviews([newRev, ...reviews]);
        setReviewSuccess(true);
        setAuthor('');
        setReviewTitle('');
        setComment('');
      }
    } catch (err) {
      console.error('Failed to submit review', err);
    }
  };

  const faqs = [
    {
      q: `Aus welchem Werkstoff besteht ${product.title}?`,
      a: isPlatinum
        ? `${product.title} besteht aus massivem 950er Platin (Pt 950, legiert mit 5% Ruthenium). Mit einer Dichte von 21.45 g/cm³ ist das Edelmetall absolut hypoallergen und läuft niemals an.`
        : `${product.title} wird aus medizinischem Chirurgenstahl (DIN 316L) oder Titan Grade 5 gefertigt. Durch elektrochemische Passivierung entsteht höchste Biokompatibilität.`,
    },
    {
      q: 'Welche Schweizer Fertigungsstandards werden angewendet?',
      a: 'Jedes Werkstück wird mit ±0.01 mm Toleranz auf 5-Achs-CNC-Präzisionsfräsen bearbeitet, einzeln mikrometrisch geprüft und von Hand im Atelier Zürich veredelt.',
    },
    {
      q: 'Wie sind Garantie und Pflegeservice geregelt?',
      a: 'PBSTYLE gewährt eine lebenslange Ateliergarantie auf Materialgefüge und Fertigungspräzision sowie eine kostenfreie jährliche Ultraschallreinigung.',
    },
    {
      q: 'Wie schnell erfolgt der Versand in der Schweiz und im DACH-Raum?',
      a: 'Innerhalb der Schweiz versenden wir ab CHF 150 kostenlos und versichert per Schweizer Post «Pro Clima» in 1–2 Werktagen. Lieferungen nach DE und AT erfolgen verzollt (DDP) in 2–4 Werktagen.',
    },
  ];

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-10 space-y-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-foreground transition-colors">
          Kollektion
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{product.title}</span>
      </nav>

      {/* Product Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="relative aspect-[4/5] overflow-hidden bg-muted group">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Package className="h-12 w-12" />
              </div>
            )}
            <Badge
              variant="secondary"
              className="absolute top-4 left-4 bg-background/90 backdrop-blur-md"
            >
              {materialLabel}
            </Badge>
          </Card>

          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-24 rounded-md overflow-hidden border transition-all shrink-0 ${
                    activeImage === img
                      ? 'border-bronze ring-2 ring-bronze/40'
                      : 'border-border hover:border-bronze/50'
                  }`}
                >
                  <img src={img} alt={`Ansicht ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Details */}
        <div className="lg:col-span-5 space-y-7 lg:sticky lg:top-28">
          <div className="space-y-3">
            <Badge variant="bronze">Schweizer Manufaktur-Objekt</Badge>
            <h1 className="font-serif text-3xl md:text-5xl text-foreground leading-tight">
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="text-sm text-muted-foreground">{product.subtitle}</p>
            )}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="font-mono text-2xl font-semibold text-foreground">
                CHF {currentPrice.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
              </span>
              {product.compare_at_price && (
                <span className="font-mono text-sm text-muted-foreground line-through">
                  CHF {product.compare_at_price.toLocaleString('de-CH')}
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">inkl. 8.1% MWST</span>
            </div>
          </div>

          <Separator />

          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <Label>Ausführung / Größe</Label>
              <div className="grid grid-cols-2 gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-md border text-left transition-all ${
                        isSelected
                          ? 'border-bronze bg-bronze/10 text-foreground'
                          : 'border-border bg-card hover:border-bronze/50'
                      }`}
                    >
                      <div className="text-xs font-medium truncate">{v.title}</div>
                      {v.price_offset > 0 && (
                        <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                          + CHF {v.price_offset}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex gap-3 pt-2">
            <div className="inline-flex items-center rounded-md border border-border bg-card">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-12 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Menge verringern"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-3 font-mono text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="h-12 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Menge erhöhen"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={isAdding}>
              <ShoppingBag className="h-4 w-4" />
              {isAdding ? 'Wird hinzugefügt...' : 'In den Warenkorb'}
            </Button>
          </div>

          {/* Trust Bar */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-md bg-muted/50 border border-border flex items-center gap-2.5 text-xs">
              <Truck className="h-4 w-4 text-bronze shrink-0" />
              <span>Kurierversand CH frei</span>
            </div>
            <div className="p-3 rounded-md bg-muted/50 border border-border flex items-center gap-2.5 text-xs">
              <ShieldCheck className="h-4 w-4 text-bronze shrink-0" />
              <span>Lebenslange Garantie</span>
            </div>
          </div>

          {/* Accordion: Specs & Care */}
          <Accordion type="single" collapsible defaultValue="specs" className="w-full">
            <AccordionItem value="specs">
              <AccordionTrigger>Präzision & Spezifikationen</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-xs">
                  {Object.entries(product.specifications || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1.5 border-b border-border/50">
                      <span className="font-medium text-foreground">{key}</span>
                      <span className="font-mono">{String(val)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1.5">
                    <span className="font-medium text-foreground">Zertifizierung</span>
                    <span className="font-mono">
                      {product.certification || 'Swiss Precision ISO 9001'}
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care">
              <AccordionTrigger>Pflege & Werksauffrischung</AccordionTrigger>
              <AccordionContent className="text-xs leading-relaxed">
                {product.care_instructions ||
                  'Zur Reinigung lauwarmes Wasser und ein weiches Mikrofasertuch verwenden. Jährlicher Ultraschall-Service im Zürcher Atelier kostenfrei.'}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Metallurgical Dossier */}
      <Card className="p-6 md:p-10 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-bronze block mb-1">
              Technisches Faktenblatt
            </span>
            <h3 className="font-serif text-2xl md:text-3xl text-foreground">
              Metallurgisches Dossier: {product.title}
            </h3>
          </div>
          <Badge variant="bronze" className="font-mono">
            Swiss Precision ±0.01 mm
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-md bg-muted/40 border border-border space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">
              Materialdichte
            </span>
            <span className="font-mono text-xl font-semibold text-bronze">
              {isPlatinum ? '21.45 g/cm³' : '8.00 g/cm³'}
            </span>
            <p className="text-[11px] text-muted-foreground">{materialLabel}</p>
          </div>
          <div className="p-4 rounded-md bg-muted/40 border border-border space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">
              Toleranz
            </span>
            <span className="font-mono text-xl font-semibold">±0.01 mm</span>
            <p className="text-[11px] text-muted-foreground">5-Achs-CNC Standard</p>
          </div>
          <div className="p-4 rounded-md bg-muted/40 border border-border space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">
              Biokompatibilität
            </span>
            <span className="font-mono text-xl font-semibold">100%</span>
            <p className="text-[11px] text-muted-foreground">DIN EN ISO 10993</p>
          </div>
          <div className="p-4 rounded-md bg-muted/40 border border-border space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">
              Atelier
            </span>
            <span className="font-mono text-xl font-semibold">Zürich, CH</span>
            <p className="text-[11px] text-muted-foreground">Bahnhofstrasse 45</p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Werkstoff</TableHead>
                <TableHead>Dichte (g/cm³)</TableHead>
                <TableHead>Härte (HV)</TableHead>
                <TableHead>Masseverlust</TableHead>
                <TableHead>Biokompatibilität</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              <TableRow className={isPlatinum ? 'bg-bronze/5 font-medium' : ''}>
                <TableCell className="font-medium">950 Platin (Pt 950)</TableCell>
                <TableCell className="font-mono">21.45</TableCell>
                <TableCell className="font-mono">130 HV</TableCell>
                <TableCell className="text-bronze">0% (Dislokation)</TableCell>
                <TableCell>100% Hypoallergen</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>750 Weißgold (18k)</TableCell>
                <TableCell className="font-mono">15.80</TableCell>
                <TableCell className="font-mono">140 HV</TableCell>
                <TableCell className="text-destructive">Materialabrieb</TableCell>
                <TableCell>Rhodium-Beschichtung nötig</TableCell>
              </TableRow>
              <TableRow className={!isPlatinum ? 'bg-bronze/5 font-medium' : ''}>
                <TableCell className="font-medium">Chirurgenstahl (316L)</TableCell>
                <TableCell className="font-mono">8.00</TableCell>
                <TableCell className="font-mono">200 HV</TableCell>
                <TableCell>Minimal</TableCell>
                <TableCell>DIN EN ISO 10993</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Titan Grade 5 (Ti-6Al-4V)</TableCell>
                <TableCell className="font-mono">4.43</TableCell>
                <TableCell className="font-mono">350 HV</TableCell>
                <TableCell>Nahezu null</TableCell>
                <TableCell>Implantat-Zulassung</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Product FAQs */}
        <div className="space-y-3 pt-2">
          <h4 className="font-serif text-xl">Häufige Fragen zu diesem Objekt</h4>
          <Accordion type="single" collapsible defaultValue="faq-0">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger className="normal-case tracking-normal text-sm font-medium">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Card>

      {/* Reviews */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-5">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-bronze block mb-1">
              Verifizierte Stimmen
            </span>
            <h2 className="font-serif text-3xl text-foreground">Kundenbewertungen</h2>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex text-bronze">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="font-mono font-semibold">{product.average_rating} / 5</span>
            <span className="text-xs text-muted-foreground">({reviews.length})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((r, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex text-bronze gap-0.5">
                    {Array.from({ length: r.rating }).map((_, idx) => (
                      <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  {r.verified_purchase && (
                    <Badge variant="bronze">
                      <CheckCircle2 className="h-3 w-3" />
                      Verifiziert
                    </Badge>
                  )}
                </div>
                <h4 className="font-serif text-lg text-foreground">{r.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.comment}</p>
                <span className="text-[11px] text-muted-foreground block pt-1">— {r.author}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Review Form */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Eigene Bewertung verfassen</CardTitle>
          </CardHeader>
          <CardContent>
            {reviewSuccess ? (
              <div className="p-4 rounded-md bg-bronze/10 border border-bronze/30 text-bronze text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Vielen Dank für Ihre geschätzte Rezension!</span>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="rev-author">Name & Ort</Label>
                    <Input
                      id="rev-author"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="z.B. Beat K., Luzern"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rev-rating">Bewertung</Label>
                    <Select
                      id="rev-rating"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                    >
                      <option value={5}>5 Sterne — Herausragend</option>
                      <option value={4}>4 Sterne — Sehr gut</option>
                      <option value={3}>3 Sterne — Gut</option>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rev-title">Titel</Label>
                  <Input
                    id="rev-title"
                    required
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="z.B. Exzellente Schweizer Haptik"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rev-comment">Kommentar</Label>
                  <Textarea
                    id="rev-comment"
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ihre persönliche Erfahrung mit Material und Verarbeitung..."
                  />
                </div>
                <Button type="submit" variant="bronze">
                  Bewertung absenden
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
