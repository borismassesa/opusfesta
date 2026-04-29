import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import {
  dbVendorToProfile,
  type DbProfile,
  type VendorRowFromDb,
} from './mapping'
import AboutEditor, { type AboutSource } from './AboutEditor'

const EMPTY_PROFILE: DbProfile = {
  businessName: '',
  yearsInBusiness: '',
  bio: '',
  street: '',
  street2: '',
  city: '',
  region: '',
  postalCode: '',
  phone: '',
  email: '',
  whatsapp: '',
  socialWebsite: '',
  socialInstagram: '',
  socialFacebook: '',
  socialTiktok: '',
  socialWhatsapp: '',
}

async function loadProfile(): Promise<{
  source: AboutSource
  initialProfile: DbProfile
  canEdit: boolean
}> {
  const state = await getCurrentVendor()

  if (state.kind === 'no-env') {
    return {
      source: { kind: 'no-env' },
      initialProfile: EMPTY_PROFILE,
      canEdit: false,
    }
  }
  if (state.kind === 'no-membership') {
    return {
      source: { kind: 'no-membership' },
      initialProfile: EMPTY_PROFILE,
      canEdit: false,
    }
  }

  const supabase = await createClerkSupabaseServerClient()
  const { data, error } = await supabase
    .from('vendors')
    .select('business_name, years_in_business, bio, location, contact_info, social_links')
    .eq('id', state.vendor.id)
    .single<VendorRowFromDb>()

  if (error) {
    throw new Error(
      `[storefront/about] vendors query failed: ${error.code} ${error.message}`,
    )
  }
  if (!data) {
    throw new Error(
      `[storefront/about] vendor row not found after membership probe (vendor_id=${state.vendor.id})`,
    )
  }

  const canEdit =
    state.vendor.role === 'owner' || state.vendor.role === 'manager'

  return {
    source: { kind: 'live' },
    initialProfile: dbVendorToProfile(data),
    canEdit,
  }
}

export default async function StorefrontAboutPage() {
  const props = await loadProfile()
  return <AboutEditor {...props} />
}
