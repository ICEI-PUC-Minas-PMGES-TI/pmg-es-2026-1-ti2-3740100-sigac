/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/api-back/:path*', destination: 'http://localhost:8080/:path*' },
    ];
  },
};

module.exports = nextConfig;
