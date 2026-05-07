'use server'

// Contributor-side profile management. Backed by the same
// `advice_ideas_authors` table admins manage from /operations/authors —
// keyed by email (LOWER(email) unique index per migration
// 20260504000002_advice_ideas_authors_email). Contributors and admins
// edit the *same row*, no duplication.

import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requireContributorIdentity } from '@/lib/contribute/auth'
import { initialsFromName } from '@/lib/cms/advice-ideas'
import { revalidateWebsite as revalidateWebsitePaths } from '@/lib/revalidate'
import type {
  ContributorProfile,
  ContributorProfileFormInput,
} from './profile-types'

// 5 MB cap matches the contributor cover image — avatars are smaller still.
const AVATAR_MAX_SIZE = 5 * 1024 * 1024
const AVATAR_ACCEPTED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
])

async function loadByEmail(email: string): Promise<ContributorProfile | null> {
  const supabase = createSupabaseAdminClient()
  // Use ilike with the full email to match the LOWER(email) unique index
  // — case-insensitive without needing raw SQL.
  const { data, error } = await supabase
    .from('advice_ideas_authors')
    .select('*')
    .ilike('email', email)
    .maybeSingle<ContributorProfile>()
  if (error) throw error
  return data
}

// Loads the contributor's profile row. Does NOT auto-create — the
// editor renders an empty form when this returns null and the upsert
// below creates the row on first save. Splitting these keeps the GET
// path side-effect-free.
export async function getContributorProfile(): Promise<{
  profile: ContributorProfile | null
  identity: { email: string; name: string | null }
}> {
  const identity = await requireContributorIdentity()
  const profile = await loadByEmail(identity.email)
  return {
    profile,
    identity: { email: identity.email, name: identity.name },
  }
}

export async function updateContributorProfile(
  input: ContributorProfileFormInput
): Promise<{ id: string }> {
  const identity = await requireContributorIdentity()
  const name = input.name.trim()
  if (!name) throw new Error('Name is required.')

  const payload = {
    key: name, // human-readable key; admin can rename later if needed
    name,
    role: input.role.trim(),
    bio: input.bio.trim(),
    initials: (input.initials.trim() || initialsFromName(name)).slice(0, 4).toUpperCase(),
    avatar_url: input.avatar_url.trim() || null,
    email: identity.email,
  }

  const supabase = createSupabaseAdminClient()
  const existing = await loadByEmail(identity.email)

  if (existing) {
    // Defence in depth: only update the row whose email matches the caller.
    // The .ilike + .single resolved this earlier; the .eq('id') here keeps
    // the constraint explicit.
    const { error } = await supabase
      .from('advice_ideas_authors')
      .update(payload)
      .eq('id', existing.id)
    if (error) throw error
    revalidatePath('/contribute/profile')
    revalidatePath('/operations/authors')
    await revalidateWebsitePaths('/advice-and-ideas')
    return { id: existing.id }
  }

  // Race window: between loadByEmail above and this INSERT, another tab /
  // double-click could have inserted a row with the same email. The
  // LOWER(email) unique index will then 23505 us; catch that and fall
  // through to an update by re-looking-up the row.
  const { data, error } = await supabase
    .from('advice_ideas_authors')
    .insert({ ...payload, sort_order: 100 })
    .select('id')
    .single<{ id: string }>()

  if (!error) {
    revalidatePath('/contribute/profile')
    revalidatePath('/operations/authors')
    await revalidateWebsitePaths('/advice-and-ideas')
    return { id: data.id }
  }

  const isUniqueViolation =
    (error as { code?: string }).code === '23505'
  if (!isUniqueViolation) throw error

  // Another writer beat us. Re-fetch and update instead.
  const racedExisting = await loadByEmail(identity.email)
  if (!racedExisting) {
    // Genuinely lost the row in between — surface the original error so
    // the contributor sees something actionable.
    throw error
  }
  const { error: updateError } = await supabase
    .from('advice_ideas_authors')
    .update(payload)
    .eq('id', racedExisting.id)
  if (updateError) throw updateError
  revalidatePath('/contribute/profile')
  revalidatePath('/operations/authors')
  await revalidateWebsitePaths('/advice-and-ideas')
  return { id: racedExisting.id }
}

export async function uploadContributorAvatar(
  formData: FormData
): Promise<{ url: string }> {
  const identity = await requireContributorIdentity()
  const file = formData.get('file')
  if (!(file instanceof File)) throw new Error('No file provided.')
  if (!AVATAR_ACCEPTED_TYPES.has(file.type)) {
    throw new Error('Avatar must be PNG, JPEG, or WebP.')
  }
  if (file.size > AVATAR_MAX_SIZE) {
    throw new Error('Avatar must be 5MB or smaller.')
  }

  const ext = file.type === 'image/png'
    ? 'png'
    : file.type === 'image/webp'
      ? 'webp'
      : 'jpg'
  const path = `advice-and-ideas/authors/contributor-${identity.clerkId}/${Date.now()}-${randomUUID()}.${ext}`

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.storage
    .from('website-media')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw error

  const { data } = supabase.storage.from('website-media').getPublicUrl(path)
  return { url: data.publicUrl }
}
