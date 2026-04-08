/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Route requests through the proxy to bypass browser CORS checks
        destination: 'https://biobeats.duckdns.org/api/:path*',
      },
    ];
  },
};

export default nextConfig;
