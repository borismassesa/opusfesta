'use server'

import { revalidatePath } from 'next/cache'
import { hasPermission } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { ContentIdeaKind } from './ContentIdeasClient'

export type ActionResult = { ok: true } | { ok: false; error: string }

async function gate(): Promise<ActionResult | null> {
  if (!(await hasPermission('growth.admin'))) {
    return { ok: false, error: "You don't have permission to edit the Content Ideas bank." }
  }
  return null
}

export async function addContentIdea(input: {
  kind: ContentIdeaKind
  title: string
  description: string
  details: Record<string, string>
  sortOrder: number
}): Promise<ActionResult> {
  const denied = await gate()
  if (denied) return denied
  if (!input.title.trim()) return { ok: false, error: 'Title is required.' }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('growth_content_ideas').insert({
    kind: input.kind,
    title: input.title.trim(),
    description: input.description.trim(),
    details: input.details,
    sort_order: input.sortOrder,
  })
  if (error) return { ok: false, error: error.message || 'Could not save.' }

  revalidatePath('/growth/content-ideas')
  return { ok: true }
}

export async function updateContentIdea(
  id: string,
  patch: Partial<{ title: string; description: string; details: Record<string, string>; sortOrder: number }>,
): Promise<ActionResult> {
  const denied = await gate()
  if (denied) return denied

  const supabase = createSupabaseAdminClient()
  const update: Record<string, unknown> = {}
  if (patch.title !== undefined) update.title = patch.title.trim()
  if (patch.description !== undefined) update.description = patch.description.trim()
  if (patch.details !== undefined) update.details = patch.details
  if (patch.sortOrder !== undefined) update.sort_order = patch.sortOrder

  const { error } = await supabase.from('growth_content_ideas').update(update).eq('id', id)
  if (error) return { ok: false, error: error.message || 'Could not save.' }

  revalidatePath('/growth/content-ideas')
  return { ok: true }
}

export async function deleteContentIdea(id: string): Promise<ActionResult> {
  const denied = await gate()
  if (denied) return denied

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('growth_content_ideas').delete().eq('id', id)
  if (error) return { ok: false, error: error.message || 'Could not delete.' }

  revalidatePath('/growth/content-ideas')
  return { ok: true }
}
