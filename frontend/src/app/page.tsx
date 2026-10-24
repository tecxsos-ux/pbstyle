import React from 'react';
import Link from 'next/link';
import { fetchProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import JsonLd, { generateFaqSchema } from '@/components/JsonLd';

export const revalidate = 60; // ISR 60 seconds

const homeFaqs = [
  {
    question: 'Was macht die Schweizer Manufaktur PBstyle einzigartig?',
    answer: 'PBSTYLE verbindet die mikrometrische Toleranzgrenze von ±0.01 mm der Schweizer Feinmechanik mit Haute Joaillerie. Jedes Stück wird aus massivem 950er Platin, Raumfahrttitan Grade 5 oder Chirurgenstahl 316L in Zürich gefertigt.'
  },
  {
    question: 'Welche Zertifikate und Garantien begleiten die PBstyle Kreationen?',
    answer: 'Alle Objekte werden mit individuellem metallurgischem Echtheitszertifikat geliefert. PBstyle gewährt eine lebenslange Ateliergarantie sowie eine kostenlose jährliche Ultraschall-Werksauffrischung.'
  },
  {
    question: 'Wie schnell und sicher liefert PBstyle in der Schweiz und international?',
    answer: 'In der Schweiz und Liechtenstein erfolgt der Versand kostenfrei per Schweizer Post «Pro Clima» in 1–2 Werktagen. Internationale Bestellungen in den DACH-Raum werden vollverzinst und verzollt (DDP) in diskreten Hochsicherheitskassetten zugestellt.'
  }
];

export default async function HomePage() {
  const products = await fetchProducts({ limit: 4, sort: 'featured' });

  return (
    <div className="space-y-24 md:space-y-36 pb-20">
      <JsonLd data={generateFaqSchema(homeFaqs)} />
      
      {/* Hero Section */}
      <header className="relative min-h-[85vh] flex items-center overflow-hidden bg-background">
        <div className="max-w-container-max mx-auto px-4 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12">
          
          {/* Text Left */}
          <div className="lg:col-span-5 z-10 space-y-8">
            <div className="inline-flex items-center gap-4">
              <span className="h-px w-8 bg-primary" />
              <span className="font-sans text-xs uppercase text-primary tracking-[0.3em]">
                Edition 2026
              </span>
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl text-on-surface leading-[1.05] tracking-tight">
              Präzision<br />
              <span className="font-light italic text-on-surface-variant font-serif">Veredelt.</span>
            </h1>
            
            <p className="font-sans text-base text-on-surface-variant max-w-md leading-relaxed">
              Wo industrielles Design auf die erhabene Kunst der Haute Joaillerie trifft. In Zürich entwickelt, für den anspruchsvollen Sammler geschmiedet.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/catalog"
                className="group relative inline-flex items-center justify-center bg-on-background text-background px-10 py-5 font-sans text-xs uppercase tracking-[0.2em] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:bg-primary"
              >
                <span className="relative z-10">Kollektion ansehen</span>
              </Link>
              <Link
                href="/brand-story"
                className="inline-flex items-center justify-center border border-outline/30 px-10 py-5 font-sans text-xs uppercase tracking-[0.2em] text-on-surface hover:bg-surface-container-low hover:border-primary transition-all duration-300"
              >
                Unsere Herkunft
              </Link>
            </div>
          </div>

          {/* Editorial Image Grid Right */}
          <div className="lg:col-span-7 grid grid-cols-12 gap-6 relative h-[450px] sm:h-[550px] lg:h-[650px] items-center">
            {/* Large back image */}
            <div className="col-span-9 h-[88%] relative overflow-hidden group shadow-2xl border border-outline-variant/20">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwNQ1qvT8pN4BHlHMAnesDlNwFzWVc5C4MCgMKvjG6Dgi0wINdiMz6xIKg0pghaC970is5ojjKQBwOXo-XPzDwD5pM_u1CCdycEwwLT5D9oQasqR_VtBLpo7hKvEGdUPmTXLS_p7L_7hW6syTQ8B0FWOLJARlFNI--4EtFtRScQzSf_rYSG6do9C_qxEgjjpMv6sTxgn7gPepLNq6P5fQ6SexplAfCcLoaBp2UAmEMEaseVIG_orJ9PrUEsJ3f5hP3So0oi8KJXd0"
                alt="PBSTYLE Titanium & Platinum Showcase"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
            </div>

            {/* Floating front image */}
            <div className="col-span-6 absolute bottom-6 right-0 w-[50%] h-[52%] p-2 md:p-3 bg-surface shadow-2xl border border-outline-variant/30 z-20 group">
              <div className="w-full h-full overflow-hidden relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTnOF-EQ40OwuZ0ZU27tQmsN-13iuaRYLileGEV_ZUsvB__23n3zRDNNf-qHgdweB6KRm6ck0uGD6SRIwI3pR_ulHsVdfgqC8VkKhdotEjeZA_4G_Bwe0pKZRiEbBlgCu87izJN5spl_cyDJMfoKSHHM9A9dbolPqfVZTKXbByG5tn7TX4vIH0Dj24KCecbPFtwHIOQB1Mz13-2GFR0sZCkLkoEkPPu3DiDsl7LWoCWhe2TQ9OcjK1GIRHtNB47a2wytHhKmvD5gA"
                  alt="PBSTYLE Precision Tool Details"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-105"
                />
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Categories Banner Cards */}
      <section className="max-w-container-max mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link
            href="/catalog?category=schmuck"
            className="group relative h-96 overflow-hidden bg-surface-container-low border border-outline-variant/20 flex flex-col justify-end p-8"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdjntWv6yHbxg0CZKo2MFCwpCbZ3tA6jzNipHDUIT9H5H4IuK3iAY_NPD5QxmRxUBDoCxBSogUAskqCwEEC6f6NrRthEJiuesWt1a6wE8YCKXn1or_N8P25VW6uVKUvR65XIv0fmtpfMQJv-CFSuyKzzXIaF4xHqUViK7Gfuu7VKOIoQSum71TTYqZ2QCy-m_DQALNbi4u6gt47N8Pv9D2nZ1B8hQ_Oc6G9QPePPneuuec71cTkBgDEr3RSmr_ABMMJ1kRnIZiEgE"
              alt="Schmuck Kollektion"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-125 group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10 space-y-2 text-white">
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-primary">
                Kategorie 01
              </span>
              <h3 className="font-serif text-2xl tracking-tight">Platinschmuck</h3>
              <p className="font-sans text-xs text-white/70">
                Massives 950er Platin & Flugzeugtitan
              </p>
            </div>
          </Link>

          <Link
            href="/catalog?category=beauty-tools"
            className="group relative h-96 overflow-hidden bg-surface-container-low border border-outline-variant/20 flex flex-col justify-end p-8"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtRjOqjJK8dTOsrxOxl5yuTJPf0AbTeOBiKKoZFUNDv6fx-UBtt1DviExuZRQbvXfd9cRyjd_xAWa_ZxF-MUAWvuSf67DFv7j8oC5esKRpJcgQOtXqzjGjDikSBpaBCyQsV1ZSoLPG0Cgm8d3CyJewdR9bmmUxoLzs6emmWgJoBIL6smQA4esdyK6KnavJeB0UfGEThvBjcOV-wU986ofKgs5iBfKLYnkwSZddkO9wSerfcCmZAJdN501nand0PTIsUfTkJw5bQPg"
              alt="Beauty Tools"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-125 group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10 space-y-2 text-white">
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-primary">
                Kategorie 02
              </span>
              <h3 className="font-serif text-2xl tracking-tight">Beauty-Tools</h3>
              <p className="font-sans text-xs text-white/70">
                Medizinischer Chirurgenstahl 316L
              </p>
            </div>
          </Link>

          <Link
            href="/catalog?category=neuheiten"
            className="group relative h-96 overflow-hidden bg-surface-container-low border border-outline-variant/20 flex flex-col justify-end p-8"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8DxlyWKoj1_fug149Ux4zigrvTRaN3Vk2X7MMm3-s0i7icQIGVpaBPyjI6Y-UKEno1nDNQvoKBviFndTQYJ9tlIfH1iUtsaWc3Muk1HpTLtZb3pOSJsuuYud_RM36FSo4Vy44AHrRuS4a9HZ6lmCtDGIjDSmNLsxCjybxwShD29YlXq9BvoFGrBXeNpKyzRpIer7AqrmCVIE97dR_GgPHPuSTfL2n3SpGZkw0rH0B8FMaB6TW1SYrwLg7D1rXH0BHqb5__yjnu20"
              alt="Neuheiten"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-125 group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10 space-y-2 text-white">
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-primary">
                Kategorie 03
              </span>
              <h3 className="font-serif text-2xl tracking-tight">Tresor-Editionen</h3>
              <p className="font-sans text-xs text-white/70">
                Limitierte Meisterstücke & Prototypen
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-container-max mx-auto px-4 md:px-12 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-outline-variant/15 pb-6 gap-4">
          <div>
            <span className="font-sans text-xs uppercase tracking-[0.25em] text-primary block mb-2">
              Ausgewählte Meisterwerke
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-on-surface">
              Kollektions-Highlights
            </h2>
          </div>
          <Link
            href="/catalog"
            className="font-sans text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"
          >
            <span>Gesamten Katalog ansehen</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Brand Story Editorial Split Section */}
      <section className="bg-surface-container-low py-20 border-y border-outline-variant/20">
        <div className="max-w-container-max mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-6 space-y-8">
            <span className="font-sans text-xs uppercase tracking-[0.25em] text-primary block">
              Handwerkskunst & Metallurgie
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-on-surface leading-tight">
              Geschaffen für die Ewigkeit.<br />
              <span className="font-light italic text-on-surface-variant font-serif">Ohne Kompromisse.</span>
            </h2>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
              Jedes Objekt im PBstyle-Atelier durchläuft dieselben strengen mikrometrischen Toleranzprüfungen wie mechanische Schweizer Uhrwerke. Wir verwenden ausschließlich unbeschichtetes 950er Feingold-Platin und medizinischen Chirurgenstahl 316L, deren Masse und Haptik Generationen überdauern.
            </p>
            
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-outline-variant/20">
              <div>
                <span className="font-serif text-3xl text-primary font-light block">0.01 mm</span>
                <span className="font-sans text-xs uppercase tracking-widest text-on-surface-variant">
                  Fertigungstoleranz
                </span>
              </div>
              <div>
                <span className="font-serif text-3xl text-primary font-light block">100%</span>
                <span className="font-sans text-xs uppercase tracking-widest text-on-surface-variant">
                  Zertifiziertes Platin
                </span>
              </div>
            </div>

            <Link
              href="/brand-story"
              className="inline-flex items-center gap-3 font-sans text-xs uppercase tracking-widest text-primary border-b border-primary/40 pb-1 hover:border-primary transition-colors"
            >
              <span>Zur vollständigen Markenphilosophie</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="ghost-border p-4 bg-surface">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBk7MnhJ9AmwM4ZVHl-gG4J6kedDo3op_uX4aN8P5Go6NXf-jAyz8_eZko27xlVmDnzbK3R8nK8s6DrjTnFgeY3arJazb4xmjeJeeFuBYDR0Tcb2VV-FQuJl8ebJyBKQ7pFbmkfxIo16E7GNgd-MtOuRZoTeeriz-3WdofzK_FrU7XxCZAN2dWYe0l_MPsPu7E08Q_xnAd0DLKFFkFK6ZdKs7vLZKGU0fBklwjufPXHIcuj1uehMxUAA4BYoBjw92P5bVR4Xd1quHE"
                alt="PBstyle Schweizer Manufaktur Atelier"
                className="w-full aspect-[4/3] object-cover filter grayscale contrast-125"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Swissness & AI Optimization (AIO/GIO) Section */}
      <section className="max-w-container-max mx-auto px-4 md:px-12">
        <div className="bg-surface-container-low border border-outline-variant/20 p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 font-sans">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs">
                +
              </span>
              <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
                Offizielle Schweizer Herkunft (Swiss Made)
              </span>
            </div>
            <h3 className="font-serif text-2xl md:text-3xl text-on-surface">
              Metallurgische Souveränität & Transparenz
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Konform mit dem Schweizer Bundesgesetz über den Schutz von Marken und Herkunftsangaben (MSchG Art. 48). Entwickelt, gefräst und von Meisterhand endpoliert an der Bahnhofstrasse, 8001 Zürich.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
            <Link
              href="/llms.txt"
              target="_blank"
              className="px-5 py-3 border border-outline-variant/30 hover:border-primary text-xs uppercase tracking-widest text-on-surface transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">smart_toy</span>
              <span>AIO Manifest</span>
            </Link>
            <Link
              href="/llms-full.txt"
              target="_blank"
              className="px-5 py-3 bg-primary text-on-primary text-xs uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">hub</span>
              <span>GIO Wissensgraph</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

