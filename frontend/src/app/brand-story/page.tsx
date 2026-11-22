import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import JsonLd, {
  generateBreadcrumbSchema,
  generateFaqSchema,
  generateWebPageSchema,
} from '@/components/JsonLd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Markenphilosophie & Das Erbe',
  description:
    'Erfahren Sie mehr über die Schweizer Manufaktur hinter PBSTYLE. Präzisionsschmuck und Beauty-Tools aus unbeschichtetem 950er Platin, Titan Grade 5 und Chirurgenstahl 316L.',
  alternates: {
    canonical: 'https://pbstyle.ch/brand-story',
    languages: {
      'de-CH': 'https://pbstyle.ch/brand-story',
      'x-default': 'https://pbstyle.ch/brand-story',
    },
  },
  openGraph: {
    type: 'article',
    locale: 'de_CH',
    url: 'https://pbstyle.ch/brand-story',
    title: 'Markenphilosophie & Das Erbe | PBSTYLE Atelier Zürich',
    description:
      'Schweizer Präzisionsmetallurgie trifft auf Haute Joaillerie: ±0.01 mm Toleranz, 100% Sekundärplatin und lebenslange Ateliergarantie.',
    siteName: 'PBSTYLE',
  },
};

const faqs = [
  {
    question: 'Was unterscheidet PBSTYLE von herkömmlichen Schmuckmarken?',
    answer:
      'PBSTYLE überträgt die mikrometrischen Toleranzstandards der Schweizer Feinmechanik auf Edelmetalle. Jedes Objekt wird aus massivem 950er Platin, Flugzeugtitan Grade 5 oder chirurgischem Edelstahl ohne flüchtige Galvanikbeschichtungen gefertigt.',
  },
  {
    question: 'Welche Umwelt- und Recyclingstandards erfüllt PBSTYLE?',
    answer:
      'Wir nutzen zu 100% rückverfolgbares Sekundärplatin und recycelten Schweizer Industriestahl. Die Verpackungen bestehen aus CNC-gefrästen, wiederverwendbaren Aluminiumkassetten.',
  },
  {
    question: 'Wo befindet sich das Atelier und die Fertigung?',
    answer:
      'Unsere Designentwicklung und Endpolitur finden im Atelier in Zürich statt, in enger Partnerschaft mit traditionellen Schweizer Uhrmacher- und Feinwerkstätten.',
  },
  {
    question: 'Gibt es einen lebenslangen Reinigungsservice?',
    answer:
      'Ja, für alle registrierten Kunden bieten wir eine kostenfreie, lebenslange jährliche Werksauffrischung und Ultraschallreinigung an.',
  },
];

export default function BrandStoryPage() {
  return (
    <div className="space-y-24 pb-24">
      <JsonLd
        data={generateWebPageSchema({
          url: 'https://pbstyle.ch/brand-story',
          name: 'Markenphilosophie & Das Erbe | PBSTYLE',
          description:
            'Die Kunst der industriellen Eleganz: Schweizer Präzisionsmetallurgie aus massivem 950er Platin, Titan Grade 5 und Chirurgenstahl 316L.',
          type: 'AboutPage',
          speakableSelectors: ['h1', 'header p', 'blockquote', 'h2'],
        })}
      />
      <JsonLd data={generateFaqSchema(faqs)} />
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: 'Home', url: 'https://pbstyle.ch' },
          { name: 'Markenphilosophie', url: 'https://pbstyle.ch/brand-story' },
        ])}
      />

      {/* Hero */}
      <header className="pt-16 pb-6 max-w-container-max mx-auto px-4 md:px-10 text-center space-y-5">
        <Badge variant="bronze">Manifest & Ursprung</Badge>
        <h1 className="font-serif text-4xl md:text-7xl text-foreground leading-tight max-w-4xl mx-auto">
          Die Kunst der industriellen Eleganz.
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Geboren aus den kompromisslosen Standards Schweizer Ingenieurskunst und der zeitlosen Erhabenheit feiner Edelmetalle.
        </p>
      </header>

      {/* Workshop Image */}
      <div className="max-w-container-max mx-auto px-4 md:px-10">
        <Card className="overflow-hidden shadow-xl">
          <div className="aspect-video">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBk7MnhJ9AmwM4ZVHl-gG4J6kedDo3op_uX4aN8P5Go6NXf-jAyz8_eZko27xlVmDnzbK3R8nK8s6DrjTnFgeY3arJazb4xmjeJeeFuBYDR0Tcb2VV-FQuJl8ebJyBKQ7pFbmkfxIo16E7GNgd-MtOuRZoTeeriz-3WdofzK_FrU7XxCZAN2dWYe0l_MPsPu7E08Q_xnAd0DLKFFkFK6ZdKs7vLZKGU0fBklwjufPXHIcuj1uehMxUAA4BYoBjw92P5bVR4Xd1quHE"
              alt="PBSTYLE Werkstatt und Uhrmachertisch"
              className="w-full h-full object-cover grayscale contrast-115"
            />
          </div>
        </Card>
      </div>

      {/* Manifesto */}
      <section className="max-w-3xl mx-auto px-4 space-y-10">
        <div className="space-y-5 text-muted-foreground leading-relaxed">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">
            Wider die Vergänglichkeit
          </h2>
          <p>
            In einer Welt des schnellen Konsums wählt PBSTYLE den radikalen Gegenentwurf: Objekte zu erschaffen, die für Generationen Bestand haben. Jedes unserer Stücke wird nicht als modisches Accessoire begriffen, sondern als metallurgisches Monument.
          </p>
          <p>
            Unsere Ringe, Ketten und kosmetischen Werkzeuge werden mit denselben Präzisionsmaschinen gefräst, die in der Luft- und Raumfahrt sowie in Schweizer Haute-Horlogerie-Manufakturen zum Einsatz kommen.
          </p>
        </div>

        <blockquote className="border-l-2 border-bronze pl-6 py-2 font-serif text-2xl text-foreground italic">
          „Form folgt nicht nur Funktion – Form wird zum ewigen Träger von Präzision und Haptik.“
        </blockquote>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <Card>
            <CardContent className="p-6 text-center space-y-1.5">
              <span className="font-mono text-3xl font-semibold text-bronze">950</span>
              <h4 className="text-xs uppercase tracking-widest font-semibold">Feinplatin</h4>
              <p className="text-xs text-muted-foreground">
                Hypoallergen, massiv und dauerhaft formstabil.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center space-y-1.5">
              <span className="font-mono text-3xl font-semibold text-bronze">316L</span>
              <h4 className="text-xs uppercase tracking-widest font-semibold">Chirurgenstahl</h4>
              <p className="text-xs text-muted-foreground">
                Medizinische Reinheit und antimikrobielle Politur.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center space-y-1.5">
              <span className="font-mono text-3xl font-semibold text-bronze">±0.01</span>
              <h4 className="text-xs uppercase tracking-widest font-semibold">Mikro-Toleranz</h4>
              <p className="text-xs text-muted-foreground">
                Höchste Passgenauigkeit bei jedem Werkstück.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-border bg-card/60 py-20">
        <div className="max-w-4xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-bronze">
              Wissensbasis & Transparenz
            </span>
            <h2 className="font-serif text-3xl md:text-4xl">Häufig gestellte Fragen</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {faqs.map((f, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-2">
                  <h3 className="font-serif text-lg text-foreground">{f.question}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center space-y-5">
        <h2 className="font-serif text-3xl">Erleben Sie die Haptik</h2>
        <Button size="lg" variant="bronze" asChild>
          <Link href="/catalog">
            Kollektion entdecken
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
