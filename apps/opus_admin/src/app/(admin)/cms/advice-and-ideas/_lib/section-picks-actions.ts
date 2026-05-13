'use server'

// Server actions for the secondary article-pick sections on
// /advice-and-ideas (Loved by Couples + Our Favorites). Editor Picks
// has its own actions in /operations/articles/actions.ts because it
// uses a different mechanism (`featured_rank` column on the post row,
// not this side table).
//
// Same shape as `reorderFrontPage` — accept the full ordered ID list
// and bulk-replace the section's contents in one shot. That keeps the
// data model simple (no partial-update path) and means the UI can
// always send "this is the desired order" without thinking about
// diffs.

import { revalidatePath } from 'next/cache'
import { revalidateWebsite as revalidateWebsitePaths } from '@/lib/revalidate'
import { requireAdminRole, type AdminAccessRole } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'

const SECTION_MANAGE_ROLES: AdminAccessRole[] = ['owner', 'admin', 'editor']

// Keep in sync with the CHECK constraint in
// supabase/migrations/20260512000003_advice_ideas_section_picks.sql.
// Adding a new section is a 3-file change: this set, the migration's
// CHECK constraint, and the CMS sidebar in `../layout.tsx`.
export type SectionPickKey = 'loved_by_couples' | 'our_favorites'

const SECTION_KEYS: ReadonlySet<SectionPickKey> = new Set([
  'loved_by_couples',
  'our_favorites',
])

function assertSection(key: string): asserts key is SectionPickKey {
  if (!SECTION_KEYS.has(key as SectionPickKey)) {
    throw new Error(`Unknown section key: ${key}`)
  }
}

// Map section keys to the CMS sub-page that surfaces them, so
// revalidation can target both the admin screen and the public site.
const ADMIN_PATH_BY_SECTION: Record<SectionPickKey, string> = {
  loved_by_couples: '/cms/advice-and-ideas/loved-by-couples',
  our_favorites: '/cms/advice-and-ideas/our-favorites',
}

export async function reorderSectionPicks(
  sectionKey: string,
  orderedIds: string[],
): Promise<void> {
  await requireAdminRole(SECTION_MANAGE_ROLES)
  assertSection(sectionKey)
  const supabase = createSupabaseAdminClient()

  // Bulk replace: delete the section's existing rows, insert new ones
  // in slot order. Wrapped in a transaction via RPC would be ideal,
  // but for a list capped at ~5 entries the racy gap is too small to
  // worry about and Supabase JS doesn't expose explicit transactions.
  // The UNIQUE(section_key, rank) constraint prevents partial-state
  // corruption — at worst a concurrent write fails and the caller
  // retries with the latest state.
  const { error: delErr } = await supabase
    .from('advice_ideas_section_picks')
    .delete()
    .eq('section_key', sectionKey)
  if (delErr) throw delErr

  if (orderedIds.length > 0) {
    const rows = orderedIds.map((post_id, i) => ({
      section_key: sectionKey,
      post_id,
      rank: i + 1,
    }))
    const { error: insErr } = await supabase
      .from('advice_ideas_section_picks')
      .insert(rows)
    if (insErr) throw insErr
  }

  revalidatePath(ADMIN_PATH_BY_SECTION[sectionKey])
  revalidatePath('/operations/articles')
  await revalidateWebsitePaths('/advice-and-ideas')
}

// Remove a single article from a section without disturbing the order
// of the others. Used by the per-row ✕ button in the picks list.
export async function removeFromSection(
  sectionKey: string,
  postId: string,
): Promise<void> {
  await requireAdminRole(SECTION_MANAGE_ROLES)
  assertSection(sectionKey)
  const supabase = createSupabaseAdminClient()

  // Pull the current ranked list, drop the target, recompact ranks.
  // The recompact keeps slot numbers contiguous, avoiding gaps that
  // would make the next "Add article" pick an awkward rank.
  const { data: existing, error: readErr } = await supabase
    .from('advice_ideas_section_picks')
    .select('post_id, rank')
    .eq('section_key', sectionKey)
    .order('rank', { ascending: true })
  if (readErr) throw readErr

  const remaining = (existing ?? [])
    .filter((row) => row.post_id !== postId)
    .map((row) => row.post_id)

  await reorderSectionPicks(sectionKey, remaining)
}
