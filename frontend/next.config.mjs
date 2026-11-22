/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-LLMs-Txt',
            value: 'https://pbstyle.ch/llms.txt',
          },
          {
            key: 'Link',
            value: '<https://pbstyle.ch/llms.txt>; rel="alternate"; type="text/plain"; title="LLMs.txt"',
          },
        ],
      },
    ];
  },
  async rewrites() {
    const backendHost = process.env.INTERNAL_API_HOST || 'http://localhost:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendHost}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
