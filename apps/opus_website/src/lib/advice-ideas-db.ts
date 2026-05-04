import { createSupabaseServerClient } from '@/lib/supabase'
import {
  adviceIdeasAuthors,
  adviceIdeasPosts,
  adviceIdeasTopics,
  type AdviceIdeasAuthor,
  type AdviceIdeasBlock,
  type AdviceIdeasBodySection,
  type AdviceIdeasPost,
  type AdviceIdeasSeedComment,
  type AdviceIdeasSectionId,
} from '@/lib/advice-ideas'

type AdviceIdeasPostRow = {
  id: string
  slug: string
  title: string
  description: string | null
  excerpt: string | null
  category: string | null
  section_id: string | null
  author_name: string | null
  author_role: string | null
  author_avatar_url: string | null
  read_time: number | null
  featured: boolean | null
  published_at: string | null
  hero_media_type: string | null
  hero_media_src: string | null
  hero_media_alt: string | null
  hero_media_poster: string | null
  body: unknown
  seed_comments: unknown
}

type AdviceIdeasAuthorRow = {
  key: string
  name: string
  role: string | null
  bio: string | null
  initials: string | null
  avatar_url: string | null
}

const SECTION_IDS = new Set<AdviceIdeasSectionId>(
  adviceIdeasTopics.map((topic) => topic.id)
)

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function normalizeSectionId(value: string | null): AdviceIdeasSectionId {
  return value && SECTION_IDS.has(value as AdviceIdeasSectionId)
    ? (value as AdviceIdeasSectionId)
    : 'planning-guides'
}

function formatDate(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date()
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatReadTime(minutes: number | null): string {
  return `${Math.max(1, Math.round(minutes ?? 1))} min read`
}

function normalizeBlocks(value: unknown): AdviceIdeasBlock[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((block): AdviceIdeasBlock[] => {
    if (!isRecord(block)) return []
    const type = block.type

    if (type === 'paragraph') {
      return [{ type, text: readString(block.text) }]
    }
    if (type === 'subheading') {
      return [{ type, text: readString(block.text) }]
    }
    if (type === 'list') {
      return [
        {
          type,
          ordered: Boolean(block.ordered),
          items: Array.isArray(block.items)
            ? block.items.filter((item): item is string => typeof item === 'string')
            : [],
        },
      ]
    }
    if (type === 'quote') {
      return [
        {
          type,
          quote: readString(block.quote),
          attribution: readString(block.attribution) || undefined,
        },
      ]
    }
    if (type === 'tip') {
      return [
        {
          type,
          title: readString(block.title),
          text: readString(block.text),
        },
      ]
    }
    if (type === 'image') {
      return [
        {
          type,
          src: readString(block.src),
          alt: readString(block.alt),
          caption: readString(block.caption) || undefined,
        },
      ]
    }
    if (type === 'video') {
      return [
        {
          type,
          src: readString(block.src),
          poster: readString(block.poster) || undefined,
          alt: readString(block.alt),
          caption: readString(block.caption) || undefined,
        },
      ]
    }
    if (type === 'gallery') {
      return [
        {
          type,
          items: Array.isArray(block.items)
            ? block.items
                .filter(isRecord)
                .map((item) => ({
                  src: readString(item.src),
                  alt: readString(item.alt),
                }))
                .filter((item) => item.src)
            : [],
        },
      ]
    }

    return []
  })
}

function normalizeBody(value: unknown): AdviceIdeasBodySection[] {
  if (!Array.isArray(value)) return []

  return value
    .filter(isRecord)
    .map((section, index) => ({
      id: readString(section.id) || `section-${index + 1}`,
      label: readString(section.label) || undefined,
      heading: readString(section.heading) || `Section ${index + 1}`,
      blocks: normalizeBlocks(section.blocks),
    }))
}

function normalizeSeedComments(value: unknown): AdviceIdeasSeedComment[] {
  if (!Array.isArray(value)) return []

  return value.filter(isRecord).map((comment, index) => ({
    id: readString(comment.id) || `comment-${index + 1}`,
    name: readString(comment.name) || 'Reader',
    body: readString(comment.body),
    date: readString(comment.date),
    likes:
      typeof comment.likes === 'number' && Number.isFinite(comment.likes)
        ? comment.likes
        : 0,
  }))
}

function mapPost(row: AdviceIdeasPostRow): AdviceIdeasPost {
  const sectionId = normalizeSectionId(row.section_id)
  const fallbackImage = '/assets/images/coupleswithpiano.jpg'

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || row.excerpt || row.title,
    excerpt: row.excerpt || row.description || '',
    category:
      row.category ||
      adviceIdeasTopics.find((topic) => topic.id === sectionId)?.label ||
      'Planning Guides',
    sectionId,
    date: formatDate(row.published_at),
    readTime: formatReadTime(row.read_time),
    author: row.author_name || 'OpusFesta Editorial',
    authorRole: row.author_role || '',
    featured: Boolean(row.featured),
    heroMedia: {
      type: row.hero_media_type === 'video' ? 'video' : 'image',
      src: row.hero_media_src || fallbackImage,
      alt: row.hero_media_alt || row.title,
      poster: row.hero_media_poster || undefined,
    },
    body: normalizeBody(row.body),
    seedComments: normalizeSeedComments(row.seed_comments),
  }
}

export async function loadPublishedAdviceIdeasPosts(): Promise<AdviceIdeasPost[]> {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('advice_ideas_posts')
      .select(
        `id, slug, title, description, excerpt, category, section_id,
         author_name, author_role, author_avatar_url, read_time, featured,
         published_at, hero_media_type, hero_media_src, hero_media_alt,
         hero_media_poster, body, seed_comments`
      )
      .eq('published', true)
      .order('published_at', { ascending: true })

    if (error) throw error
    const posts = (data ?? []).map((row) => mapPost(row as AdviceIdeasPostRow))
    return posts
  } catch (error) {
    console.warn(
      '[opus_website] falling back to static advice posts:',
      error instanceof Error ? error.message : error
    )
    return adviceIdeasPosts
  }
}

export async function loadAdviceIdeasAuthors(): Promise<Record<string, AdviceIdeasAuthor>> {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('advice_ideas_authors')
      .select('key, name, role, bio, initials, avatar_url')
      .order('sort_order', { ascending: true })

    if (error) throw error

    return (data ?? []).reduce<Record<string, AdviceIdeasAuthor>>(
      (acc, row) => {
        const author = row as AdviceIdeasAuthorRow
        const value: AdviceIdeasAuthor = {
          name: author.name,
          role: author.role ?? '',
          bio: author.bio ?? '',
          initials: author.initials || initialsFromName(author.name),
          avatarUrl: author.avatar_url ?? undefined,
        }
        acc[author.name] = value
        acc[author.key] = value
        return acc
      },
      { ...adviceIdeasAuthors }
    )
  } catch (error) {
    console.warn(
      '[opus_website] falling back to static advice authors:',
      error instanceof Error ? error.message : error
    )
    return adviceIdeasAuthors
  }
}

export function getAuthorFromMap(
  authors: Record<string, AdviceIdeasAuthor>,
  name: string
): AdviceIdeasAuthor {
  return (
    authors[name] ?? {
      name,
      role: '',
      initials: initialsFromName(name),
      bio: '',
    }
  )
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 3)
}
