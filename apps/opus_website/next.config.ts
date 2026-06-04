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
  // ── Multi-zone: serve the opus_pass app under /opuspass ──
  // opus_pass sets basePath '/opuspass', so every one of its routes and its
  // `_next` assets live under that prefix. We proxy the whole prefix (including
  // `_next`) to the opus_pass deployment so opusfesta.com/opuspass renders the
  // full OpusPass app with no domain jump. The target MUST be set in prod via
  // NEXT_PUBLIC_OPUS_PASS_URL (https://opuspass.opusfesta.com); falls back to
  // the local dev port 3008.
  async rewrites() {
    // Fail the build loudly if the proxy target is missing on Vercel. Without
    // this, an unset var silently bakes in localhost:3008 and every /opuspass/*
    // route 404s in prod with DNS_HOSTNAME_RESOLVED_PRIVATE (Vercel refuses to
    // proxy to a private host). Gate on VERCEL (not NODE_ENV) so a LOCAL prod
    // build — which legitimately has no var and falls back to localhost:3008 —
    // is unaffected; this only guards the deployed zone.
    if (process.env.VERCEL && !process.env.NEXT_PUBLIC_OPUS_PASS_URL) {
      throw new Error(
        'NEXT_PUBLIC_OPUS_PASS_URL is required for Vercel builds. ' +
          'Set it to the opus_pass origin (e.g. https://opuspass.opusfesta.com) ' +
          'on the opus_website Vercel project — see .env.example.',
      )
    }
    const opusPass = process.env.NEXT_PUBLIC_OPUS_PASS_URL ?? 'http://localhost:3008'
    return [
      { source: '/opuspass', destination: `${opusPass}/opuspass` },
      { source: '/opuspass/:path*', destination: `${opusPass}/opuspass/:path*` },
    ]
  },
  async redirects() {
    return [
      // ── Canonical product pages live in the opus_pass zone (/opuspass/*) ──
      // Invitations, Guests & RSVP and Wedding Websites are CMS-managed inside
      // opus_pass. opus_website's old copies are retired; these 308s send the
      // legacy URLs into the zone so there is a single source of truth and no
      // duplicate content. The destinations land on the /opuspass rewrite above.
      // Order matters: most specific first, catch-all last.
      { source: '/invitations', destination: '/opuspass/invitations', permanent: true },
      { source: '/invitations/:path*', destination: '/opuspass/invitations/:path*', permanent: true },
      { source: '/websites', destination: '/opuspass/websites', permanent: true },
      { source: '/websites/:path*', destination: '/opuspass/websites/:path*', permanent: true },

      // Legacy /guests* paths. Invitation deep-links (formerly nested under
      // /guests) go to the zone catalog; everything else to Guests & RSVP.
      // /my/guests is a separate user-dashboard route and is NOT matched — Next.js
      // redirect `source` matches the full path, not a prefix of a different one.
      { source: '/guests/invitations', destination: '/opuspass/invitations/catalog', permanent: true },
      { source: '/guests/invitations/:path*', destination: '/opuspass/invitations/catalog/:path*', permanent: true },
      { source: '/guests', destination: '/opuspass/guests-and-rsvp', permanent: true },
      { source: '/guests/:path*', destination: '/opuspass/guests-and-rsvp', permanent: true },
    ]
  },
}

export default nextConfig
