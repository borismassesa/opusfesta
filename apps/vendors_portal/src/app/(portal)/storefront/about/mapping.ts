/**
 * Wireable fields on the About page that have backing columns on `vendors`
 * today. Other fields (firstName/lastName/languages/style/personality/
 * homeMarket/serviceMarkets/hours/responseTimeHours/locallyOwned) are
 * Phase 5 schema work — they remain on useOnboardingDraft for now.
 */

export type DbProfile = {
  businessName: string
  yearsInBusiness: string // editor uses string, DB stores INTEGER (or null)
  bio: string

  street: string
  street2: string
  city: string
  region: string
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
  years_in_business: number | null
  bio: string | null
  location: Record<string, unknown> | null
  contact_info: Record<string, unknown> | null
  social_links: Record<string, unknown> | null
}

const EMPTY: DbProfile = {
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

function readString(obj: Record<string, unknown> | null | undefined, key: string): string {
  if (!obj) return ''
  const v = obj[key]
  return typeof v === 'string' ? v : ''
}

export function dbVendorToProfile(row: VendorRowFromDb | null | undefined): DbProfile {
  if (!row) return EMPTY
  return {
    businessName: row.business_name ?? '',
    yearsInBusiness:
      typeof row.years_in_business === 'number' && Number.isFinite(row.years_in_business)
        ? String(row.years_in_business)
        : '',
    bio: row.bio ?? '',

    street: readString(row.location, 'street'),
    street2: readString(row.location, 'street2'),
    city: readString(row.location, 'city'),
    region: readString(row.location, 'region'),
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
    location: {
      ...baseLocation,
      street: profile.street.trim(),
      street2: profile.street2.trim(),
      city: profile.city.trim(),
      region: profile.region.trim(),
      postalCode: profile.postalCode.trim(),
    },
    contact_info: {
      ...baseContact,
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
