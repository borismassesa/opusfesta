import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import { getServicesForCategory } from '@/lib/onboarding/services'
import ServicesEditor, { type ServicesSource } from './ServicesEditor'
import { dbServicesToUi, type DbServiceEntry } from './mapping'

type VendorServicesRow = {
  services_offered: DbServiceEntry[] | null
}

async function loadServices(): Promise<{
  source: ServicesSource
  presets: Array<{ id: string; label: string }>
  initialPresetIds: string[]
  initialCustomServices: string[]
  canEdit: boolean
  category: string | null
}> {
  const state = await getCurrentVendor()

  if (state.kind === 'no-env') {
    return {
      source: { kind: 'no-env' },
      presets: getServicesForCategory(null),
      initialPresetIds: [],
      initialCustomServices: [],
      canEdit: false,
      category: null,
    }
  }
  if (state.kind === 'no-application') {
    return {
      source: { kind: 'no-application' },
      presets: getServicesForCategory(null),
      initialPresetIds: [],
      initialCustomServices: [],
      canEdit: false,
      category: null,
    }
  }
  if (state.kind === 'pending-approval') {
    return {
      source: { kind: 'pending-approval' },
      presets: getServicesForCategory(null),
      initialPresetIds: [],
      initialCustomServices: [],
      canEdit: false,
      category: null,
    }
  }
  if (state.kind === 'suspended') {
    return {
      source: { kind: 'suspended' },
      presets: getServicesForCategory(null),
      initialPresetIds: [],
      initialCustomServices: [],
      canEdit: false,
      category: null,
    }
  }

  const supabase = await createClerkSupabaseServerClient()
  const { data, error } = await supabase
    .from('vendors')
    .select('services_offered')
    .eq('id', state.vendor.id)
    .single<VendorServicesRow>()

  if (error) {
    throw new Error(
      `[storefront/services] vendors query failed: ${error.code} ${error.message}`,
    )
  }
  if (!data) {
    // The membership probe in getCurrentVendor() succeeded, but the vendors
    // row is unreachable — typically this means the row was deleted between
    // the two queries, or RLS started filtering it. Surface as a hard error
    // so error.tsx renders rather than showing an "empty live" editor that
    // would overwrite a row the user may not own.
    throw new Error(
      `[storefront/services] vendor row not found after membership probe (vendor_id=${state.vendor.id})`,
    )
  }

  const ui = dbServicesToUi(data.services_offered, state.vendor.category)
  // Per migration 056, services edits via vendors UPDATE require owner or
  // manager. Staff can read but not write — UI disables Save for them.
  const canEdit = state.vendor.role === 'owner' || state.vendor.role === 'manager'

  return {
    source: { kind: 'live' },
    presets: getServicesForCategory(state.vendor.category),
    initialPresetIds: ui.specialServices,
    initialCustomServices: ui.customServices,
    canEdit,
    category: state.vendor.category,
  }
}

export default async function StorefrontServicesPage() {
  const props = await loadServices()
  return <ServicesEditor {...props} />
}
