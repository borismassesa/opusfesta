import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pass.opusfesta.com'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/my/',
          '/rsvp/',
          '/pledge/',
          '/collect/',
          '/guests',
          '/websites',
          '/sign-in',
          '/sign-up',
          '/invitations/checkout',
          '/invitations/cart',
          '/invitations/confirmation',
          '/invitations/address',
          '/api/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
