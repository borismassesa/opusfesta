import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  formatPublishedDate,
  formatReadTime,
  type AdviceIdeasPostRow,
} from '@/lib/cms/advice-ideas'
import { resolveMediaUrl } from '@/app/(admin)/cms/advice-and-ideas/_media'
import { HeaderActionsSlot } from '@/components/HeaderPortals'
import PostsTableActions from './PostsTableActions'
import SetArticlesHeading from './SetArticlesHeading'

export const dynamic = 'force-dynamic'

const SECTION_LABELS: Record<string, string> = {
  'featured-stories': 'Featured Stories',
  'planning-guides': 'Planning Guides',
  'real-weddings': 'Real Weddings',
  'themes-styles': 'Themes & Styles',
  'etiquette-wording': 'Etiquette & Wording',
  'bridal-shower-ideas': 'Bridal Shower Ideas',
  'honeymoon-ideas': 'Honeymoon Ideas',
}

function formatSectionLabel(id: string): string {
  return (
    SECTION_LABELS[id] ??
    id.split('-').map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(' ')
  )
}

type SearchParams = { q?: string; section?: string; status?: 'all' | 'published' | 'draft' }

export default async function AdvicePostsListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const q = (sp.q ?? '').trim()
  const section = (sp.section ?? '').trim()
  const status = sp.status ?? 'all'

  const supabase = createSupabaseAdminClient()
  let query = supabase
    .from('advice_ideas_posts')
    .select(
      'id, slug, title, excerpt, category, section_id, featured, published, published_at, read_time, hero_media_type, hero_media_src, author_name, updated_at'
    )
    .order('featured', { ascending: false })
    .order('published_at', { ascending: false })

  if (q) query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,slug.ilike.%${q}%`)
  if (section) query = query.eq('section_id', section)
  if (status === 'published') query = query.eq('published', true)
  else if (status === 'draft') query = query.eq('published', false)

  const { data, error } = await query
  if (error) throw error

  const posts = (data ?? []) as Array<
    Pick<
      AdviceIdeasPostRow,
      | 'id'
      | 'slug'
      | 'title'
      | 'excerpt'
      | 'category'
      | 'section_id'
      | 'featured'
      | 'published'
      | 'published_at'
      | 'read_time'
      | 'hero_media_type'
      | 'hero_media_src'
      | 'author_name'
      | 'updated_at'
    >
  >

  const publishedCount = posts.filter((p) => p.published).length
  const draftCount = posts.length - publishedCount
  const subtitle =
    posts.length === 0
      ? 'No articles yet'
      : `${publishedCount} published · ${draftCount} draft${draftCount === 1 ? '' : 's'}`

  return (
    <div className="px-8 pt-8 pb-12">
      <SetArticlesHeading title="Articles" subtitle={subtitle} />
      <HeaderActionsSlot>
        <Link
          href="/operations/articles/new"
          className="flex items-center gap-2 text-sm font-semibold text-white bg-[#C9A0DC] hover:bg-[#b97fd0] px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New article
        </Link>
      </HeaderActionsSlot>
      <div className="max-w-[1200px] mx-auto space-y-8">
        <form
          className="flex flex-wrap items-center gap-3 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
          action="/operations/articles"
        >
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search title, excerpt, or slug…"
            className="flex-1 min-w-[260px] px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A0DC] focus:border-transparent"
          />
          <select
            name="section"
            defaultValue={section}
            className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A0DC]"
          >
            <option value="">All sections</option>
            <option value="planning-guides">Planning Guides</option>
            <option value="real-weddings">Real Weddings</option>
            <option value="themes-styles">Themes & Styles</option>
            <option value="etiquette-wording">Etiquette & Wording</option>
            <option value="bridal-shower-ideas">Bridal Shower Ideas</option>
            <option value="honeymoon-ideas">Honeymoon Ideas</option>
            <option value="featured-stories">Featured Stories</option>
          </select>
          <select
            name="status"
            defaultValue={status}
            className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A0DC]"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <button
            type="submit"
            className="text-sm font-semibold text-[#7E5896] hover:text-[#5c3f72] px-4 py-2.5 rounded-lg hover:bg-[#F8F0FB]"
          >
            Filter
          </button>
        </form>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col />
              <col className="w-[150px]" />
              <col className="w-[120px]" />
              <col className="w-[150px]" />
              <col className="w-[120px]" />
              <col className="w-[160px]" />
            </colgroup>
            <thead className="bg-gray-50/60 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3.5">Article</th>
                <th className="px-5 py-3.5">Section</th>
                <th className="px-5 py-3.5">Author</th>
                <th className="px-5 py-3.5">Published</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 align-middle">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {p.hero_media_src ? (
                          p.hero_media_type === 'video' ? (
                            // eslint-disable-next-line jsx-a11y/media-has-caption
                            <video src={resolveMediaUrl(p.hero_media_src)} className="w-full h-full object-cover" muted />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={resolveMediaUrl(p.hero_media_src)} alt="" className="w-full h-full object-cover" />
                          )
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/operations/articles/${p.id}`}
                          className="font-semibold text-gray-900 hover:text-[#7E5896] block truncate"
                          title={p.title || '(untitled)'}
                        >
                          {p.title || '(untitled)'}
                        </Link>
                        <p className="text-xs text-gray-500 truncate mt-0.5">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-700 whitespace-nowrap truncate" title={p.section_id}>
                    {formatSectionLabel(p.section_id)}
                  </td>
                  <td className="px-5 py-4 text-gray-700 whitespace-nowrap truncate" title={p.author_name ?? '—'}>
                    {p.author_name ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                    <div>{formatPublishedDate(p.published_at)}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{formatReadTime(p.read_time)}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        p.published
                          ? 'inline-flex items-center text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full'
                          : 'inline-flex items-center text-[11px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full'
                      }
                    >
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <PostsTableActions
                      id={p.id}
                      slug={p.slug}
                      published={p.published}
                    />
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">
                    No articles match your filters. Click “New article” to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
