import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // Compression keeps photo uploads at ~1–2 MB each, but the post-
      // compression safety net is 25 MB to match the vendor-portfolios
      // Supabase bucket limit (Pro tier). Vercel's per-function payload
      // cap still applies at the gateway — keep this aligned with the
      // deployed Vercel plan.
      bodySizeLimit: '25mb',
      // Next 16 rejects Server Action POSTs whose forwarded Origin/Host don't
      // match the deployment host. Allowlist the production custom domain so
      // the onboarding submit isn't rejected behind it. Deliberately NOT using
      // a broad '*.vercel.app' wildcard — that would let any Vercel deployment
      // POST Server Actions here (CSRF surface). Preview deployments are
      // same-origin, so they work without an allowlist entry.
      allowedOrigins: ['vendorsportal.opusfesta.com'],
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
    ],
  },
}

export default nextConfig
