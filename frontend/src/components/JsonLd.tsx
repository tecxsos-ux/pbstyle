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

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    '@id': 'https://pbstyle.ch/#organization',
    name: 'PBSTYLE Atelier für industrielle Eleganz',
    legalName: 'PBSTYLE Schweiz AG',
    alternateName: ['PBstyle Swiss Precision Metallurgy', 'PBSTYLE Zürich'],
    url: 'https://pbstyle.ch',
    logo: {
      '@type': 'ImageObject',
      url: 'https://pbstyle.ch/pbstyle-logo.svg',
      width: '512',
      height: '512',
    },
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdjntWv6yHbxg0CZKo2MFCwpCbZ3tA6jzNipHDUIT9H5H4IuK3iAY_NPD5QxmRxUBDoCxBSogUAskqCwEEC6f6NrRthEJiuesWt1a6wE8YCKXn1or_N8P25VW6uVKUvR65XIv0fmtpfMQJv-CFSuyKzzXIaF4xHqUViK7Gfuu7VKOIoQSum71TTYqZ2QCy-m_DQALNbi4u6gt47N8Pv9D2nZ1B8hQ_Oc6G9QPePPneuuec71cTkBgDEr3RSmr_ABMMJ1kRnIZiEgE',
    description: 'Schweizer Luxusmanufaktur für Schmuck und Präzisions-Beautytools aus massivem 950er Platin, Titan Grade 5 und Chirurgenstahl 316L.',
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
      latitude: '47.3769',
      longitude: '8.5417',
    },
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
    hasMap: 'https://maps.google.com/?q=Bahnhofstrasse+45+8001+Zürich',
    knowsAbout: [
      '950 Platinum metallurgy (Pt 950)',
      'Surgical Stainless Steel 316L passivation',
      'Titanium Grade 5 aerospace jewelry',
      'Swiss precision micro-milling (±0.01mm)',
      'Ultrasonic cleaning & jewelry restoration',
      'Swissness-Verordnung Herkunftsdeklaration'
    ],
    sameAs: [
      'https://www.instagram.com/pbstyle.ch',
      'https://www.linkedin.com/company/pbstyle-swiss',
    ],
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://pbstyle.ch/#website',
    url: 'https://pbstyle.ch',
    name: 'PBSTYLE | Industrielle Eleganz',
    alternateName: 'PBstyle Swiss Precision Metallurgy',
    publisher: {
      '@id': 'https://pbstyle.ch/#organization',
    },
    inLanguage: ['de-CH', 'de-DE', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://pbstyle.ch/catalog?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateProductSchema(product: any) {
  const imageUrl = product.featured_image || (product.images && product.images[0]?.image_url);
  const images = product.images && product.images.length > 0 
    ? product.images.map((img: any) => img.image_url) 
    : (imageUrl ? [imageUrl] : []);

  const reviews = (product.reviews || []).map((rev: any) => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: rev.author || 'Verifizierter Kunde',
    },
    datePublished: '2026-03-15',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: rev.rating || 5,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: rev.comment || rev.title || 'Exzellente Schweizer Verarbeitung.',
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `https://pbstyle.ch/products/${product.handle}#product`,
    name: product.title,
    image: images,
    description: product.description,
    sku: product.sku_prefix ? `${product.sku_prefix}-${String(product.id).padStart(3, '0')}` : `PB-${product.handle.toUpperCase()}`,
    mpn: `PBSTYLE-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'PBstyle',
      logo: 'https://pbstyle.ch/pbstyle-logo.svg',
    },
    manufacturer: {
      '@id': 'https://pbstyle.ch/#organization',
    },
    material: product.material === 'platinum' ? '950 Platin (Pt 950)' : 'Chirurgischer Edelstahl 316L',
    countryOfOrigin: {
      '@type': 'Country',
      name: 'Switzerland',
    },
    pattern: 'Industrielle Eleganz / Schweizer Minimalismus',
    offers: {
      '@type': 'Offer',
      url: `https://pbstyle.ch/products/${product.handle}`,
      priceCurrency: product.currency || 'CHF',
      price: product.base_price,
      priceValidUntil: '2026-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/PreOrder',
      seller: {
        '@id': 'https://pbstyle.ch/#organization',
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'CH',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0.00',
          currency: 'CHF',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'CH',
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
            maxValue: 3,
            unitCode: 'DAY',
          },
        },
      },
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
        name: 'Schweizer Mehrwertsteuer',
        value: 'Inkl. 8.1% Schweizer MWST',
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

