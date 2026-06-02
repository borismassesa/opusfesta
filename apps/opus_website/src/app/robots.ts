import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://opusfesta.com'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/my/', '/onboarding', '/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
