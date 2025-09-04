/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['https://psx-b2b-3.vercel.app'], // Add your Vercel domain
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;