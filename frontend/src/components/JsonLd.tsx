import React from 'react';

interface JsonLdProps {
  data: Record<string, any>;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const SITE_URL = 'https://pbstyle.ch';
const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCdjntWv6yHbxg0CZKo2MFCwpCbZ3tA6jzNipHDUIT9H5H4IuK3iAY_NPD5QxmRxUBDoCxBSogUAskqCwEEC6f6NrRthEJiuesWt1a6wE8YCKXn1or_N8P25VW6uVKUvR65XIv0fmtpfMQJv-CFSuyKzzXIaF4xHqUViK7Gfuu7VKOIoQSum71TTYqZ2QCy-m_DQALNbi4u6gt47N8Pv9D2nZ1B8hQ_Oc6G9QPePPneuuec71cTkBgDEr3RSmr_ABMMJ1kRnIZiEgE';

export function formatMaterialLabel(material?: string | null): string {
  const m = (material || '').toLowerCase();
  if (m.includes('platin')) return '950 Platin (Pt 950)';
  if (m.includes('titan')) return 'Titan Grade 5 (Ti-6Al-4V)';
  if (m.includes('steel') || m.includes('stahl') || m.includes('316l')) {
    return 'Chirurgischer Edelstahl 316L';
  }
  return material || 'Schweizer Präzisionsmetall';
}

export function generateOrganizationSchema() {
  return {
    '@type': ['JewelryStore', 'Organization'],
    '@id': `${SITE_URL}/#organization`,
    name: 'PBSTYLE Atelier für industrielle Eleganz',
    legalName: 'PBSTYLE Schweiz AG',
    alternateName: ['PBSTYLE', 'PBstyle Swiss Precision Metallurgy', 'PBSTYLE Zürich'],
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE_URL}/#logo`,
      url: `${SITE_URL}/pbstyle-logo.svg`,
      contentUrl: `${SITE_URL}/pbstyle-logo.svg`,
      width: 512,
      height: 512,
      caption: 'PBSTYLE Atelier Zürich Logo',
    },
    image: HERO_IMAGE,
    slogan: 'Industrielle Eleganz — Präzision Veredelt.',
    description:
      'Schweizer Luxusmanufaktur für Schmuck und dermatologische Präzisions-Beautytools aus massivem 950er Platin, Titan Grade 5 und Chirurgenstahl 316L mit ±0.01 mm Fertigungstoleranz.',
    telephone: '+41 44 211 88 00',
    email: 'concierge@pbstyle.ch',
    taxID: 'CHE-114.882.901 MWST',
    vatID: 'CHE-114.882.901 MWST',
    founder: {
      '@type': 'Person',
      name: 'Philippe Bernasconi',
      jobTitle: 'Atelier Director & Metallurgist',
    },
    foundingDate: '2024',
    foundingLocation: {
      '@type': 'Place',
      name: 'Zürich, Schweiz',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Bahnhofstrasse 45',
      addressLocality: 'Zürich',
      postalCode: '8001',
      addressRegion: 'ZH',
      addressCountry: 'CH',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 47.3769,
      longitude: 8.5417,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+41 44 211 88 00',
        email: 'concierge@pbstyle.ch',
        contactType: 'customer service',
        areaServed: ['CH', 'LI', 'DE', 'AT'],
        availableLanguage: ['de', 'en'],
      },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:00',
        closes: '18:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '10:00',
        closes: '17:00',
      },
    ],
    priceRange: 'CHF 85 - CHF 5000',
    currenciesAccepted: 'CHF, EUR, USD',
    paymentAccepted: 'Credit Card, TWINT, Apple Pay, Bank Transfer',
    areaServed: [
      { '@type': 'Country', name: 'Switzerland' },
      { '@type': 'Country', name: 'Liechtenstein' },
      { '@type': 'Country', name: 'Germany' },
      { '@type': 'Country', name: 'Austria' },
    ],
    hasMap: 'https://maps.google.com/?q=Bahnhofstrasse+45+8001+Z%C3%BCrich',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'PBSTYLE Tresor-Kollektion',
      url: `${SITE_URL}/catalog`,
      itemListElement: [
        { '@type': 'OfferCatalog', name: 'Platinschmuck (950 Platin)' },
        { '@type': 'OfferCatalog', name: 'Titanschmuck (Grade 5 Ti-6Al-4V)' },
        { '@type': 'OfferCatalog', name: 'Dermatologische Beauty-Tools (Chirurgenstahl 316L)' },
      ],
    },
    knowsAbout: [
      '950 Platinum metallurgy (Pt 950)',
      'Surgical Stainless Steel 316L passivation (DIN EN ISO 10993)',
      'Titanium Grade 5 (Ti-6Al-4V) aerospace jewelry',
      'Swiss precision 5-axis CNC micro-milling (±0.01 mm)',
      'Ultrasonic jewelry cleaning & restoration',
      'Recycled secondary platinum sustainability',
    ],
    sameAs: [
      'https://www.instagram.com/pbstyle.ch',
      'https://www.linkedin.com/company/pbstyle-swiss',
    ],
  };
}

export function generateBrandSchema() {
  return {
    '@type': 'Brand',
    '@id': `${SITE_URL}/#brand`,
    name: 'PBSTYLE',
    alternateName: 'PBstyle',
    url: SITE_URL,
    logo: { '@id': `${SITE_URL}/#logo` },
    slogan: 'Industrielle Eleganz — Präzision Veredelt.',
    description:
      'Schweizer Manufaktur für monolithischen Schmuck aus 950er Platin und Titan Grade 5 sowie medizinische Beauty-Tools aus Chirurgenstahl 316L.',
  };
}

