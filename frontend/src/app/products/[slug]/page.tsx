import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchProductByHandle, fetchProducts } from '@/lib/api';
import ProductDetailClient from './ProductDetailClient';
import JsonLd, {
  formatMaterialLabel,
  generateBreadcrumbSchema,
  generateCareHowToSchema,
  generateFaqSchema,
  generateProductSchema,
  generateWebPageSchema,
} from '@/components/JsonLd';

interface Props {
  params: { slug: string };
}

function getProductFaqs(product: any) {
  const isPlat = product.material === 'platinum';
  return [
    {
      question: `Aus welchem Werkstoff besteht ${product.title}?`,
      answer: isPlat
        ? `${product.title} besteht aus massivem 950er Platin (Pt 950, legiert mit Ruthenium). Mit einer Dichte von 21.45 g/cm³ ist das Metall absolut hypoallergen, läuft niemals an und behält seine edle kühle Farbgebung dauerhaft.`
        : `${product.title} wird aus medizinischem Chirurgenstahl (DIN 316L) oder Titan gefertigt. Durch die elektrochemische Passivierung entsteht eine dauerhaft geschlossene Schutzschicht, die höchste Biokompatibilität garantiert.`
    },
    {
      question: 'Welche Schweizer Fertigungsstandards werden angewendet?',
      answer: 'Jedes Objekt wird unter Einhaltung strenger Schweizer Uhrmachertoleranzen (±0.01 mm) auf 5-Achs-CNC-Präzisionsfräsen bearbeitet, einzeln mikrometrisch vermessen und von Meisterhand im Zürcher Atelier veredelt.'
    },
    {
      question: 'Wie sind Garantie und Pflegeservice geregelt?',
      answer: 'PBSTYLE gewährt eine uneingeschränkte lebenslange Ateliergarantie auf Materialgefüge und Herstellungspräzision. Registrierte Kunden erhalten zudem eine kostenfreie jährliche Ultraschallreinigung und Werksauffrischung.'
    },
    {
      question: 'Wie schnell erfolgt der Versand in der Schweiz und im DACH-Raum?',
      answer: 'Innerhalb der Schweiz versenden wir kostenlos und versichert per Schweizer Post «Pro Clima» innerhalb von 1–2 Werktagen. Lieferungen nach Deutschland und Österreich erfolgen verzollt (DDP) in 2–4 Werktagen.'
    }
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await fetchProductByHandle(params.slug);
  if (!product) {
    return { title: 'Produkt nicht gefunden | PBSTYLE' };
  }

  const imageUrl = product.featured_image || (product.images && product.images[0]?.image_url);
  const materialLabel = formatMaterialLabel(product.material);

  return {
    title: `${product.title} — ${materialLabel}`,
    description: `${product.subtitle || ''}. ${product.description.slice(0, 160)}. Gefertigt in Zürich nach Schweizer Präzisionstoleranzen (±0.01 mm).`,
    keywords: [
      product.title,
      materialLabel,
      'PBSTYLE Atelier Zürich',
      'Schweizer Manufaktur',
      'Industrielle Eleganz',
      'Platinring Schweiz',
      'Haute Joaillerie Zürich'
    ],
    openGraph: {
      type: 'website',
      title: `${product.title} | PBSTYLE Industrielle Eleganz`,
      description: product.subtitle || product.description.slice(0, 160),
      images: imageUrl ? [{ url: imageUrl, alt: product.title, width: 1200, height: 630 }] : [],
      url: `https://pbstyle.ch/products/${product.handle}`,
      locale: 'de_CH',
      siteName: 'PBSTYLE',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | PBSTYLE`,
      description: product.subtitle || product.description.slice(0, 150),
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `https://pbstyle.ch/products/${product.handle}`,
      languages: {
        'de-CH': `https://pbstyle.ch/products/${product.handle}`,
        'x-default': `https://pbstyle.ch/products/${product.handle}`,
      }
    },
    other: {
      'product:price:amount': product.base_price.toString(),
      'product:price:currency': product.currency || 'CHF',
      'product:condition': 'new',
      'product:availability': product.stock > 0 ? 'in stock' : 'preorder',
      'product:retailer_item_id': `PB-${product.handle.toUpperCase()}`,
      'geo.region': 'CH-ZH',
      'geo.placename': 'Zürich, Schweiz',
      'geo.position': '47.3769;8.5417',
      'ai-manifest': 'https://pbstyle.ch/llms.txt',
    }
  };
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const products = await fetchProducts();
  return products.map((p) => ({ slug: p.handle }));
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await fetchProductByHandle(params.slug);
  if (!product) notFound();

  const productFaqs = getProductFaqs(product);
  const materialLabel = formatMaterialLabel(product.material);

  return (
    <>
      <JsonLd
        data={generateWebPageSchema({
          url: `https://pbstyle.ch/products/${product.handle}`,
          name: `${product.title} — ${materialLabel} | PBSTYLE`,
          description: product.subtitle || product.description.slice(0, 160),
          type: 'ItemPage',
          speakableSelectors: ['h1', 'h3'],
        })}
      />
      <JsonLd data={generateProductSchema(product)} />
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: 'Home', url: 'https://pbstyle.ch' },
          { name: 'Kollektionen', url: 'https://pbstyle.ch/catalog' },
          { name: product.title, url: `https://pbstyle.ch/products/${product.handle}` },
        ])}
      />
      <JsonLd data={generateFaqSchema(productFaqs)} />
      <JsonLd data={generateCareHowToSchema(product.title, materialLabel)} />
      <ProductDetailClient product={product} />
    </>
  );
}

