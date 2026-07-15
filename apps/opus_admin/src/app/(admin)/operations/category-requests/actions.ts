'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { requirePermission } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'

export type ActionResult = { ok: true } | { ok: false; error: string }

async function gate() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')
  await requirePermission('vendor.read')
}

/**
 * Resolve the Supabase users.id for the current admin Clerk session, used to
 * stamp `reviewed_by` (a uuid column referencing public.users). Returns null
 * if the admin doesn't yet have a public.users row — review still proceeds,
 * just without a stamped reviewer for that row.
 */
async function resolveAdminUserId(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  clerkUserId: string
): Promise<string | null> {
  const { data, error } = await admin
    .from('users')
    .select('id')
    .eq('clerk_id', clerkUserId)
    .maybeSingle<{ id: string }>()
  if (error) {
    console.warn(`[admin] users lookup failed for clerk_id=${clerkUserId}: ${error.message}`)
    return null
  }
  return data?.id ?? null
}

export async function reviewCategoryRequest(
  requestId: string,
  status: 'approved' | 'rejected',
): Promise<ActionResult> {
  try {
    await gate()
    const { userId } = await auth()
    const admin = createSupabaseAdminClient()
    const reviewerId = userId ? await resolveAdminUserId(admin, userId) : null

    // Find the request to get vendor_id + requested_label (needed for approve)
    const { data: req, error: fetchErr } = await admin
      .from('vendor_category_requests')
      .select('vendor_id, requested_label')
      .eq('id', requestId)
      .single<{ vendor_id: string; requested_label: string }>()

    if (fetchErr || !req) {
      return { ok: false, error: fetchErr?.message ?? 'Request not found' }
    }

    // Mark the request reviewed
    const { error: updateErr } = await admin
      .from('vendor_category_requests')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
      })
      .eq('id', requestId)

    if (updateErr) return { ok: false, error: updateErr.message }

    revalidatePath('/operations/category-requests')
    revalidatePath('/operations/categories')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
