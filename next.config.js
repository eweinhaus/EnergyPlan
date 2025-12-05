/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Ensure proper module resolution
    esmExternals: 'loose',
  },
  webpack: (config) => {
    // Ensure proper path resolution
    config.resolve.modules = ['node_modules', '.']
    return config
  },
}

module.exports = nextConfig

