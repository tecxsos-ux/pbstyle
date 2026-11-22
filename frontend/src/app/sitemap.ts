import { MetadataRoute } from 'next';
import { fetchProducts } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pbstyle.ch';
  const products = await fetchProducts();
  const now = new Date();

  const productUrls: MetadataRoute.Sitemap = products.map((p) => {
    const imgs = [
      ...(p.featured_image ? [p.featured_image] : []),
      ...(p.images ? p.images.map((i) => i.image_url) : []),
    ].filter((v, idx, arr) => Boolean(v) && arr.indexOf(v) === idx);

    return {
      url: `${baseUrl}/products/${p.handle}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      images: imgs.length > 0 ? imgs : undefined,
    };
  });

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/brand-story`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/llms-full.txt`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  return [...staticUrls, ...productUrls];
}
