'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { AdviceIdeasAuthorRow } from '@/lib/cms/advice-ideas'

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
  const supabase = createSupabaseAdminClient()
  const key = normalizeKey(input.key, input.name)
  const payload = {
    key,
    name: input.name.trim() || key,
    role: input.role,
    bio: input.bio,
    initials: input.initials,
    avatar_url: input.avatar_url || null,
    sort_order: Math.max(0, Math.round(input.sort_order || 0)),
  }

  if (input.id) {
    const { error } = await supabase.from('advice_ideas_authors').update(payload).eq('id', input.id)
    if (error) throw error
    revalidatePath('/cms/advice-and-ideas/authors')
    revalidatePath(`/cms/advice-and-ideas/authors/${input.id}`)
    await revalidateWebsite()
    return { id: input.id }
  }

  const { data, error } = await supabase
    .from('advice_ideas_authors')
    .insert(payload)
    .select('id')
    .single()
  if (error) throw error
  revalidatePath('/cms/advice-and-ideas/authors')
  await revalidateWebsite()
  return { id: data.id }
}

export async function deleteAdviceAuthor(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('advice_ideas_authors').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/cms/advice-and-ideas/authors')
  await revalidateWebsite()
}

export async function uploadAuthorAvatar(formData: FormData): Promise<{ url: string }> {
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
