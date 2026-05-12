import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // Article & contributor uploads buffer the file through a server
      // action before forwarding to Supabase. The platform default is
      // 1MB which 413s any real phone photo; 25MB gives room for HEIC
      // originals while staying inside Vercel's per-function payload
      // cap. Larger videos use the dedicated signed-URL upload paths.
      bodySizeLimit: '25mb',
    },
  },
}

export default nextConfig
