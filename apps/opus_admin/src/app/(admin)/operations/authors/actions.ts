'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminRole, type AdminAccessRole } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { AdviceIdeasAuthorRow } from '@/lib/cms/advice-ideas'

// Author profiles are admin-managed only. External writers maintain their
// byline through /contribute/* drafts, not by editing advice_ideas_authors
// rows directly.
const AUTHOR_MANAGE_ROLES: AdminAccessRole[] = ['owner', 'admin', 'editor']
const AUTHOR_EDIT_ROLES: AdminAccessRole[] = ['owner', 'admin', 'editor']

async function revalidateWebsite(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_WEBSITE_URL
  const secret = process.env.WEBSITE_REVALIDATE_SECRET
  if (!url || !secret) return
  try {
    await fetch(`${url}/api/revalidate?path=/advice-and-ideas`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}` },
    })
  } catch {}
}

export type AuthorUpsertInput = Omit<AdviceIdeasAuthorRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
}

function normalizeKey(raw: string, fallback: string): string {
  const v = (raw || fallback || '').trim()
  if (!v) throw new Error('Author key/name is required')
  return v
}

export async function upsertAdviceAuthor(input: AuthorUpsertInput): Promise<{ id: string }> {
  await requireAdminRole(AUTHOR_EDIT_ROLES)
  const supabase = createSupabaseAdminClient()
  const key = normalizeKey(input.key, input.name)
  const payload: Record<string, unknown> = {
    key,
    name: input.name.trim() || key,
    role: input.role,
    bio: input.bio,
    initials: input.initials,
    avatar_url: input.avatar_url || null,
    sort_order: Math.max(0, Math.round(input.sort_order || 0)),
  }

  if (typeof (input as { email?: string }).email === 'string') {
    payload.email = ((input as { email?: string }).email || '').trim().toLowerCase() || null
  }

  if (input.id) {
    const { error } = await supabase.from('advice_ideas_authors').update(payload).eq('id', input.id)
    if (error) throw error
    revalidatePath('/operations/authors')
    revalidatePath(`/operations/authors/${input.id}`)
    await revalidateWebsite()
    return { id: input.id }
  }

  const { data, error } = await supabase
    .from('advice_ideas_authors')
    .insert(payload)
    .select('id')
    .single()
  if (error) throw error
  revalidatePath('/operations/authors')
  await revalidateWebsite()
  return { id: data.id }
}

export async function deleteAdviceAuthor(id: string): Promise<void> {
  await requireAdminRole(AUTHOR_MANAGE_ROLES)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('advice_ideas_authors').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/operations/authors')
  await revalidateWebsite()
}

// OF-ADM-AUTHORS-001 — bulk reorder. Recomputes `sort_order` in increments
// of 10 so future inserts can slip between rows without renumbering. We do
// NOT delete + re-insert because that would churn `created_at` and break
// any FKs; one UPDATE per row keeps audit history intact.
export async function reorderAdviceAuthors(orderedIds: string[]): Promise<void> {
  await requireAdminRole(AUTHOR_MANAGE_ROLES)
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) return

  const supabase = createSupabaseAdminClient()
  const updates = orderedIds.map((id, idx) =>
    supabase
      .from('advice_ideas_authors')
      .update({ sort_order: (idx + 1) * 10 })
      .eq('id', id)
  )
  const results = await Promise.all(updates)
  for (const r of results) if (r.error) throw r.error

  revalidatePath('/operations/authors')
  await revalidateWebsite()
}

export async function uploadAuthorAvatar(formData: FormData): Promise<{ url: string }> {
  await requireAdminRole(AUTHOR_EDIT_ROLES)
  const file = formData.get('file') as File | null
  const key = (formData.get('key') as string | null) ?? 'unknown'
  if (!file) throw new Error('No file provided')

  const supabase = createSupabaseAdminClient()
  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `advice-and-ideas/authors/${encodeURIComponent(key)}/${Date.now()}-${crypto.randomUUID()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('website-media')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadErr) throw uploadErr

  const { data } = supabase.storage.from('website-media').getPublicUrl(path)
  return { url: data.publicUrl }
}
