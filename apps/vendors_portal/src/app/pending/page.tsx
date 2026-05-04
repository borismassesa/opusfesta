import { redirect } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import PendingClient, {
  type PendingVariant,
  type VerificationProgress,
} from './PendingClient'

export const dynamic = 'force-dynamic'

type DocRow = {
  doc_type: string
  status: 'pending_review' | 'approved' | 'rejected'
}

type AgreementRow = { id: string }

/**
 * Build a per-step status snapshot for the verification timeline.
 *
 * Used by the `verification-pending` and `needs-corrections` variants so the
 * /pending timeline can show whether the vendor has uploaded TIN, license,
 * and signed the agreement — rather than rendering all three middle steps as
 * "In progress" simultaneously, which is what the static variant copy did.
 *
 * Reads via the admin client to stay decoupled from RLS / Clerk JWT template
 * configuration, the same trust boundary getCurrentVendor() uses (the
 * caller is already authenticated by Clerk middleware, and we scope by
 * `vendor_id`).
 */
async function loadVerificationProgress(
  vendorId: string,
): Promise<VerificationProgress> {
  const admin = createSupabaseAdminClient()

  const [docsRes, agreementRes] = await Promise.all([
    admin
      .from('vendor_verification_documents')
      .select('doc_type, status')
      .eq('vendor_id', vendorId)
      .eq('is_latest', true)
      .returns<DocRow[]>(),
    admin
      .from('vendor_agreements')
      .select('id')
      .eq('vendor_id', vendorId)
      .limit(1)
      .maybeSingle<AgreementRow>(),
  ])

  const docs = docsRes.data ?? []
  const tin = docs.find((d) => d.doc_type === 'tin_certificate') ?? null
  const license =
    docs.find(
      (d) =>
        d.doc_type === 'business_license' ||
        d.doc_type === 'sole_proprietor_declaration',
    ) ?? null

  return {
    tin: tin ? { status: tin.status } : null,
    license: license ? { status: license.status } : null,
    agreementSigned: !!agreementRes.data,
  }
}

export default async function PendingPage() {
  const state = await getCurrentVendor()

  // An approved vendor that lands here (e.g. via stale link or back button)
  // gets sent back to the dashboard so they don't see a "wait for approval"
  // page they've outgrown.
  if (state.kind === 'live') {
    redirect('/dashboard')
  }

  let variant: PendingVariant
  let progress: VerificationProgress | null = null

  switch (state.kind) {
    case 'pending-approval':
      switch (state.status) {
        case 'application_in_progress':
          variant = 'application-in-progress'
          break
        case 'verification_pending':
          variant = 'verification-pending'
          progress = await loadVerificationProgress(state.vendorId)
          break
        case 'admin_review':
          variant = 'admin-review'
          break
        case 'needs_corrections':
          variant = 'needs-corrections'
          progress = await loadVerificationProgress(state.vendorId)
          break
      }
      break
    case 'suspended':
      variant = 'suspended'
      break
    case 'no-application':
      variant = 'no-application'
      break
    case 'no-env':
      variant = 'no-env'
      break
  }

  return <PendingClient variant={variant} progress={progress} />

}
