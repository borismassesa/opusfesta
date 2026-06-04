'use server'

import { revalidatePath } from 'next/cache'
import { revalidateOpusPass } from '@/lib/revalidate'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requireAdminRole, type AdminAccessRole } from '@/lib/admin-auth'
import type { InvitationProductRecord } from '@/lib/cms/opus-pass-invitations-products'

// Same role allowlist as /lib/cms/upload-media.ts — keep them in sync.
const PRODUCT_EDIT_ROLES: AdminAccessRole[] = ['owner', 'admin', 'editor']

async function revalidateProductPaths(id?: string): Promise<void> {
  revalidatePath('/cms/opus-pass/invitations/products')
  if (id) revalidatePath(`/cms/opus-pass/invitations/products/${id}`)
  const passPaths = ['/invitations', '/invitations/catalog']
  if (id) passPaths.push(`/invitations/p/${id}`)
  await revalidateOpusPass(...passPaths)
}

export async function upsertInvitationProduct(
  product: InvitationProductRecord,
): Promise<{ id: string }> {
  await requireAdminRole(PRODUCT_EDIT_ROLES)
  const supabase = createSupabaseAdminClient()
  // DB manages timestamps.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { created_at, updated_at, ...body } = product

  const { data, error } = await supabase
    .from('website_invitations_products')
    .upsert(body, { onConflict: 'id' })
    .select('id')
    .single()
  if (error) throw error

  await revalidateProductPaths(data.id)
  return { id: data.id }
}

export async function patchInvitationProduct(
  id: string,
  patch: Partial<Pick<InvitationProductRecord, 'published' | 'sort_order' | 'free_sample'>>,
): Promise<void> {
  await requireAdminRole(PRODUCT_EDIT_ROLES)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_invitations_products')
    .update(patch)
    .eq('id', id)
  if (error) throw error

  await revalidateProductPaths(id)
}

export async function deleteInvitationProduct(id: string): Promise<void> {
  await requireAdminRole(PRODUCT_EDIT_ROLES)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_invitations_products')
    .delete()
    .eq('id', id)
  if (error) throw error

  await revalidateProductPaths(id)
}
