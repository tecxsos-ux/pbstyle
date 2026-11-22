import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import StorefrontShell from '@/components/StorefrontShell';
import JsonLd, { generateGlobalKnowledgeGraph } from '@/components/JsonLd';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F7F5' },
    { media: '(prefers-color-scheme: dark)', color: '#0D0F14' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://pbstyle.ch'),
  title: {
    default: 'PBSTYLE | Industrielle Eleganz — Schweizer Präzisionsschmuck',
    template: '%s | PBSTYLE',
  },
  description:
    'Wo Schweizer Industriepräzision auf feine Metallurgie trifft. Luxuriöser Schmuck und dermatologische Beauty-Tools aus massivem 950er Platin, Titan Grade 5 und chirurgischem Edelstahl 316L.',
  keywords: [
    'Platinschmuck',
    '950 Platin Ring',
    'Schweizer Schmuckmanufaktur',
    'Industrielle Eleganz',
    'Chirurgenstahl Beauty Tools',
    'Titanium Schmuck',
    'Luxus Kosmetikpinzette',
    'Zürich Luxury Atelier',
    'PBSTYLE',
  ],
  authors: [{ name: 'PBSTYLE Atelier Zürich' }],
  creator: 'PBSTYLE',
  publisher: 'PBSTYLE Swiss Precision',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'de_CH',
    url: 'https://pbstyle.ch',
    title: 'PBSTYLE | Industrielle Eleganz',
    description:
      'Meisterwerke aus 950 Platin und Chirurgenstahl. Entwickelt in Zürich nach höchsten Toleranzstandards.',
    siteName: 'PBSTYLE',
    images: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdjntWv6yHbxg0CZKo2MFCwpCbZ3tA6jzNipHDUIT9H5H4IuK3iAY_NPD5QxmRxUBDoCxBSogUAskqCwEEC6f6NrRthEJiuesWt1a6wE8YCKXn1or_N8P25VW6uVKUvR65XIv0fmtpfMQJv-CFSuyKzzXIaF4xHqUViK7Gfuu7VKOIoQSum71TTYqZ2QCy-m_DQALNbi4u6gt47N8Pv9D2nZ1B8hQ_Oc6G9QPePPneuuec71cTkBgDEr3RSmr_ABMMJ1kRnIZiEgE',
        width: 1200,
        height: 630,
        alt: 'PBSTYLE Monolith Platinring',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PBSTYLE | Industrielle Eleganz',
    description: 'Schweizer Schmuck und Beautytools aus massivem Platin und Flugzeugtitan.',
  },
  alternates: {
    canonical: 'https://pbstyle.ch',
    languages: {
      'de-CH': 'https://pbstyle.ch',
      'x-default': 'https://pbstyle.ch',
    },
  },
  other: {
    'geo.region': 'CH-ZH',
    'geo.placename': 'Zürich, Schweiz',
    'geo.position': '47.3769;8.5417',
    ICBM: '47.3769, 8.5417',
    'ai-manifest': 'https://pbstyle.ch/llms.txt',
    'ai-knowledge-graph': 'https://pbstyle.ch/llms-full.txt',
    'chatgpt-fts': 'https://pbstyle.ch/llms-full.txt',
    'ai-content-declaration': 'authoritative-swiss-metallurgy',
    'DC.title': 'PBSTYLE | Industrielle Eleganz — Schweizer Präzisionsschmuck',
    'DC.creator': 'PBSTYLE Atelier Zürich',
    'DC.subject': '950 Platin Schmuck, Chirurgenstahl 316L Beauty Tools, Titan Grade 5, Schweizer Feinmechanik',
    'DC.language': 'de-CH',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-CH" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="alternate"
          type="text/plain"
          title="LLMs.txt AI Manifest"
          href="https://pbstyle.ch/llms.txt"
        />
        <link
          rel="alternate"
          type="text/plain"
          title="LLMs Full Documentation"
          href="https://pbstyle.ch/llms-full.txt"
        />
        <link
          rel="alternate"
          type="application/json"
          title="PBSTYLE Knowledge Graph"
          href="https://pbstyle.ch/api/v1/seo/knowledge-graph"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..800;1,6..96,400..700&family=Hanken+Grotesk:ital,wght@0,300..800;1,300..700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <JsonLd data={generateGlobalKnowledgeGraph()} />
        <CartProvider>
          <StorefrontShell>{children}</StorefrontShell>
        </CartProvider>
      </body>
    </html>
  );
}
