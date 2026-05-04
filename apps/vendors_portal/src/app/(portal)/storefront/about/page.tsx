import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import {
  dbVendorToProfile,
  type DbProfile,
  type VendorRowFromDb,
} from './mapping'
import AboutEditor, { type AboutSource } from './AboutEditor'
import LocationAndCapacityEditor, {
  type LocationAndCapacityInitial,
} from './LocationAndCapacityEditor'

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
  locationAndCapacity: LocationAndCapacityInitial
}> {
  const state = await getCurrentVendor()

  const emptyLocation: LocationAndCapacityInitial = {
    capacityMin: null,
    capacityMax: null,
    lat: null,
    lng: null,
  }
  if (state.kind === 'no-env') {
    return {
      source: { kind: 'no-env' },
      initialProfile: EMPTY_PROFILE,
      canEdit: false,
      locationAndCapacity: emptyLocation,
    }
  }
  if (state.kind === 'no-application') {
    return {
      source: { kind: 'no-application' },
      initialProfile: EMPTY_PROFILE,
      canEdit: false,
      locationAndCapacity: emptyLocation,
    }
  }
  if (state.kind === 'pending-approval') {
    return {
      source: { kind: 'pending-approval' },
      initialProfile: EMPTY_PROFILE,
      canEdit: false,
      locationAndCapacity: emptyLocation,
    }
  }
  if (state.kind === 'suspended') {
    return {
      source: { kind: 'suspended' },
      initialProfile: EMPTY_PROFILE,
      canEdit: false,
      locationAndCapacity: emptyLocation,
    }
  }

  const supabase = await createClerkSupabaseServerClient()
  const { data, error } = await supabase
    .from('vendors')
    .select(
      'business_name, years_in_business, bio, location, contact_info, social_links, draft_content, capacity, lat, lng',
    )
    .eq('id', state.vendor.id)
    .single<
      VendorRowFromDb & {
        draft_content: { about?: Partial<VendorRowFromDb> } | null
        capacity: { min?: number; max?: number } | null
        lat: number | null
        lng: number | null
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
    locationAndCapacity: {
      capacityMin: data.capacity?.min ?? null,
      capacityMax: data.capacity?.max ?? null,
      lat: data.lat,
      lng: data.lng,
    },
  }
}

export default async function StorefrontAboutPage() {
  const { locationAndCapacity, ...aboutProps } = await loadProfile()
  return (
    <>
      <AboutEditor {...aboutProps} />
      <div className="px-6 lg:px-10">
        <LocationAndCapacityEditor
          initial={locationAndCapacity}
          canEdit={aboutProps.canEdit}
        />
      </div>
    </>
  )
}
