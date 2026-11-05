const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'orbitex-frontend.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'orbitex-admin-dashboard.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '*.run.app',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: isDev
              ? "default-src 'self' 'unsafe-eval' 'unsafe-inline' localhost:* 127.0.0.1:* ws: wss:; script-src 'self' 'unsafe-eval' 'unsafe-inline' localhost:* 127.0.0.1:*; connect-src 'self' localhost:* 127.0.0.1:* ws: wss:; img-src 'self' data: blob: localhost:* 127.0.0.1:*; style-src 'self' 'unsafe-inline';"
              : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' wss://*.run.app https://*.run.app https://*.googleapis.com; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:;",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [];
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  typescript: {
    ignoreBuildErrors: process.env.CI === 'true',
  },
  trailingSlash: false,
  poweredByHeader: false,
};

module.exports = nextConfig;
