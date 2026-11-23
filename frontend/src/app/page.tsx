import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { fetchProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import HeroSlideshow from '@/components/HeroSlideshow';
import JsonLd, { generateFaqSchema, generateWebPageSchema } from '@/components/JsonLd';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

const homeFaqs = [
  {
    question: 'Was macht die Schweizer Manufaktur PBSTYLE einzigartig?',
    answer:
      'PBSTYLE verbindet die mikrometrische Toleranzgrenze von ±0.01 mm der Schweizer Feinmechanik mit Haute Joaillerie. Jedes Stück wird aus massivem, unbeschichtetem 950er Platin (Pt 950), Raumfahrttitan Grade 5 (Ti-6Al-4V) oder medizinischem Chirurgenstahl 316L in Zürich gefertigt.',
  },
  {
    question: 'Welche Zertifikate und Garantien begleiten die PBSTYLE Kreationen?',
    answer:
      'Alle Objekte werden mit individuellem metallurgischem Echtheitszertifikat geliefert. PBSTYLE gewährt eine lebenslange Ateliergarantie auf Materialgefüge und Fertigungspräzision sowie eine kostenlose jährliche Ultraschall-Werksauffrischung.',
  },
  {
    question: 'Wie schnell und sicher liefert PBSTYLE in der Schweiz und im DACH-Raum?',
    answer:
      'In der Schweiz und Liechtenstein erfolgt der Versand ab CHF 150 kostenfrei und versichert per Schweizer Post «Pro Clima» in 1–2 Werktagen. Lieferungen nach Deutschland und Österreich erfolgen verzollt (DDP) in 2–4 Werktagen.',
  },
  {
    question: 'Warum verwendet PBSTYLE massives 950er Platin statt rhodiniertem Weißgold?',
    answer:
      '950er Platin besitzt eine natürliche silbrig-weiße Farbe, eine Dichte von 21.45 g/cm³ und verliert bei Reibung keine Masse. Es ist 100% hypoallergen, läuft niemals an und benötigt keine vergängliche Rhodium-Beschichtung.',
  },
];

export default async function HomePage() {
  const [products, newestProducts] = await Promise.all([
    fetchProducts({ limit: 4, sort: 'featured' }),
    fetchProducts({ limit: 5, sort: 'newest' }),
  ]);

  const categories = [
    {
      index: '01',
      title: 'Platinschmuck',
      subtitle: 'Massives 950er Platin & Flugzeugtitan',
      href: '/catalog?category=schmuck',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCdjntWv6yHbxg0CZKo2MFCwpCbZ3tA6jzNipHDUIT9H5H4IuK3iAY_NPD5QxmRxUBDoCxBSogUAskqCwEEC6f6NrRthEJiuesWt1a6wE8YCKXn1or_N8P25VW6uVKUvR65XIv0fmtpfMQJv-CFSuyKzzXIaF4xHqUViK7Gfuu7VKOIoQSum71TTYqZ2QCy-m_DQALNbi4u6gt47N8Pv9D2nZ1B8hQ_Oc6G9QPePPneuuec71cTkBgDEr3RSmr_ABMMJ1kRnIZiEgE',
    },
    {
      index: '02',
      title: 'Beauty-Tools',
      subtitle: 'Medizinischer Chirurgenstahl 316L',
      href: '/catalog?category=beauty-tools',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCtRjOqjJK8dTOsrxOxl5yuTJPf0AbTeOBiKKoZFUNDv6fx-UBtt1DviExuZRQbvXfd9cRyjd_xAWa_ZxF-MUAWvuSf67DFv7j8oC5esKRpJcgQOtXqzjGjDikSBpaBCyQsV1ZSoLPG0Cgm8d3CyJewdR9bmmUxoLzs6emmWgJoBIL6smQA4esdyK6KnavJeB0UfGEThvBjcOV-wU986ofKgs5iBfKLYnkwSZddkO9wSerfcCmZAJdN501nand0PTIsUfTkJw5bQPg',
    },
    {
      index: '03',
      title: 'Tresor-Editionen',
      subtitle: 'Limitierte Meisterstücke & Prototypen',
      href: '/catalog?category=neuheiten',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD8DxlyWKoj1_fug149Ux4zigrvTRaN3Vk2X7MMm3-s0i7icQIGVpaBPyjI6Y-UKEno1nDNQvoKBviFndTQYJ9tlIfH1iUtsaWc3Muk1HpTLtZb3pOSJsuuYud_RM36FSo4Vy44AHrRuS4a9HZ6lmCtDGIjDSmNLsxCjybxwShD29YlXq9BvoFGrBXeNpKyzRpIer7AqrmCVIE97dR_GgPHPuSTfL2n3SpGZkw0rH0B8FMaB6TW1SYrwLg7D1rXH0BHqb5__yjnu20',
    },
  ];

  return (
    <div className="space-y-24 md:space-y-32 pb-24">
      <JsonLd
        data={generateWebPageSchema({
          url: 'https://pbstyle.ch',
          name: 'PBSTYLE | Industrielle Eleganz — Schweizer Präzisionsschmuck & Beauty-Tools',
          description:
            'Luxuriöser Schmuck und dermatologische Beauty-Tools aus massivem 950er Platin, Titan Grade 5 und Chirurgenstahl 316L. Gefertigt in Zürich mit ±0.01 mm Toleranz.',
          speakableSelectors: ['h1', 'header p', 'h2'],
        })}
      />
      <JsonLd data={generateFaqSchema(homeFaqs)} />

      {/* Editorial Swiss Horology Hero */}
      <header className="relative overflow-hidden border-b border-border/70">
        {/* Subtle ambient architectural radial light */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 w-[640px] h-[640px] rounded-full bg-bronze/10 blur-3xl opacity-70"
        />

        <div className="max-w-container-max mx-auto px-4 md:px-10 py-10 md:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Editorial Thesis */}
          <div className="lg:col-span-6 space-y-8 relative z-10">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-bronze" />
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-bronze">
                Edition 2026 • Atelier Zürich
              </span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl xl:text-[5.25rem] text-foreground leading-[0.98] tracking-[-0.03em]">
              Präzision
              <br />
              <span className="italic font-light text-muted-foreground">Veredelt.</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
              Monolithischer Schmuck aus massivem 950er Platin und dermatologische Präzisions-Tools aus Chirurgenstahl 316L — gefräst nach Schweizer Uhrmachertoleranz.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
              <Button size="lg" className="h-12 px-8 group" asChild>
                <Link href="/catalog">
                  Kollektion entdecken
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                <Link href="/brand-story">Atelier & Handwerk</Link>
              </Button>
            </div>

            {/* Precision Specification Strip */}
            <div className="pt-6 border-t border-border/80 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <span className="font-mono text-sm sm:text-base font-semibold text-foreground block">
                  950 Pt
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Unbeschichtet
                </span>
              </div>
              <div className="border-l border-border/80 pl-4">
                <span className="font-mono text-sm sm:text-base font-semibold text-foreground block">
                  ±0.01 mm
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  5-Achs CNC
                </span>
              </div>
              <div className="border-l border-border/80 pl-4">
                <span className="font-mono text-sm sm:text-base font-semibold text-bronze flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  100%
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Lebenslang
                </span>
              </div>
            </div>
          </div>

          {/* Right Layered Editorial Slideshow (Latest 5 New Products) */}
          <div className="lg:col-span-6 relative">
            <HeroSlideshow products={newestProducts.length > 0 ? newestProducts : products} />
          </div>
        </div>
      </header>

      {/* Architectural Category Cards */}
      <section className="max-w-container-max mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link key={cat.index} href={cat.href} className="group block">
              <Card className="relative h-96 overflow-hidden border-border/80 transition-all duration-300 hover:border-bronze/60 hover:shadow-xl">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale contrast-115 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="relative z-10 h-full p-7 flex flex-col justify-between text-white">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/75">
                      Kategorie {cat.index}
                    </span>
                    <span className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-bronze transition-colors">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-2xl tracking-tight">{cat.title}</h3>
                    <p className="text-xs text-white/75">{cat.subtitle}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-container-max mx-auto px-4 md:px-10 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-bronze block">
              Ausgewählte Meisterwerke
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground">
              Kollektions-Highlights
            </h2>
          </div>
          <Button variant="ghost" asChild className="self-start md:self-auto">
            <Link href="/catalog">
              Gesamten Katalog ansehen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Craftsmanship Editorial Split */}
      <section className="border-y border-border bg-card/60 py-20">
        <div className="max-w-container-max mx-auto px-4 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-6 space-y-7">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-bronze block">
              Handwerkskunst & Metallurgie
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-foreground leading-tight">
              Geschaffen für die Ewigkeit.
              <br />
              <span className="italic font-light text-muted-foreground">Ohne Kompromisse.</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Jedes Objekt im PBSTYLE Atelier durchläuft dieselben strengen mikrometrischen Toleranzprüfungen wie mechanische Schweizer Uhrwerke. Wir verarbeiten ausschließlich massives, unbeschichtetes 950er Platin, Titan Grade 5 und medizinischen Chirurgenstahl 316L.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
              <Card className="p-5 bg-background/70">
                <span className="font-mono text-2xl font-semibold text-bronze block">±0.01 mm</span>
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1 block">
                  Fertigungstoleranz
                </span>
              </Card>
              <Card className="p-5 bg-background/70">
                <span className="font-mono text-2xl font-semibold text-bronze block">100%</span>
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1 block">
                  Sekundärplatin
                </span>
              </Card>
            </div>

            <Button variant="outline" asChild>
              <Link href="/brand-story">
                Zur Markenphilosophie
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="lg:col-span-6">
            <Card className="p-3 overflow-hidden shadow-xl">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBk7MnhJ9AmwM4ZVHl-gG4J6kedDo3op_uX4aN8P5Go6NXf-jAyz8_eZko27xlVmDnzbK3R8nK8s6DrjTnFgeY3arJazb4xmjeJeeFuBYDR0Tcb2VV-FQuJl8ebJyBKQ7pFbmkfxIo16E7GNgd-MtOuRZoTeeriz-3WdofzK_FrU7XxCZAN2dWYe0l_MPsPu7E08Q_xnAd0DLKFFkFK6ZdKs7vLZKGU0fBklwjufPXHIcuj1uehMxUAA4BYoBjw92P5bVR4Xd1quHE"
                alt="PBSTYLE Schweizer Manufaktur Atelier"
                className="w-full aspect-[4/3] object-cover rounded-md grayscale contrast-115"
              />
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
