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
  firstName: '',
  lastName: '',
  yearsInBusiness: '',
  bio: '',
  description: '',
  houseNumber: '',
  street: '',
  ward: '',
  district: '',
  region: '',
  landmark: '',
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
  if (state.kind === 'no-application') {
    return {
      source: { kind: 'no-application' },
      initialProfile: EMPTY_PROFILE,
      canEdit: false,
    }
  }
  if (state.kind === 'pending-approval') {
    return {
      source: { kind: 'pending-approval' },
      initialProfile: EMPTY_PROFILE,
      canEdit: false,
    }
  }
  if (state.kind === 'suspended') {
    return {
      source: { kind: 'suspended' },
      initialProfile: EMPTY_PROFILE,
      canEdit: false,
    }
  }

  const supabase = await createClerkSupabaseServerClient()
  const { data, error } = await supabase
    .from('vendors')
    .select(
      'business_name, years_in_business, bio, description, location, contact_info, social_links, draft_content',
    )
    .eq('id', state.vendor.id)
    .single<
      VendorRowFromDb & {
        draft_content: { about?: Partial<VendorRowFromDb> } | null
      }
    >()

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

  // If a staged draft exists for the About section, show that in the editor so
  // the vendor sees their unpublished work; otherwise fall back to the live
  // columns. The editor's draft state (Unpublished badge, Publish button) is
  // driven by the `hasDraft` flag below.
  const draftAbout = data.draft_content?.about
  const liveOnlyRow: VendorRowFromDb = {
    business_name: data.business_name,
    years_in_business: data.years_in_business,
    bio: data.bio,
    description: data.description,
    location: data.location,
    contact_info: data.contact_info,
    social_links: data.social_links,
  }
  const editorRow: VendorRowFromDb = draftAbout
    ? { ...liveOnlyRow, ...draftAbout }
    : liveOnlyRow

  return {
    source: { kind: 'live' },
    initialProfile: dbVendorToProfile(editorRow),
    canEdit,
  }
}

export default async function StorefrontAboutPage() {
  const aboutProps = await loadProfile()
  return <AboutEditor {...aboutProps} />
}
