import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://opusfestaevents.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/my-inquiries/',
          '/inquiries/',
          '/reset-password/',
          '/forgot-password/',
          '/verify-email/',
          '/verify-reset-code/',
          '/careers/login/',
          '/careers/signup/',
          '/careers/my-applications/',
          '/careers/track/',
          '/admin/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/my-inquiries/',
          '/inquiries/',
          '/reset-password/',
          '/forgot-password/',
          '/verify-email/',
          '/verify-reset-code/',
          '/careers/login/',
          '/careers/signup/',
          '/careers/my-applications/',
          '/careers/track/',
          '/admin/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
