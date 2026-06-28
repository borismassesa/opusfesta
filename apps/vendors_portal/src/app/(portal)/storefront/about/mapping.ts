/**
 * Wireable fields on the About page that have backing columns on `vendors`
 * today. Other fields (firstName/lastName/languages/style/personality/
 * homeMarket/serviceMarkets/hours/responseTimeHours/locallyOwned) are
 * Phase 5 schema work — they remain on useOnboardingDraft for now.
 */

export type DbProfile = {
  businessName: string
  // Public URL of the vendor logo / profile picture (vendors.logo).
  logo: string
  firstName: string
  lastName: string
  yearsInBusiness: string // editor uses string, DB stores INTEGER (or null)
  bio: string
  description: string

  // Tanzania administrative address.
  houseNumber: string
  street: string
  ward: string
  district: string
  region: string
  landmark: string
  postalCode: string

  phone: string
  email: string
  whatsapp: string

  socialWebsite: string
  socialInstagram: string
  socialFacebook: string
  socialTiktok: string
  socialWhatsapp: string
}

export type VendorRowFromDb = {
  business_name: string | null
  logo: string | null
  years_in_business: number | null
  bio: string | null
  description: string | null
  location: Record<string, unknown> | null
  contact_info: Record<string, unknown> | null
  social_links: Record<string, unknown> | null
}

const EMPTY: DbProfile = {
  businessName: '',
  logo: '',
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

function readString(obj: Record<string, unknown> | null | undefined, key: string): string {
  if (!obj) return ''
  const v = obj[key]
  return typeof v === 'string' ? v : ''
}

export function dbVendorToProfile(row: VendorRowFromDb | null | undefined): DbProfile {
  if (!row) return EMPTY
  return {
    businessName: row.business_name ?? '',
    logo: row.logo ?? '',
    firstName: readString(row.contact_info, 'firstName'),
    lastName: readString(row.contact_info, 'lastName'),
    yearsInBusiness:
      typeof row.years_in_business === 'number' && Number.isFinite(row.years_in_business)
        ? String(row.years_in_business)
        : '',
    bio: row.bio ?? '',
    description: row.description ?? '',

    houseNumber: readString(row.location, 'houseNumber'),
    street: readString(row.location, 'street'),
    ward: readString(row.location, 'ward'),
    // Backward compatibility: pre-migration rows stored the locality as `city`.
    district: readString(row.location, 'district') || readString(row.location, 'city'),
    region: readString(row.location, 'region'),
    landmark: readString(row.location, 'landmark'),
    postalCode: readString(row.location, 'postalCode'),

    phone: readString(row.contact_info, 'phone'),
    email: readString(row.contact_info, 'email'),
    whatsapp: readString(row.contact_info, 'whatsapp'),

    socialWebsite: readString(row.social_links, 'website'),
    socialInstagram: readString(row.social_links, 'instagram'),
    socialFacebook: readString(row.social_links, 'facebook'),
    socialTiktok: readString(row.social_links, 'tiktok'),
    socialWhatsapp: readString(row.social_links, 'whatsapp'),
  }
}

/**
 * Build the SUPABASE UPDATE patch from a DbProfile and the current row.
 * Preserves any unknown keys inside the JSONB columns (location/contact_info/
 * social_links) so admin tooling or future code that adds keys outside this
 * schema isn't silently wiped.
 */
export function profileToUpdatePatch(
  profile: DbProfile,
  current: VendorRowFromDb | null | undefined,
): {
  business_name: string
  years_in_business: number | null
  bio: string
  description: string
  location: Record<string, unknown>
  contact_info: Record<string, unknown>
  social_links: Record<string, unknown>
} {
  const trimmedYears = profile.yearsInBusiness.trim()
  const yearsParsed = trimmedYears ? Number.parseInt(trimmedYears, 10) : NaN
  const yearsValue =
    Number.isFinite(yearsParsed) && yearsParsed >= 0 && yearsParsed < 200
      ? yearsParsed
      : null

  const baseLocation = current?.location ?? {}
  const baseContact = current?.contact_info ?? {}
  const baseSocial = current?.social_links ?? {}

  return {
    business_name: profile.businessName.trim(),
    years_in_business: yearsValue,
    bio: profile.bio,
    description: profile.description.trim(),
    location: {
      ...baseLocation,
      houseNumber: profile.houseNumber.trim(),
      street: profile.street.trim(),
      ward: profile.ward.trim(),
      district: profile.district.trim(),
      region: profile.region.trim(),
      landmark: profile.landmark.trim(),
      postalCode: profile.postalCode.trim(),
      // Mirror `city` to District for public-marketplace compatibility, but
      // never blank an existing locality when District is left empty.
      ...(profile.district.trim() ? { city: profile.district.trim() } : {}),
    },
    contact_info: {
      ...baseContact,
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      phone: profile.phone.trim(),
      email: profile.email.trim(),
      whatsapp: profile.whatsapp.trim(),
    },
    social_links: {
      ...baseSocial,
      website: profile.socialWebsite.trim(),
      instagram: profile.socialInstagram.trim(),
      facebook: profile.socialFacebook.trim(),
      tiktok: profile.socialTiktok.trim(),
      whatsapp: profile.socialWhatsapp.trim(),
    },
  }
}

export function profilesEqual(a: DbProfile, b: DbProfile): boolean {
  const keys = Object.keys(EMPTY) as Array<keyof DbProfile>
  for (const k of keys) {
    if (a[k] !== b[k]) return false
  }
  return true
}
