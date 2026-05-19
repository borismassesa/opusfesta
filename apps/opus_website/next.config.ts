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
      // Old Invitations routes (formerly nested under /guests) — permanent 308s.
      // /my/guests is a separate user-dashboard route and is NOT redirected.
      { source: '/guests/invitations', destination: '/invitations/catalog', permanent: true },
      { source: '/guests/invitations/:path*', destination: '/invitations/catalog/:path*', permanent: true },
      { source: '/guests', destination: '/invitations', permanent: true },
    ]
  },
}

export default nextConfig
