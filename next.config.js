/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // Exclude problematic files from build
    config.module.rules.push({
      test: /datafeeds/,
      use: 'ignore-loader',
    });
    
    return config;
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Exclude problematic directories from TypeScript checking
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore build errors
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore ESLint errors
  },
};

module.exports = nextConfig;
