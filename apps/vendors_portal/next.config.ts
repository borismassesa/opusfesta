import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'unsplash.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
      // Supabase Storage — vendor portfolio images, avatars, asset uploads.
      { protocol: 'https', hostname: '*.supabase.co' },
      // Clerk — user profile photos.
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: '*.clerk.com' },
    ],
  },
}

export default nextConfig
