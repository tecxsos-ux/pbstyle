import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/catalog',
          '/products/*',
          '/brand-story',
          '/llms.txt',
          '/llms-full.txt',
          '/sitemap.xml',
        ],
        disallow: ['/admin', '/admin/*', '/checkout', '/account', '/dashboard'],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'ClaudeBot',
          'Claude-Web',
          'anthropic-ai',
          'PerplexityBot',
          'Perplexity-User',
          'Google-Extended',
          'Applebot-Extended',
          'Meta-ExternalAgent',
          'Meta-ExternalFetcher',
          'DuckAssistBot',
          'MistralAI-User',
          'YouBot',
          'cohere-ai',
          'Diffbot',
        ],
        allow: [
          '/',
          '/catalog',
          '/products/*',
          '/brand-story',
          '/llms.txt',
          '/llms-full.txt',
          '/sitemap.xml',
          '/api/v1/seo/*',
        ],
        disallow: ['/admin', '/admin/*', '/checkout', '/account', '/dashboard'],
      },
    ],
    sitemap: 'https://pbstyle.ch/sitemap.xml',
    host: 'https://pbstyle.ch',
  };
}
