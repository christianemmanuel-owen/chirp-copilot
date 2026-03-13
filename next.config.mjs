import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
  webpack: (config, { nextRuntime }) => {
    // Provide an async_hooks polyfill for Edge runtime.
    // Next.js's middleware runtime uses AsyncLocalStorage internally,
    // and @cloudflare/next-on-pages rewrites the import to a nonexistent
    // local path. By aliasing to a real polyfill, it gets inlined into
    // the bundle and the broken external import is eliminated.
    if (nextRuntime === "edge") {
      config.resolve.alias = {
        ...config.resolve.alias,
        async_hooks: path.resolve(__dirname, "lib/polyfills/async-hooks.js"),
      }
    }
    return config
  },
}

export default nextConfig
