import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import type { PackageDraft } from '@/lib/onboarding/packages'
import { dbPackagesToUi } from './mapping'
import { ensurePackageIds } from './actions'
import PackagesEditor, { type PackagesSource } from './PackagesEditor'

async function loadPackages(): Promise<{
  source: PackagesSource
  initialPackages: PackageDraft[]
  canEdit: boolean
}> {
  const state = await getCurrentVendor()

  if (state.kind === 'no-env') {
    return { source: { kind: 'no-env' }, initialPackages: [], canEdit: false }
  }
  if (state.kind === 'no-application') {
    return { source: { kind: 'no-application' }, initialPackages: [], canEdit: false }
  }
  if (state.kind === 'pending-approval') {
    return { source: { kind: 'pending-approval' }, initialPackages: [], canEdit: false }
  }
  if (state.kind === 'suspended') {
    return { source: { kind: 'suspended' }, initialPackages: [], canEdit: false }
  }

  const supabase = await createClerkSupabaseServerClient()
  let { data, error } = await supabase
    .from('vendors')
    .select('packages')
    .eq('id', state.vendor.id)
    .single<{ packages: unknown }>()

  if (error) {
    throw new Error(
      `[storefront/packages] vendors query failed: ${error.code} ${error.message}`,
    )
  }
  if (!data) {
    throw new Error(
      `[storefront/packages] vendor row not found after membership probe (vendor_id=${state.vendor.id})`,
    )
  }

  // Lazy ID self-heal: if any package entry lacks an `id`, persist freshly
  // assigned IDs once so saveBadge has a stable target to find. Without this
  // the mapper assigns a fresh UUID per render and saveBadge's findIndex
  // would always miss for idless rows. ensurePackageIds is RLS-bound; staff
  // role no-ops gracefully.
  const hasIdlessEntry =
    Array.isArray(data.packages) &&
    (data.packages as Array<Record<string, unknown>>).some(
      (e) => !e || typeof e !== 'object' || typeof e.id !== 'string',
    )
  if (hasIdlessEntry) {
    const heal = await ensurePackageIds()
    if (heal.ok && heal.healed > 0) {
      const refetch = await supabase
        .from('vendors')
        .select('packages')
        .eq('id', state.vendor.id)
        .single<{ packages: unknown }>()
      if (!refetch.error && refetch.data) {
        data = refetch.data
      }
    }
  }

  const canEdit =
    state.vendor.role === 'owner' || state.vendor.role === 'manager'

  return {
    source: { kind: 'live' },
    initialPackages: dbPackagesToUi(data.packages),
    canEdit,
  }
}

export default async function StorefrontPackagesPage() {
  const props = await loadPackages()
  return <PackagesEditor {...props} />
}
