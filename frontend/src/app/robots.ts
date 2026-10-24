import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/catalog', '/products/*', '/brand-story', '/llms.txt', '/llms-full.txt'],
        disallow: ['/admin', '/admin/*', '/checkout', '/account', '/api/*'],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'anthropic-ai',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'OAI-SearchBot',
          'cohere-ai',
          'Diffbot'
        ],
        allow: [
          '/',
          '/catalog',
          '/products/*',
          '/brand-story',
          '/llms.txt',
          '/llms-full.txt',
          '/sitemap.xml'
        ],
        disallow: ['/admin', '/admin/*', '/checkout', '/account', '/api/*'],
      }
    ],
    sitemap: 'https://pbstyle.ch/sitemap.xml',
    host: 'https://pbstyle.ch',
  };
}

