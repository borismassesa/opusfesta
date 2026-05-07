// OF-ADM-AUTHORS-001 — Authors admin page. Server-renders the merged feed
// of active authors + pending invites, then hands the heavy lifting (search,
// filter, reorder) to AuthorsListView on the client.

import { createSupabaseAdminClient } from '@/lib/supabase'
import type { AdviceIdeasAuthorRow } from '@/lib/cms/advice-ideas'
import AuthorsHeader from './AuthorsHeader'
import AuthorsListView from './_authors/AuthorsListView'
import ArticleNavTabs from '../articles/ArticleNavTabs'
import type { AuthorListEntry } from './_authors/types'

export const dynamic = 'force-dynamic'

type AuthorRow = AdviceIdeasAuthorRow & { email?: string | null }

type InviteRow = {
  id: string
  email: string
  full_name: string | null
  article_title: string | null
  status: 'pending' | 'accepted' | 'revoked' | 'expired'
  expires_at: string
  created_at: string
  accepted_submission_id: string | null
}

export default async function AuthorsListPage() {
  const supabase = createSupabaseAdminClient()

  // Three independent queries — running them in parallel cuts wall-clock
  // page load by ~2x on the local Supabase round-trip baseline.
  const [authorsRes, invitesRes, postCountsRes] = await Promise.all([
    supabase
      .from('advice_ideas_authors')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('advice_article_invitations')
      .select(
        'id, email, full_name, article_title, status, expires_at, created_at, accepted_submission_id'
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
    // No FK from posts → authors. Counting by author_name is the cheapest
    // option that keeps the existing schema untouched. If volume grows we'd
    // promote this to a materialized view.
    supabase
      .from('advice_ideas_posts')
      .select('author_name', { head: false })
      .not('author_name', 'is', null),
  ])

  if (authorsRes.error) throw authorsRes.error
  if (invitesRes.error) throw invitesRes.error
  if (postCountsRes.error) throw postCountsRes.error

  const authors = (authorsRes.data ?? []) as AuthorRow[]
  const invites = (invitesRes.data ?? []) as InviteRow[]
  const postRows = (postCountsRes.data ?? []) as Array<{ author_name: string | null }>

  const articleCount = new Map<string, number>()
  for (const row of postRows) {
    const name = (row.author_name ?? '').trim().toLowerCase()
    if (!name) continue
    articleCount.set(name, (articleCount.get(name) ?? 0) + 1)
  }

  const authorEntries: Extract<AuthorListEntry, { kind: 'author' }>[] = authors.map(
    (a) => ({
      kind: 'author',
      id: a.id,
      name: a.name,
      role: a.role || '',
      bio: a.bio || '',
      initials: a.initials,
      avatarUrl: a.avatar_url,
      sortOrder: a.sort_order,
      email: a.email ?? null,
      articleCount: articleCount.get(a.name.trim().toLowerCase()) ?? 0,
    })
  )

  const inviteEntries: Extract<AuthorListEntry, { kind: 'invite' }>[] = invites
    .filter((i) => !i.accepted_submission_id)
    .map((i) => ({
      kind: 'invite',
      id: i.id,
      email: i.email,
      displayName: i.full_name,
      role: null,
      articleTitle: i.article_title,
      status: 'pending' as const,
      invitedAt: i.created_at,
      expiresAt: i.expires_at,
    }))

  const subtitle = `${authorEntries.length} active · ${inviteEntries.length} pending invite${
    inviteEntries.length === 1 ? '' : 's'
  } · bios appear on each Author Card`

  return (
    <div className="pb-12">
      <AuthorsHeader title="Authors" subtitle={subtitle} />
      <ArticleNavTabs />
      <div className="mx-auto max-w-[1200px] px-8 pt-8">
        <AuthorsListView authors={authorEntries} invites={inviteEntries} />
      </div>
    </div>
  )
}
