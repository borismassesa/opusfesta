import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://opuspass.opusfesta.com/opuspass'
  // Pages are served under the /opuspass basePath, so disallow paths carry the
  // prefix. (sign-in/sign-up routes were removed when Clerk auth was dropped.)
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/opuspass',
        disallow: [
          '/opuspass/my/',
          '/opuspass/rsvp/',
          '/opuspass/pledge/',
          '/opuspass/collect/',
          '/opuspass/invitations/checkout',
          '/opuspass/invitations/cart',
          '/opuspass/invitations/confirmation',
          '/opuspass/invitations/address',
          '/opuspass/api/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
