'use server'

import { revalidatePath } from 'next/cache'
import { revalidateWebsite as revalidateWebsitePaths } from '@/lib/revalidate'
import { requireAdminRole, type AdminAccessRole } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  slugify,
  type AdviceIdeasBodySection,
  type AdviceIdeasPostRow,
  type AdviceIdeasSectionId,
  type AdviceIdeasSeedComment,
} from '@/lib/cms/advice-ideas'

// Direct admin writes to advice_ideas_posts are restricted to internal staff.
// External writers go through /contribute/* and the staging
// advice_article_submissions table; the 'author' role no longer grants admin
// article access.
const ARTICLE_WRITE_ROLES: AdminAccessRole[] = ['owner', 'admin', 'editor']
const ARTICLE_MANAGE_ROLES: AdminAccessRole[] = ['owner', 'admin', 'editor']

async function revalidateWebsite(slug?: string): Promise<void> {
  const paths = ['/advice-and-ideas']
  if (slug) paths.push(`/advice-and-ideas/${slug}`)
  await revalidateWebsitePaths(...paths)
}

export type PostUpsertInput = {
  id?: string
  slug: string
  title: string
  description: string
  excerpt: string
  category: string
  section_id: AdviceIdeasSectionId
  author_name: string
  author_role: string
  author_avatar_url: string
  read_time: number
  featured: boolean
  published: boolean
  published_at: string
  hero_media_type: 'image' | 'video'
  hero_media_src: string
  hero_media_alt: string
  hero_media_poster: string
  body: AdviceIdeasBodySection[]
  seed_comments: AdviceIdeasSeedComment[]
}

export async function createAdvicePost(input: PostUpsertInput): Promise<{ id: string }> {
  await requireAdminRole(ARTICLE_WRITE_ROLES)
  const supabase = createSupabaseAdminClient()
  const slug = (input.slug || slugify(input.title)).trim()
  if (!slug) throw new Error('Slug is required')

  const payload = {
    slug,
    title: input.title,
    description: input.description,
    excerpt: input.excerpt,
    category: input.category,
    section_id: input.section_id,
    author_name: input.author_name || null,
    author_role: input.author_role || null,
    author_avatar_url: input.author_avatar_url || null,
    read_time: Math.max(1, Math.round(input.read_time || 1)),
    featured: !!input.featured,
    published: !!input.published,
    published_at: input.published_at || new Date().toISOString(),
    hero_media_type: input.hero_media_type,
    hero_media_src: input.hero_media_src,
    hero_media_alt: input.hero_media_alt,
    hero_media_poster: input.hero_media_poster || null,
    body: input.body,
    seed_comments: input.seed_comments,
  }

  const { data, error } = await supabase
    .from('advice_ideas_posts')
    .insert(payload)
    .select('id')
    .single()
  if (error) throw error

  revalidatePath('/operations/articles')
  await revalidateWebsite(slug)
  return { id: data.id }
}

export async function updateAdvicePost(id: string, input: PostUpsertInput): Promise<void> {
  await requireAdminRole(ARTICLE_MANAGE_ROLES)
  const supabase = createSupabaseAdminClient()
  const slug = (input.slug || slugify(input.title)).trim()
  if (!slug) throw new Error('Slug is required')

  const payload = {
    slug,
    title: input.title,
    description: input.description,
    excerpt: input.excerpt,
    category: input.category,
    section_id: input.section_id,
    author_name: input.author_name || null,
    author_role: input.author_role || null,
    author_avatar_url: input.author_avatar_url || null,
    read_time: Math.max(1, Math.round(input.read_time || 1)),
    featured: !!input.featured,
    published: !!input.published,
    published_at: input.published_at,
    hero_media_type: input.hero_media_type,
    hero_media_src: input.hero_media_src,
    hero_media_alt: input.hero_media_alt,
    hero_media_poster: input.hero_media_poster || null,
    body: input.body,
    seed_comments: input.seed_comments,
  }

  const { error } = await supabase.from('advice_ideas_posts').update(payload).eq('id', id)
  if (error) throw error

  revalidatePath('/operations/articles')
  revalidatePath(`/operations/articles/${id}`)
  await revalidateWebsite(slug)
}

export async function deleteAdvicePost(id: string): Promise<void> {
  await requireAdminRole(ARTICLE_MANAGE_ROLES)
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('advice_ideas_posts')
    .select('slug')
    .eq('id', id)
    .maybeSingle<Pick<AdviceIdeasPostRow, 'slug'>>()

  const { error } = await supabase.from('advice_ideas_posts').delete().eq('id', id)
  if (error) throw error

  revalidatePath('/operations/articles')
  await revalidateWebsite(row?.slug)
}

export async function togglePostPublished(id: string, published: boolean): Promise<void> {
  await requireAdminRole(ARTICLE_MANAGE_ROLES)
  const supabase = createSupabaseAdminClient()
  const { data: row, error } = await supabase
    .from('advice_ideas_posts')
    .update({ published })
    .eq('id', id)
    .select('slug')
    .single()
  if (error) throw error

  revalidatePath('/operations/articles')
  await revalidateWebsite(row?.slug)
}

export async function togglePostFeatured(id: string, featured: boolean): Promise<void> {
  await requireAdminRole(ARTICLE_MANAGE_ROLES)
  const supabase = createSupabaseAdminClient()
  const { data: row, error } = await supabase
    .from('advice_ideas_posts')
    .update({ featured })
    .eq('id', id)
    .select('slug')
    .single()
  if (error) throw error

  revalidatePath('/operations/articles')
  await revalidateWebsite(row?.slug)
}

export async function uploadAdviceMedia(formData: FormData): Promise<{ url: string; type: 'image' | 'video' }> {
  await requireAdminRole(ARTICLE_WRITE_ROLES)
  const file = formData.get('file') as File | null
  const slug = (formData.get('slug') as string | null) ?? '_orphan'
  if (!file) throw new Error('No file provided')

  const supabase = createSupabaseAdminClient()
  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `advice-and-ideas/${slug}/${Date.now()}-${crypto.randomUUID()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('website-media')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadErr) throw uploadErr

  const { data } = supabase.storage.from('website-media').getPublicUrl(path)
  const type: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image'
  return { url: data.publicUrl, type }
}
