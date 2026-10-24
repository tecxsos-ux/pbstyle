import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd, { generateFaqSchema, generateBreadcrumbSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Markenphilosophie & Das Erbe | PBSTYLE',
  description: 'Erfahren Sie mehr über die Schweizer Manufaktur hinter PBSTYLE. Präzisionsschmuck und Beauty-Tools aus unbeschichtetem 950er Platin und Edelstahl.',
  alternates: {
    canonical: 'https://pbstyle.ch/brand-story',
  }
};

const faqs = [
  {
    question: 'Was unterscheidet PBstyle von herkömmlichen Schmuckmarken?',
    answer: 'PBstyle überträgt die mikrometrischen Toleranzstandards der Schweizer Feinmechanik auf Edelmetalle. Jedes Objekt wird aus massivem 950er Platin, Flugzeugtitan Grade 5 oder chirurgischem Edelstahl ohne flüchtige Galvanikbeschichtungen gefertigt.'
  },
  {
    question: 'Welche Umwelt- und Recyclingstandards erfüllt PBstyle?',
    answer: 'Wir nutzen zu 100% rückverfolgbares Sekundärplatin und recycelten Schweizer Industriestahl. Die Verpackungen bestehen aus CNC-gefrästen, wiederverwendbaren Aluminiumkassetten.'
  },
  {
    question: 'Wo befindet sich das Atelier und die Fertigung?',
    answer: 'Unsere Designentwicklung und die Endpolitur finden im Atelier in Zürich statt, in enger Partnerschaft mit traditionellen Schweizer Uhrmacher- und Feinwerkstätten.'
  },
  {
    question: 'Gibt es einen lebenslangen Reinigungsservice?',
    answer: 'Ja, für alle registrierten Kunden bieten wir eine kostenfreie, lebenslange jährliche Werksauffrischung und Ultraschallreinigung an.'
  }
];

export default function BrandStoryPage() {
  return (
    <div className="space-y-24 md:space-y-36 pb-24">
      <JsonLd data={generateFaqSchema(faqs)} />
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: 'Home', url: 'https://pbstyle.ch' },
          { name: 'Markenphilosophie', url: 'https://pbstyle.ch/brand-story' },
        ])}
      />

      {/* Hero Manifesto */}
      <header className="pt-20 pb-12 max-w-container-max mx-auto px-4 md:px-12 text-center space-y-6">
        <span className="font-sans text-xs uppercase tracking-[0.3em] text-primary block">
          Manifest & Ursprung
        </span>
        <h1 className="font-serif text-4xl md:text-7xl text-on-surface leading-tight max-w-4xl mx-auto">
          Die Kunst der industriellen Eleganz.
        </h1>
        <p className="font-sans text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Geboren aus den kompromisslosen Standards Schweizer Ingenieurskunst und der zeitlosen Erhabenheit feiner Edelmetalle.
        </p>
      </header>

      {/* Large Workshop Visual */}
      <div className="max-w-container-max mx-auto px-4 md:px-12">
        <div className="relative aspect-video overflow-hidden border border-outline-variant/20 shadow-2xl">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBk7MnhJ9AmwM4ZVHl-gG4J6kedDo3op_uX4aN8P5Go6NXf-jAyz8_eZko27xlVmDnzbK3R8nK8s6DrjTnFgeY3arJazb4xmjeJeeFuBYDR0Tcb2VV-FQuJl8ebJyBKQ7pFbmkfxIo16E7GNgd-MtOuRZoTeeriz-3WdofzK_FrU7XxCZAN2dWYe0l_MPsPu7E08Q_xnAd0DLKFFkFK6ZdKs7vLZKGU0fBklwjufPXHIcuj1uehMxUAA4BYoBjw92P5bVR4Xd1quHE"
            alt="PBSTYLE Werkstatt und Uhrmachertisch"
            className="w-full h-full object-cover filter grayscale contrast-125"
          />
        </div>
      </div>

      {/* Manifesto Content */}
      <section className="max-w-3xl mx-auto px-4 space-y-12 font-sans">
        <div className="space-y-6 text-on-surface leading-relaxed text-base">
          <h2 className="font-serif text-3xl md:text-4xl text-on-surface">
            Wider die Vergänglichkeit
          </h2>
          <p>
            In einer Welt des schnellen Konsums und geplanter Obsoleszenz wählt PBstyle den radikalen Gegenentwurf: Objekte zu erschaffen, die für Generationen Bestand haben. Jedes unserer Stücke wird nicht als modisches Accessoire begriffen, sondern als metallurgisches Monument.
          </p>
          <p>
            Unsere Ringe, Ketten und kosmetischen Werkzeuge werden mit denselben Präzisionsmaschinen gefräst, die in der Luft- und Raumfahrt sowie in Schweizer Haute-Horlogerie-Manufakturen zum Einsatz kommen.
          </p>
        </div>

        <blockquote className="border-l-2 border-primary pl-6 py-2 my-8 font-serif text-2xl text-on-surface italic">
          „Form folgt nicht nur Funktion – Form wird zum ewigen Träger von Präzision und Haptik.“
        </blockquote>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-outline-variant/15 text-center">
          <div className="space-y-2">
            <span className="font-serif text-4xl text-primary font-light">950</span>
            <h4 className="font-sans text-xs uppercase tracking-widest font-semibold">Feinplatin</h4>
            <p className="text-xs text-on-surface-variant">Hypoallergen, massiv und dauerhaft formstabil.</p>
          </div>
          <div className="space-y-2">
            <span className="font-serif text-4xl text-primary font-light">316L</span>
            <h4 className="font-sans text-xs uppercase tracking-widest font-semibold">Chirurgenstahl</h4>
            <p className="text-xs text-on-surface-variant">Medizinische Reinheit und antimikrobielle Politur.</p>
          </div>
          <div className="space-y-2">
            <span className="font-serif text-4xl text-primary font-light">0.01 mm</span>
            <h4 className="font-sans text-xs uppercase tracking-widest font-semibold">Mikro-Toleranz</h4>
            <p className="text-xs text-on-surface-variant">Höchste Passgenauigkeit bei jedem Schließmechanismus.</p>
          </div>
        </div>
      </section>

      {/* FAQ Knowledge Graph Section for SEO & AIO */}
      <section className="bg-surface-container-low py-20 border-y border-outline-variant/15">
        <div className="max-w-container-max mx-auto px-4 md:px-12 max-w-4xl space-y-12">
          <div className="text-center space-y-3">
            <span className="font-sans text-xs uppercase tracking-[0.25em] text-primary">
              Wissensbasis & Transparenz
            </span>
            <h2 className="font-serif text-3xl md:text-4xl">Häufig gestellte Fragen</h2>
          </div>

          <div className="space-y-6 font-sans">
            {faqs.map((f, i) => (
              <div key={i} className="p-6 bg-surface border border-outline-variant/20 space-y-2">
                <h3 className="font-serif text-lg text-on-surface font-semibold">{f.question}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Call to Action */}
      <div className="text-center space-y-6 pt-12">
        <h2 className="font-serif text-3xl">Erleben Sie die Haptik</h2>
        <Link
          href="/catalog"
          className="inline-block px-10 py-4 bg-primary text-on-primary font-sans text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          Kollektion entdecken
        </Link>
      </div>

    </div>
  );
}
