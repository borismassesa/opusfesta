'use server'

import { revalidatePath } from 'next/cache'
import { getCallerEmail, requireAdminRole, type AdminAccessRole } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { AdviceIdeasAuthorRow } from '@/lib/cms/advice-ideas'

// Granting access to other admin users + deleting author rows stay
// restricted — those are privilege-escalation / destructive surfaces.
const AUTHOR_MANAGE_ROLES: AdminAccessRole[] = ['owner', 'admin', 'editor']
// Editing bios + avatars is widened to include 'author' so writers can
// maintain their own profile.
const AUTHOR_EDIT_ROLES: AdminAccessRole[] = ['owner', 'admin', 'editor', 'author']

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

export type AuthorAccessInput = {
  email: string
  full_name?: string
}

function normalizeKey(raw: string, fallback: string): string {
  const v = (raw || fallback || '').trim()
  if (!v) throw new Error('Author key/name is required')
  return v
}

export async function grantAdviceAuthorAccess(input: AuthorAccessInput): Promise<void> {
  await requireAdminRole(AUTHOR_MANAGE_ROLES)
  const email = input.email.trim().toLowerCase()
  if (!email || !email.includes('@')) throw new Error('A valid email is required')

  const supabase = createSupabaseAdminClient()
  const { data: existing, error: existingError } = await supabase
    .from('admin_whitelist')
    .select('role')
    .eq('email', email)
    .maybeSingle<{ role: string }>()
  if (existingError) throw existingError

  if (existing?.role && existing.role !== 'author') {
    const { error } = await supabase
      .from('admin_whitelist')
      .update({
        full_name: input.full_name?.trim() || null,
        is_active: true,
        notes: 'Already has broader admin access; kept existing role.',
      })
      .eq('email', email)
    if (error) throw error
    revalidatePath('/operations/authors')
    return
  }

  const { error } = await supabase
    .from('admin_whitelist')
    .upsert(
      {
        email,
        full_name: input.full_name?.trim() || null,
        role: 'author',
        is_active: true,
        notes: 'Advice & Ideas author access',
      },
      { onConflict: 'email' }
    )
  if (error) throw error
  revalidatePath('/operations/authors')
}

export async function upsertAdviceAuthor(input: AuthorUpsertInput): Promise<{ id: string }> {
  const role = await requireAdminRole(AUTHOR_EDIT_ROLES)
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

  // Authors (role='author') are restricted to their own bio row, identified by
  // the email column. They cannot edit other authors and cannot create rows
  // owned by anyone else — server forces email = caller email.
  if (role === 'author') {
    const callerEmail = await getCallerEmail()
    if (!callerEmail) throw new Error('Cannot resolve caller email')

    if (input.id) {
      const { data: existing, error: existingError } = await supabase
        .from('advice_ideas_authors')
        .select('email')
        .eq('id', input.id)
        .maybeSingle<{ email: string | null }>()
      if (existingError) throw existingError
      const ownerEmail = existing?.email?.trim().toLowerCase() ?? null
      if (ownerEmail !== callerEmail) {
        throw new Error("Authors can only edit their own profile.")
      }
      // Lock the email field server-side so it can't be reassigned.
      payload.email = callerEmail
    } else {
      payload.email = callerEmail
    }
  } else if (typeof (input as { email?: string }).email === 'string') {
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
