/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer, nextRuntime }) => {
    // Specifically handle edge runtime where async_hooks is not available
    if (nextRuntime === 'edge') {
      config.resolve.alias = {
        ...config.resolve.alias,
        'async_hooks': false,
      };
    }
    return config;
  },
}

export default nextConfig
