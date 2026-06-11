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

export async function reviewCategoryRequest(
  requestId: string,
  status: 'approved' | 'rejected',
): Promise<ActionResult> {
  try {
    await gate()
    const { userId } = await auth()
    const admin = createSupabaseAdminClient()

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
        reviewed_by: userId ?? null,
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
