/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://apimw.hasoftz.com/api/:path*', // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;