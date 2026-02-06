import { createClient } from '@supabase/supabase-js'
import type { AdviceIdeasPost } from '@/data/advice-ideas-posts'

const DEFAULT_SITE_URL = 'https://opusfestaevents.com'

type DbPost = {
  id: string
  slug: string
  title: string
  description: string
  content: string | null
  image_url: string | null
  image_alt: string | null
  author_name: string | null
  author_avatar_url: string | null
  category: string
  read_time: number | null
  featured: boolean | null
  published_at: string | null
  advice_ideas_post_metrics?: { views: number | null; saves: number | null } | { views: number | null; saves: number | null }[] | null
}

const formatDate = (value: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date)
}

const resolveMetrics = (metrics: DbPost['advice_ideas_post_metrics']) => {
  if (!metrics) return { views: 0, saves: 0 }
  const value = Array.isArray(metrics) ? metrics[0] : metrics
  return {
    views: value?.views ?? 0,
    saves: value?.saves ?? 0,
  }
}

const mapDbPost = (row: DbPost): AdviceIdeasPost => {
  const metrics = resolveMetrics(row.advice_ideas_post_metrics)
  const publishedAt = row.published_at || undefined
  const date = formatDate(row.published_at)

  return {
    id: Number.isNaN(Number(row.id)) ? row.id : Number(row.id),
    slug: row.slug,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url || '/images/advice-ideas/post-1.webp',
    imageAlt: row.image_alt || row.title,
    date: date || '—',
    category: row.category,
    author: row.author_name || 'OPUS FESTA',
    avatarUrl: row.author_avatar_url || '/images/advice-ideas/avatars/1.webp',
    readTime: row.read_time ?? 5,
    featured: row.featured ?? false,
    content: row.content ?? undefined,
    publishedAt,
    views: metrics.views,
    saves: metrics.saves,
  }
}

const getSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || (!anonKey && !serviceRoleKey)) {
    throw new Error('Missing Supabase environment variables for Advice & Ideas')
  }

  const key = serviceRoleKey || anonKey || ''

  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export type AdviceIdeasQuery = {
  limit?: number
  offset?: number
  category?: string
  search?: string
  featured?: boolean
  sort?: 'latest' | 'trending'
}

export const fetchAdviceIdeasPosts = async (query: AdviceIdeasQuery = {}) => {
  const supabase = getSupabaseServerClient()

  let request = supabase
    .from('advice_ideas_posts')
    .select(
      [
        'id',
        'slug',
        'title',
        'description',
        'content',
        'image_url',
        'image_alt',
        'author_name',
        'author_avatar_url',
        'category',
        'read_time',
        'featured',
        'published_at',
        'advice_ideas_post_metrics(views,saves)',
      ].join(','),
    )
    .eq('published', true)

  if (query.category) {
    request = request.eq('category', query.category)
  }

  if (query.featured !== undefined) {
    request = request.eq('featured', query.featured)
  }

  if (query.search) {
    const sanitized = query.search.replace(/%/g, '\\%').replace(/_/g, '\\_')
    request = request.or(
      `title.ilike.%${sanitized}%,description.ilike.%${sanitized}%,category.ilike.%${sanitized}%,author_name.ilike.%${sanitized}%`,
    )
  }

  if (query.sort === 'trending') {
    request = request
      .order('saves', { foreignTable: 'advice_ideas_post_metrics', ascending: false })
      .order('views', { foreignTable: 'advice_ideas_post_metrics', ascending: false })
      .order('published_at', { ascending: false })
  } else {
    request = request.order('published_at', { ascending: false })
  }

  if (query.limit) {
    const offset = query.offset ?? 0
    request = request.range(offset, offset + query.limit - 1)
  }

  const { data, error } = await request

  if (error || !data) {
    return []
  }

  return data.map(mapDbPost)
}

export const fetchAdviceIdeasPostBySlug = async (slug: string) => {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('advice_ideas_posts')
    .select(
      [
        'id',
        'slug',
        'title',
        'description',
        'content',
        'image_url',
        'image_alt',
        'author_name',
        'author_avatar_url',
        'category',
        'read_time',
        'featured',
        'published_at',
        'advice_ideas_post_metrics(views,saves)',
      ].join(','),
    )
    .eq('slug', slug)
    .eq('published', true)
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }

  return mapDbPost(data as DbPost)
}

export const getAdviceIdeasSiteUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL
}
