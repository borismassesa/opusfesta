import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Clerk — user profile photos and OAuth provider avatars
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async redirects() {
    return [
      // The guests landing page was renamed /guests -> /guests-and-rsvp.
      // Keep the old path alive for any stored CMS hrefs, bookmarks, and
      // inbound links so they don't 404.
      {
        source: '/guests',
        destination: '/guests-and-rsvp',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
