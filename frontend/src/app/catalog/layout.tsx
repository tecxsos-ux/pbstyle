import React from 'react';
import type { Metadata } from 'next';
import JsonLd, { generateWebPageSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Kollektion & Katalog — 950 Platin, Titan Grade 5 & Chirurgenstahl 316L',
  description:
    'Entdecken Sie die PBSTYLE Tresor-Kollektion: Präzisionsgefertigter Schmuck aus massivem 950er Platin und Titan Grade 5 sowie dermatologische Beauty-Tools aus Chirurgenstahl 316L.',
  keywords: [
    'PBSTYLE Katalog',
    '950 Platin Ring kaufen',
    'Titan Grade 5 Schmuck Schweiz',
    'Chirurgenstahl 316L Beauty Tools',
    'Schweizer Präzisionsschmuck Zürich',
  ],
  alternates: {
    canonical: 'https://pbstyle.ch/catalog',
    languages: {
      'de-CH': 'https://pbstyle.ch/catalog',
      'x-default': 'https://pbstyle.ch/catalog',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'de_CH',
    url: 'https://pbstyle.ch/catalog',
    title: 'PBSTYLE Kollektion | Schweizer Präzisionsschmuck & Beauty-Tools',
    description:
      'Massives 950er Platin, Raumfahrttitan Grade 5 und Chirurgenstahl 316L — gefertigt in Zürich nach ±0.01 mm Uhrmachertoleranz.',
    siteName: 'PBSTYLE',
  },
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={generateWebPageSchema({
          url: 'https://pbstyle.ch/catalog',
          name: 'PBSTYLE Tresor-Kollektion & Katalog',
          description:
            'Katalog präzisionsgefertigter Schmuckstücke und kosmetischer Instrumente aus 950er Platin, Titan Grade 5 und Chirurgenstahl 316L.',
          type: 'CollectionPage',
          speakableSelectors: ['h1', 'header p'],
        })}
      />
      {children}
    </>
  );
}
