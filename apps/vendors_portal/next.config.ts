import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
