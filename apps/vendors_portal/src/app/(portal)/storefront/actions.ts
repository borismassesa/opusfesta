'use server'

import { revalidatePath } from 'next/cache'
import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'

export type PublishResult =
  | { ok: true }
  | { ok: false; error: string; reason?: 'stale' | 'permission' | 'no-draft' | 'unknown' }

/**
 * Publish the staged storefront draft.
 *
 * `vendors.draft_content` is structured by section:
 *   { about: {...}, packages: [...], services_offered: [...], team: [...], faqs: [...], awards: [...], gallery: [...] }
 *
 * On publish we flatten section drafts into a single live-columns patch and
 * apply it. The about section already stores its keys in live-column shape
 * (business_name, years_in_business, bio, location, contact_info, social_links)
 * so they merge straight in. Top-level keys outside `about` (packages,
 * services_offered, team, faqs, awards, gallery) are copied as-is to the live
 * row.
 *
 * After the live update lands, draft_content is cleared so subsequent saves
 * start a fresh draft.
 */
export async function publishStorefront(): Promise<PublishResult> {
  const state = await getCurrentVendor()
  if (state.kind !== 'live') {
    return {
      ok: false,
      reason: 'unknown',
      error:
        state.kind === 'no-env'
          ? 'Configuration error — please contact support.'
          : state.kind === 'pending-approval'
            ? 'Your vendor application is awaiting OpusFesta verification.'
            : state.kind === 'suspended'
              ? 'Your vendor account is suspended. Contact OpusFesta support.'
              : "You haven't started a vendor application yet.",
    }
  }

  const supabase = await createClerkSupabaseServerClient()
  const current = await supabase
    .from('vendors')
    .select('draft_content')
    .eq('id', state.vendor.id)
    .single<{ draft_content: Record<string, unknown> | null }>()

  if (current.error) {
    if (
      current.error.code === '42501' ||
      /permission denied/i.test(current.error.message)
    ) {
      return {
        ok: false,
        reason: 'permission',
        error: 'You need owner or manager role to publish.',
      }
    }
    return { ok: false, reason: 'unknown', error: 'Could not load draft. Try again.' }
  }

  const draft = current.data?.draft_content
  if (!draft || Object.keys(draft).length === 0) {
    return { ok: false, reason: 'no-draft', error: 'Nothing to publish — no staged changes.' }
  }

  // Flatten: section keys (`about`) merge into the patch in their live-column
  // shape; non-section keys are copied to top level as live columns.
  const livePatch: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(draft)) {
    if (key === 'about' && value && typeof value === 'object') {
      Object.assign(livePatch, value)
    } else {
      livePatch[key] = value
    }
  }
  livePatch.draft_content = null

  // GAP 5: keep `application_snapshot` consistent with the live columns so
  // the admin operations review page (which reads from the snapshot) and
  // the public website (which reads structured columns + snapshot) both see
  // the latest published storefront. We patch only the snapshot keys whose
  // value just changed, so vendors with no snapshot stay unaffected and the
  // structured fields onboarding never collected (style, personality, etc.)
  // are not clobbered.
  const snapshotPatch: Record<string, unknown> = {}
  if ('business_name' in livePatch) snapshotPatch.businessName = livePatch.business_name
  if ('bio' in livePatch) snapshotPatch.bio = livePatch.bio
  if ('years_in_business' in livePatch) {
    snapshotPatch.yearsInBusiness =
      typeof livePatch.years_in_business === 'number'
        ? String(livePatch.years_in_business)
        : livePatch.years_in_business
  }
  if ('packages' in livePatch) snapshotPatch.packages = livePatch.packages
  if ('awards' in livePatch) {
    const a = livePatch.awards
    if (typeof a === 'string') snapshotPatch.awards = a
    if (Array.isArray(a)) snapshotPatch.awardCertificates = a
  }
  if ('faqs' in livePatch) snapshotPatch.faqs = livePatch.faqs
  if ('team' in livePatch) snapshotPatch.team = livePatch.team
  if ('contact_info' in livePatch && typeof livePatch.contact_info === 'object' && livePatch.contact_info) {
    const c = livePatch.contact_info as Record<string, unknown>
    if (typeof c.phone === 'string') snapshotPatch.phone = c.phone
    if (typeof c.email === 'string') snapshotPatch.email = c.email
    if (typeof c.whatsapp === 'string') snapshotPatch.whatsapp = c.whatsapp
  }
  if ('social_links' in livePatch && typeof livePatch.social_links === 'object' && livePatch.social_links) {
    snapshotPatch.socials = livePatch.social_links
  }
  if ('location' in livePatch && typeof livePatch.location === 'object' && livePatch.location) {
    const loc = livePatch.location as Record<string, unknown>
    if (typeof loc.city === 'string') snapshotPatch.city = loc.city
    if (typeof loc.region === 'string') snapshotPatch.region = loc.region
    if (typeof loc.street === 'string') snapshotPatch.street = loc.street
    if (typeof loc.street2 === 'string') snapshotPatch.street2 = loc.street2
    if (typeof loc.postalCode === 'string') snapshotPatch.postalCode = loc.postalCode
    if (typeof loc.homeMarket === 'string') snapshotPatch.homeMarket = loc.homeMarket
    if (Array.isArray(loc.serviceMarkets)) snapshotPatch.serviceMarkets = loc.serviceMarkets
  }

  const { error } = await supabase
    .from('vendors')
    .update(livePatch)
    .eq('id', state.vendor.id)

  if (error) {
    if (error.code === '42501' || /permission denied/i.test(error.message)) {
      return {
        ok: false,
        reason: 'permission',
        error: 'You need owner or manager role to publish.',
      }
    }
    return { ok: false, reason: 'unknown', error: 'Could not publish. Please try again.' }
  }

  // Best-effort: merge the snapshot patch on top of the existing snapshot so
  // admin review / public profile see the new values. We read-modify-write
  // because Supabase JS doesn't expose the JSONB `||` operator. Failure
  // here is logged but doesn't fail the publish — the structured columns
  // are already updated and remain authoritative for fields they cover.
  if (Object.keys(snapshotPatch).length > 0) {
    const snapRead = await supabase
      .from('vendors')
      .select('application_snapshot')
      .eq('id', state.vendor.id)
      .single<{ application_snapshot: Record<string, unknown> | null }>()
    if (!snapRead.error) {
      const merged = {
        ...(snapRead.data?.application_snapshot ?? {}),
        ...snapshotPatch,
      }
      const snapWrite = await supabase
        .from('vendors')
        .update({ application_snapshot: merged })
        .eq('id', state.vendor.id)
      if (snapWrite.error) {
        console.warn(
          `[publish] snapshot merge failed: ${snapWrite.error.code} ${snapWrite.error.message}`,
        )
      }
    }
  }

  revalidatePath('/storefront/about')
  revalidatePath('/storefront/packages')
  revalidatePath('/storefront/services')
  revalidatePath('/storefront/photos')
  revalidatePath('/storefront/team')
  revalidatePath('/storefront/faq')
  revalidatePath('/storefront/recognition')
  return { ok: true }
}