export function generateWebSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'PBSTYLE | Industrielle Eleganz',
    alternateName: 'PBstyle Swiss Precision Metallurgy',
    description:
      'Offizieller Online-Store des PBSTYLE Ateliers Zürich für Schweizer Präzisionsschmuck und Beauty-Tools.',
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: ['de-CH'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/catalog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateGlobalKnowledgeGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      generateOrganizationSchema(),
      generateBrandSchema(),
      generateWebSiteSchema(),
    ],
  };
}

export function generateWebPageSchema({
  url,
  name,
  description,
  type = 'WebPage',
  speakableSelectors = ['h1', 'h2'],
}: {
  url: string;
  name: string;
  description: string;
  type?: 'WebPage' | 'CollectionPage' | 'AboutPage' | 'ItemPage';
  speakableSelectors?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: 'de-CH',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: speakableSelectors,
    },
  };
}

export function generateProductSchema(product: any) {
  const imageUrl = product.featured_image || (product.images && product.images[0]?.image_url);
  const images =
    product.images && product.images.length > 0
      ? product.images.map((img: any) => img.image_url)
      : imageUrl
      ? [imageUrl]
      : [];

  const materialLabel = formatMaterialLabel(product.material);
  const sku = product.sku_prefix
    ? `${product.sku_prefix}-${String(product.id).padStart(3, '0')}`
    : `PB-${product.handle.toUpperCase()}`;

  const reviews = (product.reviews || []).map((rev: any) => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: rev.author || 'Verifizierter Kunde',
    },
    datePublished: rev.created_at
      ? String(rev.created_at).slice(0, 10)
      : '2026-03-15',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: rev.rating || 5,
      bestRating: 5,
      worstRating: 1,
    },
    name: rev.title || undefined,
    reviewBody: rev.comment || rev.title || 'Exzellente Schweizer Verarbeitung.',
  }));

  const specProperties = Object.entries(product.specifications || {}).map(([name, value]) => ({
    '@type': 'PropertyValue',
    name,
    value: String(value),
  }));

  const isFreeShipping = Number(product.base_price) > 150;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/products/${product.handle}#product`,
    name: product.title,
    image: images,
    description: product.description,
    sku,
    mpn: `PBSTYLE-${product.id}`,
    category: product.category?.title || product.category_title || 'Schweizer Präzisionsschmuck',
    brand: { '@id': `${SITE_URL}/#brand` },
    manufacturer: { '@id': `${SITE_URL}/#organization` },
    material: materialLabel,
    countryOfOrigin: {
      '@type': 'Country',
      name: 'Switzerland',
    },
    pattern: 'Industrielle Eleganz / Schweizer Minimalismus',
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.handle}`,
      priceCurrency: product.currency || 'CHF',
      price: Number(product.base_price).toFixed(2),
      priceValidUntil: '2026-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/PreOrder',
      seller: { '@id': `${SITE_URL}/#organization` },
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: Number(product.base_price).toFixed(2),
        priceCurrency: product.currency || 'CHF',
        valueAddedTaxIncluded: true,
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: ['CH', 'LI', 'DE', 'AT'],
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: [
        {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: isFreeShipping ? '0.00' : '15.00',
            currency: 'CHF',
          },
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: ['CH', 'LI'],
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 2,
              unitCode: 'DAY',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 2,
              unitCode: 'DAY',
            },
          },
        },
        {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: isFreeShipping ? '0.00' : '15.00',
            currency: 'CHF',
          },
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: ['DE', 'AT'],
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 2,
              unitCode: 'DAY',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 2,
              maxValue: 4,
              unitCode: 'DAY',
            },
          },
        },
      ],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.average_rating || 5.0,
      reviewCount: Math.max(1, product.review_count || reviews.length || 1),
      bestRating: 5,
      worstRating: 1,
    },
    review: reviews.length > 0 ? reviews : undefined,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Schweizer Toleranzstandard',
        value: '±0.01 mm Horologie-Präzision',
      },
      {
        '@type': 'PropertyValue',
        name: 'Herkunft & Zertifikat',
        value: product.certification || 'Swiss Precision Certified • ISO 9001 Metallurgie',
      },
      {
        '@type': 'PropertyValue',
        name: 'Garantie',
        value: 'Lebenslange Ateliergarantie inkl. jährlicher Ultraschallreinigung',
      },
      {
        '@type': 'PropertyValue',
        name: 'Schweizer Mehrwertsteuer',
        value: 'Inkl. 8.1% Schweizer MWST',
      },
      ...specProperties,
    ],
  };
}

export function generateCareHowToSchema(productTitle: string, materialLabel: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `Pflege und Reinigung von ${productTitle} (${materialLabel})`,
    description: `Anleitung zur fachgerechten Reinigung und Werterhaltung von ${productTitle} aus ${materialLabel} nach PBSTYLE Atelierstandards.`,
    totalTime: 'PT5M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Sanfte Reinigung',
        text: 'Spülen Sie das Objekt unter lauwarmem Wasser mit einer milden, pH-neutralen Seife ab.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Trocknen mit Mikrofaser',
        text: 'Tupfen Sie die Oberfläche mit einem fusselfreien Mikrofasertuch trocken, um Wasserflecken zu vermeiden.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Jährliche Atelier-Ultraschallreinigung',
        text: 'Nutzen Sie den kostenfreien jährlichen Ultraschall- und Werksauffrischungsservice im PBSTYLE Atelier Zürich.',
      },
    ],
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}
