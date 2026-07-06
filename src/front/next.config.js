/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');
    return [
      { source: '/api-back/:path*', destination: `${apiUrl}/:path*` },
    ];
  },
};

module.exports = nextConfig;
