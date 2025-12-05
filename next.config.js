/** @type {import('next').NextConfig} */
const withPWA = (config) => {
  // PWA features will be handled by the service worker registration component
  return config;
};

const nextConfig = {
  reactStrictMode: true,
  images: {
    // Vercel handles image optimization automatically
    domains: ['vercel.app', 'vercel.com'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };
    return config;
  },
  // Enable experimental features for better Vercel performance
  experimental: {
    // Enable ISR for better caching
    // cacheHandler: require.resolve('./cache-handler.js'),
  },
}

module.exports = withPWA(nextConfig)
