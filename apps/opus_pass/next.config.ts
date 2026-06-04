import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // ── Multi-zone basePath ──
  // opus_pass is mounted under /opuspass inside opus_website (opusfesta.com/opuspass)
  // via Next.js rewrites. basePath makes every route, `_next` asset, <Link> and
  // next/image src live under /opuspass so they never collide with opus_website's
  // own /invitations, /websites, /guests-and-rsvp routes. This prefix applies to
  // the standalone deployment (opuspass.opusfesta.com) too, so all paths are
  // consistent across both entry points.
  basePath: '/opuspass',
  images: {
    // Custom loader prepends basePath to the optimizer `url` param so local public/
    // assets (served at /opuspass/assets/…) resolve correctly. See image-loader.ts.
    loader: 'custom',
    loaderFile: './image-loader.ts',
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
    // Standalone domain (opuspass.opusfesta.com) entry — the app lives under
    // /opuspass, so the bare root must bounce there. We emit an ABSOLUTE URL in
    // production: a relative `Location: /opuspass` works in browsers but some
    // link-preview crawlers (WhatsApp/iMessage unfurlers) mishandle relative
    // redirects, so a shared bare link wouldn't unfurl. Prefer an explicit
    // NEXT_PUBLIC_SITE_URL, fall back to Vercel's auto-injected production
    // domain, and finally to a relative path for local dev.
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : undefined)
    const rootDestination = siteUrl ? `${siteUrl}/opuspass` : '/opuspass'
    return [
      // basePath:false matches the TRUE root; without it the source would itself
      // be prefixed to /opuspass and the bare domain would 404.
      {
        source: '/',
        destination: rootDestination,
        basePath: false,
        permanent: false,
      },
      // The guests landing page was renamed /guests -> /guests-and-rsvp.
      // Keep the old path alive for any stored CMS hrefs, bookmarks, and
      // inbound links so they don't 404. (source is auto-prefixed to /opuspass/guests.)
      {
        source: '/guests',
        destination: '/guests-and-rsvp',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