export async function discardStorefrontDraft(): Promise<PublishResult> {
  const state = await getCurrentVendor()
  if (state.kind !== 'live') {
    return {
      ok: false,
      reason: 'unknown',
      error:
        state.kind === 'no-env'
          ? 'Configuration error — please contact support.'
          : state.kind === 'pending-approval'
            ? 'Your vendor application is awaiting OpusFesta verification.'
            : state.kind === 'suspended'
              ? 'Your vendor account is suspended. Contact OpusFesta support.'
              : "You haven't started a vendor application yet.",
    }
  }

  const supabase = await createClerkSupabaseServerClient()
  const { error } = await supabase
    .from('vendors')
    .update({ draft_content: null })
    .eq('id', state.vendor.id)

  if (error) {
    if (error.code === '42501' || /permission denied/i.test(error.message)) {
      return {
        ok: false,
        reason: 'permission',
        error: 'You need owner or manager role to discard the draft.',
      }
    }
    return { ok: false, reason: 'unknown', error: 'Could not discard draft. Try again.' }
  }

  revalidatePath('/storefront/about')
  revalidatePath('/storefront/packages')
  revalidatePath('/storefront/services')
  revalidatePath('/storefront/photos')
  revalidatePath('/storefront/team')
  revalidatePath('/storefront/faq')
  revalidatePath('/storefront/recognition')
  return { ok: true }
}

/**
 * Server-side: does the current vendor have any staged storefront draft?
 * Used by the storefront layout to render the "Unpublished draft" banner +
 * Publish/Discard buttons.
 */
export async function hasStorefrontDraft(): Promise<boolean> {
  const state = await getCurrentVendor()
  if (state.kind !== 'live') return false
  try {
    const supabase = await createClerkSupabaseServerClient()
    const { data } = await supabase
      .from('vendors')
      .select('draft_content')
      .eq('id', state.vendor.id)
      .single<{ draft_content: Record<string, unknown> | null }>()
    const d = data?.draft_content
    return !!(d && Object.keys(d).length > 0)
  } catch {
    return false
  }
}
