import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // Compression keeps photo uploads at ~1–2 MB each, well under
      // Vercel's default ~4.5 MB function body limit. Setting this to
      // '5mb' aligns with the platform default — going higher requires
      // a Pro-plan runtime config and would still 413 at the gateway.
      bodySizeLimit: '5mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'unsplash.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
      // Supabase Storage — vendor portfolio images, avatars, asset uploads.
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}

export default nextConfig
