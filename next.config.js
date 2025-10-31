/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Image configuration
  images: {
    domains: [
      'localhost',
      'orbitex-frontend.vercel.app',
      'orbitex-admin-dashboard.vercel.app',
      'orbitex-backend-976099405307.us-central1.run.app',
      'orbitex-auth-service-976099405307.us-central1.run.app'
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Fallback for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
  
  // Experimental features for Next.js 15
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Turbopack configuration (stable in Next.js 15)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Headers for security
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
              : "default-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Rewrites for API proxying (if needed)
  async rewrites() {
    return [
      // Add API rewrites here if needed
    ];
  },
  
  // Compiler configuration
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // TypeScript configuration
  typescript: {
    // Don't run TypeScript during build in CI/CD
    ignoreBuildErrors: process.env.CI === 'true',
  },
  
  // ESLint configuration
  eslint: {
    // Don't run ESLint during build in CI/CD
    ignoreDuringBuilds: process.env.CI === 'true',
  },
  
  // Output configuration
  output: 'standalone',
  
  // Trailing slash configuration
  trailingSlash: false,
  
  // Powered by header
  poweredByHeader: false,
};

module.exports = nextConfig;
