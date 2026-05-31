import type { MetadataRoute } from 'next'
import { vendors } from '@/lib/vendors'
import { getActiveMarketplaceVendors } from '@/lib/vendors-db'
import { loadPublishedAdviceIdeasPosts } from '@/lib/advice-ideas-db'
import { INVITATION_CATEGORIES } from '@/data/invitations-categories'
import { PRODUCTS } from '@/data/invitations-products'
import { BRIDAL_CATEGORIES } from '@/lib/bridal-categories'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://opusfesta.com'

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: BASE, priority: 1.0, changeFrequency: 'weekly' },
  { url: `${BASE}/vendors`, priority: 0.9, changeFrequency: 'daily' },
  { url: `${BASE}/vendors/browse`, priority: 0.8, changeFrequency: 'daily' },
  { url: `${BASE}/advice-and-ideas`, priority: 0.8, changeFrequency: 'weekly' },
  { url: `${BASE}/invitations`, priority: 0.9, changeFrequency: 'weekly' },
  { url: `${BASE}/invitations/catalog`, priority: 0.8, changeFrequency: 'weekly' },
  { url: `${BASE}/attire-and-rings`, priority: 0.8, changeFrequency: 'weekly' },
  { url: `${BASE}/attire-and-rings/bridal-collection`, priority: 0.7, changeFrequency: 'weekly' },
  { url: `${BASE}/planning-tools`, priority: 0.7, changeFrequency: 'monthly' },
  { url: `${BASE}/privacy-policy`, priority: 0.3, changeFrequency: 'yearly' },
  { url: `${BASE}/terms-of-use`, priority: 0.3, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [dbVendors, posts] = await Promise.all([
    getActiveMarketplaceVendors().catch(() => []),
    loadPublishedAdviceIdeasPosts().catch(() => []),
  ])

  const allVendorSlugs = new Set<string>([
    ...dbVendors.map((v) => v.slug),
    ...vendors.map((v) => v.slug),
  ])

  const vendorRoutes: MetadataRoute.Sitemap = Array.from(allVendorSlugs).map((slug) => ({
    url: `${BASE}/vendors/${slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const articleRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE}/advice-and-ideas/${p.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const invitationCategoryRoutes: MetadataRoute.Sitemap = INVITATION_CATEGORIES.map((c) => ({
    url: `${BASE}/invitations/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const invitationProductRoutes: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: `${BASE}/invitations/p/${p.id}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const bridalCategoryRoutes: MetadataRoute.Sitemap = BRIDAL_CATEGORIES.map((c) => ({
    url: `${BASE}/attire-and-rings/bridal-collection/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    ...STATIC_ROUTES,
    ...vendorRoutes,
    ...articleRoutes,
    ...invitationCategoryRoutes,
    ...invitationProductRoutes,
    ...bridalCategoryRoutes,
  ]
}
