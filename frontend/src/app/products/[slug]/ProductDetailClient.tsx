'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product, ProductVariant } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  
  const allImages = product.images && product.images.length > 0 
    ? product.images.map(img => img.image_url)
    : [product.featured_image || ''];

  const [activeImage, setActiveImage] = useState<string>(allImages[0]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [openSection, setOpenSection] = useState<'specs' | 'care' | 'cert'>('specs');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Reviews state
  const [reviews, setReviews] = useState(product.reviews || []);
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const currentPrice = product.base_price + (selectedVariant ? selectedVariant.price_offset : 0);

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
        body: JSON.stringify({
          author,
          rating,
          title: reviewTitle,
          comment
        })
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

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-12 py-12 space-y-20">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-on-surface-variant font-sans">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-primary transition-colors">Kollektion</Link>
        <span>/</span>
        <span className="text-on-surface font-medium">{product.title}</span>
      </nav>

      {/* Main Product Showcase Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left: Gallery */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Viewport */}
          <div className="relative aspect-[4/5] bg-surface-container-low overflow-hidden border border-outline-variant/20 shadow-xl group">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-6xl">image</span>
              </div>
            )}
            
            <div className="absolute top-4 left-4">
              <span className="bg-surface/90 backdrop-blur-md px-3 py-1 font-sans text-xs uppercase tracking-widest text-primary border border-outline-variant/30">
                {product.material === 'platinum' ? '950 Platin' : 'Chirurgenstahl 316L'}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-24 flex-shrink-0 bg-surface-container-low border transition-all overflow-hidden ${
                    activeImage === img ? 'border-primary ring-1 ring-primary' : 'border-outline-variant/30 hover:border-primary/50'
                  }`}
                >
                  <img src={img} alt={`Ansicht ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Purchasing Actions & Information */}
        <div className="lg:col-span-5 space-y-8 sticky top-28">
          
          <div className="border-b border-outline-variant/15 pb-6 space-y-3">
            <span className="font-sans text-xs uppercase tracking-[0.25em] text-primary block">
              Schweizer Manufaktur-Objekt
            </span>
            <h1 className="font-serif text-3xl md:text-5xl text-on-surface leading-tight">
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                {product.subtitle}
              </p>
            )}
            
            <div className="flex items-baseline gap-4 pt-2">
              <span className="font-serif text-3xl text-primary font-medium">
                CHF {currentPrice.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
              </span>
              {product.compare_at_price && (
                <span className="font-sans text-base text-on-surface-variant/60 line-through">
                  CHF {product.compare_at_price.toLocaleString('de-CH')}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
            {product.description}
          </p>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 font-sans">
              <label className="text-xs uppercase tracking-widest text-on-surface font-semibold block">
                Ausführung / Größe:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`py-3 px-4 text-xs uppercase tracking-wider text-left border transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-primary font-semibold'
                          : 'border-outline-variant/30 text-on-surface hover:border-primary/50'
                      }`}
                    >
                      <div className="truncate">{v.title}</div>
                      {v.price_offset > 0 && (
                        <div className="text-[10px] text-on-surface-variant mt-0.5">
                          + CHF {v.price_offset}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex gap-4 pt-4">
            {/* Quantity */}
            <div className="flex items-center border border-outline-variant/30 text-sm font-sans">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-4 text-on-surface-variant hover:text-primary transition-colors"
              >
                -
              </button>
              <span className="px-4 font-mono font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-4 text-on-surface-variant hover:text-primary transition-colors"
              >
                +
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-1 py-4 bg-on-background text-background font-sans text-xs uppercase tracking-widest hover:bg-primary transition-colors flex items-center justify-center gap-3 active:scale-[0.99] shadow-xl"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isAdding ? 'sync' : 'shopping_bag'}
              </span>
              <span>{isAdding ? 'Wird hinzugefügt...' : 'In den Warenkorb'}</span>
            </button>
          </div>

          {/* Value Propositions */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-outline-variant/15 text-xs font-sans text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">local_shipping</span>
              <span>Kostenloser Kurierversand CH</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              <span>Lebenslange Garantie</span>
            </div>
          </div>

          {/* Expandable Technical Tabs */}
          <div className="space-y-4 pt-2 font-sans">
            {/* Accordion Specs */}
            <div className="border border-outline-variant/20">
              <button
                onClick={() => setOpenSection(openSection === 'specs' ? 'care' : 'specs')}
                className="w-full p-4 flex justify-between items-center text-xs uppercase tracking-widest text-on-surface font-semibold hover:text-primary transition-colors"
              >
                <span>Präzision & Spezifikationen</span>
                <span className="material-symbols-outlined text-[18px]">
                  {openSection === 'specs' ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {openSection === 'specs' && (
                <div className="p-4 pt-0 text-xs text-on-surface-variant space-y-2 border-t border-outline-variant/10">
                  {Object.entries(product.specifications || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-outline-variant/5">
                      <span className="text-on-surface font-medium">{key}</span>
                      <span>{val}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1">
                    <span className="text-on-surface font-medium">Zertifizierung</span>
                    <span>{product.certification}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion Care */}
            <div className="border border-outline-variant/20">
              <button
                onClick={() => setOpenSection(openSection === 'care' ? 'specs' : 'care')}
                className="w-full p-4 flex justify-between items-center text-xs uppercase tracking-widest text-on-surface font-semibold hover:text-primary transition-colors"
              >
                <span>Pflege & Werksauffrischung</span>
                <span className="material-symbols-outlined text-[18px]">
                  {openSection === 'care' ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {openSection === 'care' && (
                <div className="p-4 pt-0 text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/10">
                  {product.care_instructions || 'Zur Reinigung sanftes lauwarmes Wasser und ein weiches Mikrofasertuch verwenden. Jährlicher professioneller Ultraschall-Service im Atelier kostenfrei.'}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* SECTION: ATELIER-FAKTENBLATT & GEO KNOWLEDGE SHEET */}
      <section className="bg-surface-container-low border border-outline-variant/20 p-8 md:p-12 space-y-8 font-sans">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant/15 pb-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-primary block mb-1">
              Faktenblatt & Spezifikationen (GIO / AIO Verifiziert)
            </span>
            <h3 className="font-serif text-2xl md:text-3xl text-on-surface">
              Metallurgisches Dossier: {product.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-primary font-mono bg-primary/10 px-3 py-1.5 border border-primary/30">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Swiss Precision Standard ±0.01 mm</span>
          </div>
        </div>

        {/* 4 Metric Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-surface border border-outline-variant/15 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant block">Materialdichte</span>
            <span className="font-serif text-2xl text-primary font-light">
              {product.material === 'platinum' ? '21.45 g/cm³' : '8.00 g/cm³'}
            </span>
            <p className="text-[11px] text-on-surface-variant">
              {product.material === 'platinum' ? '950‰ Reinstplatin' : 'Chirurgenstahl 316L'}
            </p>
          </div>
          <div className="p-4 bg-surface border border-outline-variant/15 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant block">Fertigungstoleranz</span>
            <span className="font-serif text-2xl text-on-surface font-light">±0.01 mm</span>
            <p className="text-[11px] text-on-surface-variant">Haute Horlogerie Standard</p>
          </div>
          <div className="p-4 bg-surface border border-outline-variant/15 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant block">Biokompatibilität</span>
            <span className="font-serif text-2xl text-on-surface font-light">100%</span>
            <p className="text-[11px] text-on-surface-variant">DIN EN ISO 10993 konform</p>
          </div>
          <div className="p-4 bg-surface border border-outline-variant/15 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant block">Herkunft & Zertifikat</span>
            <span className="font-serif text-2xl text-on-surface font-light">Zürich, CH</span>
            <p className="text-[11px] text-on-surface-variant">Swissness MSchG Art. 48</p>
          </div>
        </div>

        {/* Metallurgical Benchmark Matrix */}
        <div className="space-y-4 pt-4">
          <h4 className="font-serif text-lg text-on-surface">
            Metallurgische Vergleichsmatrix (Werkstoffanalyse)
          </h4>
          <div className="overflow-x-auto border border-outline-variant/20">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface text-[10px] uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/20">
                <tr>
                  <th className="p-3">Werkstoff</th>
                  <th className="p-3">Dichte (g/cm³)</th>
                  <th className="p-3">Härte (HV)</th>
                  <th className="p-3">Masseverlust bei Reibung</th>
                  <th className="p-3">Biokompatibilität</th>
                  <th className="p-3">Korrosionsresistenz</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                <tr className={product.material === 'platinum' ? 'bg-primary/5 font-semibold' : ''}>
                  <td className="p-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    <span>950 Platin (Pt 950)</span>
                  </td>
                  <td className="p-3 font-mono">21.45</td>
                  <td className="p-3 font-mono">130 HV</td>
                  <td className="p-3 text-primary font-medium">0% (Verschiebung statt Verlust)</td>
                  <td className="p-3">100% Hypoallergen</td>
                  <td className="p-3">Absolut unempfindlich</td>
                </tr>
                <tr>
                  <td className="p-3">750 Weißgold (18 Karat)</td>
                  <td className="p-3 font-mono">15.80</td>
                  <td className="p-3 font-mono">140 HV</td>
                  <td className="p-3 text-red-500">Signifikanter Materialabrieb</td>
                  <td className="p-3">Mögliche Nickel-/Kupferspuren</td>
                  <td className="p-3">Vergilbt ohne Rhodinierung</td>
                </tr>
                <tr className={product.material !== 'platinum' ? 'bg-primary/5 font-semibold' : ''}>
                  <td className="p-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    <span>Chirurgenstahl (316L)</span>
                  </td>
                  <td className="p-3 font-mono">8.00</td>
                  <td className="p-3 font-mono">200 HV</td>
                  <td className="p-3">Extrem gering</td>
                  <td className="p-3">Medizinisch zertifiziert</td>
                  <td className="p-3">Passiviert (DIN ISO 10993)</td>
                </tr>
                <tr>
                  <td className="p-3">Grade 5 Titan (Ti-6Al-4V)</td>
                  <td className="p-3 font-mono">4.43</td>
                  <td className="p-3 font-mono">350 HV</td>
                  <td className="p-3">Nahezu null</td>
                  <td className="p-3">Implantat-Zulassung</td>
                  <td className="p-3">Vollkommen inert</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive FAQ Accordion */}
        <div className="space-y-4 pt-4 border-t border-outline-variant/15">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-primary block">
                Antworten auf häufige Klienten- und Suchanfragen
              </span>
              <h4 className="font-serif text-xl text-on-surface">Fragen & Antworten zu diesem Objekt</h4>
            </div>
            <a
              href="/llms-full.txt"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] uppercase tracking-wider text-primary border border-primary/30 px-3 py-1 hover:bg-primary/10 transition-colors"
            >
              LLM / AI Factsheet ↗
            </a>
          </div>

          <div className="space-y-2">
            {[
              {
                q: `Aus welchem Werkstoff besteht ${product.title}?`,
                a: product.material === 'platinum'
                  ? `${product.title} besteht aus massivem 950er Platin (Pt 950, legiert mit 5% Ruthenium). Mit einer Dichte von 21.45 g/cm³ ist das Edelmetall absolut hypoallergen, läuft niemals an und behält seine edle Farbgebung über Generationen.`
                  : `${product.title} wird aus medizinischem Chirurgenstahl (DIN 316L) oder Titan Grade 5 gefertigt. Durch die elektrochemische Passivierung entsteht eine dauerhafte Chromoxidschicht, die maximale Biokompatibilität garantiert.`
              },
              {
                q: 'Welche Schweizer Fertigungsstandards werden angewendet?',
                a: 'Jedes Werkstück wird unter Einhaltung kompromissloser Schweizer Uhrmachertoleranzen (±0.01 mm) auf 5-Achs-CNC-Präzisionsfräsen bearbeitet, einzeln mikrometrisch geprüft und von Hand im Atelier Zürich veredelt.'
              },
              {
                q: 'Wie sind Garantie und Pflegeservice geregelt?',
                a: 'PBSTYLE gewährt eine uneingeschränkte lebenslange Ateliergarantie auf Materialgefüge und Fertigungspräzision. Registrierte Kunden erhalten zudem eine kostenfreie jährliche Ultraschallreinigung und Werksauffrischung.'
              },
              {
                q: 'Wie schnell erfolgt der Versand in der Schweiz und im DACH-Raum?',
                a: 'Innerhalb der Schweiz versenden wir kostenlos und versichert per Schweizer Post «Pro Clima» innerhalb von 1–2 Werktagen. Lieferungen nach Deutschland und Österreich erfolgen verzollt (DDP) in 2–4 Werktagen.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-surface border border-outline-variant/20">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-4 flex justify-between items-center text-xs uppercase tracking-wider font-semibold text-on-surface hover:text-primary transition-colors text-left"
                >
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined text-[18px]">
                    {openFaqIndex === idx ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {openFaqIndex === idx && (
                  <div className="p-4 pt-0 text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/10">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Swissness & Geo Seal */}
        <div className="p-4 bg-surface border border-outline-variant/15 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              +
            </div>
            <div>
              <span className="font-semibold text-on-surface block">Swissness-Zertifiziert • Kanton Zürich (ZH)</span>
              <span className="text-[11px] text-on-surface-variant">Konform nach Schweizer Bundesgesetz über den Markenschutz (MSchG)</span>
            </div>
          </div>
          <div className="text-right text-[11px] font-mono text-on-surface-variant">
            <span>UID: CHE-114.882.901 MWST</span> • <span>Bahnhofstrasse, 8001 Zürich</span>
          </div>
        </div>

      </section>

      {/* Customer Reviews Section */}
      <section className="pt-16 border-t border-outline-variant/20 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="font-sans text-xs uppercase tracking-[0.25em] text-primary block mb-2">
              Kundenstimmen & Verifizierung
            </span>
            <h2 className="font-serif text-3xl text-on-surface">Erfahrungsberichte</h2>
          </div>
          <div className="flex items-center gap-3 font-sans text-sm">
            <div className="flex text-primary">
              {'★'.repeat(5)}
            </div>
            <span className="font-semibold text-on-surface">
              {product.average_rating} von 5 Sternen
            </span>
            <span className="text-on-surface-variant">({reviews.length} Bewertungen)</span>
          </div>
        </div>

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map((r, i) => (
            <div key={i} className="p-6 bg-surface-container-low border border-outline-variant/15 space-y-3 font-sans">
              <div className="flex justify-between items-center">
                <div className="flex text-primary text-sm">
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </div>
                {r.verified_purchase && (
                  <span className="text-[10px] uppercase tracking-widest text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Verifizierter Erwerb
                  </span>
                )}
              </div>
              <h4 className="font-serif text-lg text-on-surface">{r.title}</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">{r.comment}</p>
              <span className="text-[11px] text-on-surface-variant/70 block pt-2">— {r.author}</span>
            </div>
          ))}
        </div>

        {/* Add Review Form */}
        <div className="bg-surface-container-low p-8 border border-outline-variant/20 max-w-2xl">
          <h3 className="font-serif text-xl mb-4">Eigene Bewertung verfassen</h3>
          {reviewSuccess ? (
            <p className="text-xs text-primary font-sans uppercase tracking-widest">
              Vielen Dank für Ihre geschätzte Rezension!
            </p>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-widest text-on-surface-variant mb-1">
                    Ihr Name & Wohnort
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="z.B. Beat K., Luzern"
                    className="w-full bg-surface border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-on-surface-variant mb-1">
                    Bewertung
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-surface border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface"
                  >
                    <option value={5}>5 Sterne — Herausragend</option>
                    <option value={4}>4 Sterne — Sehr gut</option>
                    <option value={3}>3 Sterne — Gut</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-widest text-on-surface-variant mb-1">
                  Titel der Bewertung
                </label>
                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="z.B. Exzellente Schweizer Haptik"
                  className="w-full bg-surface border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface"
                />
              </div>

              <div>
                <label className="block uppercase tracking-widest text-on-surface-variant mb-1">
                  Kommentar
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ihre persönliche Erfahrung mit dem Material und der Verarbeitung..."
                  className="w-full bg-surface border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-primary text-on-primary uppercase tracking-widest font-sans hover:opacity-90 transition-opacity"
              >
                Bewertung absenden
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
}
