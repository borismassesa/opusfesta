import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

// ─────────────────────────────────────────────────────────────────────────────
//  Per-guest wedding packages (Essential / Elegant / Signature).
//  Note: tier `id`s remain 'lite' | 'classic' | 'signature' as stable internal keys
//  (feature-matrix columns, ticket art, cart accents); only display names changed.
//  Pricing is per guest × guest count; the chosen invitation design is a separate
//  styling axis. Bilingual (English + Kiswahili). Source: New_OpusPass_Packages.xlsx.
//  Stored as a single CMS config — page_key 'opus-pass-packages', section_key
//  'wedding-tiers' — so prices + the feature matrix are admin-editable.
// ─────────────────────────────────────────────────────────────────────────────

export type PackageTier = {
  id: string // 'lite' | 'classic' | 'signature'
  name: string
  name_sw: string
  featured: boolean
  price_per_guest: number
  best_for: string
  best_for_sw: string
}

export type PackageFeatureGroup = 'included' | 'upgrade' | 'addon'

export type PackageFeature = {
  id: string
  group: PackageFeatureGroup
  label: string
  label_sw: string
  // Plain-language explanation (sheet 3); optional, used for tooltips/expanders.
  description: string
  description_sw: string
  // Per-tier cell value keyed by tier id, e.g. 'Yes' | '—' | 'Add-on' | '1 template'.
  values: Record<string, string>
  values_sw: Record<string, string>
}

export type PackagesContent = {
  heading: string
  heading_sw: string
  subheading: string
  subheading_sw: string
  note: string
  note_sw: string
  tiers: PackageTier[]
  features: PackageFeature[]
}

const F = (
  id: string,
  group: PackageFeatureGroup,
  label: string,
  label_sw: string,
  values: Record<string, string>,
  values_sw: Record<string, string>,
  description = '',
  description_sw = '',
): PackageFeature => ({ id, group, label, label_sw, description, description_sw, values, values_sw })

const YES = { lite: 'Yes', classic: 'Yes', signature: 'Yes' }
const YES_SW = { lite: 'Ndiyo', classic: 'Ndiyo', signature: 'Ndiyo' }
const REQ = { lite: 'On request', classic: 'On request', signature: 'On request' }
const REQ_SW = { lite: 'Kwa ombi', classic: 'Kwa ombi', signature: 'Kwa ombi' }
const CLASSIC_UP = { lite: '—', classic: 'Yes', signature: 'Yes' }
const CLASSIC_UP_SW = { lite: '—', classic: 'Ndiyo', signature: 'Ndiyo' }
const SIG_ONLY = { lite: '—', classic: '—', signature: 'Yes' }
const SIG_ONLY_SW = { lite: '—', classic: '—', signature: 'Ndiyo' }

export const PACKAGES_FALLBACK: PackagesContent = {
  heading: 'Choose your package',
  heading_sw: 'Chagua kifurushi chako',
  subheading: 'Pay per guest — everything scales with your headcount.',
  subheading_sw: 'Lipa kwa kila mgeni — kila kitu kinakua kulingana na idadi ya wageni.',
  note: 'Events above 600 guests get a capped, discounted per-guest rate.',
  note_sw: 'Matukio ya wageni zaidi ya 600 yanapata bei ya punguzo (kikomo).',
  tiers: [
    { id: 'lite', name: 'Essential', name_sw: 'Essential', featured: false, price_per_guest: 1500, best_for: 'Everything you need', best_for_sw: 'Kila unachohitaji' },
    { id: 'classic', name: 'Elegant', name_sw: 'Elegant', featured: true, price_per_guest: 2500, best_for: 'More customization & style', best_for_sw: 'Ubinafsishaji na mtindo zaidi' },
    { id: 'signature', name: 'Signature', name_sw: 'Signature', featured: false, price_per_guest: 4000, best_for: 'Premium, exclusive experience', best_for_sw: 'Hali ya kifahari, ya kipekee' },
  ],
  features: [
    // ── Included in every package ──
    F('dashboard', 'included', 'Event dashboard (create event, guest list, contacts)', 'Dashibodi ya tukio (tengeneza tukio, orodha ya wageni, anwani)', YES, YES_SW,
      "The host's control room for the whole event: create the event, add and organize the guest list, and collect contacts — all in one place.",
      'Sehemu ya mwandaaji ya kusimamia tukio lote: kutengeneza tukio, kuingiza na kupanga orodha ya wageni, na kukusanya anwani — vyote mahali pamoja.'),
    F('card', 'included', 'Digital invitation card', 'Kadi ya mwaliko ya kidijitali', YES, YES_SW,
      'A modern invitation sent to the phone instead of paper, with all event details — date, venue, and time.',
      'Mwaliko wa kisasa unaotumwa kwa simu badala ya karatasi, wenye maelezo yote ya tukio — tarehe, mahali, na muda.'),
    F('ticket', 'included', 'Digital ticket + barcode (for scanning)', 'Tiketi ya kidijitali + barcode (kwa ukaguzi)', YES, YES_SW,
      'Each guest receives a separate digital ticket with a unique barcode, scanned at the door to verify the guest — usable once only.',
      'Kila mgeni hupokea tiketi tofauti ya kidijitali yenye barcode ya kipekee, inayokaguliwa mlangoni — inatumika mara moja tu.'),
    F('delivery', 'included', 'Card delivery (WhatsApp / SMS / Email)', 'Utoaji wa kadi (WhatsApp / SMS / Barua pepe)', YES, YES_SW,
      'The card and ticket are delivered straight to the guest via WhatsApp, SMS, or email — instant, no postage cost.',
      'Kadi na tiketi hutumwa moja kwa moja kwa mgeni kupitia WhatsApp, SMS, au barua pepe — haraka, bila gharama ya posta.'),
    F('messages', 'included', 'Send invite messages', 'Kutuma ujumbe wa mialiko', YES, YES_SW,
      'The host can message all guests at once — invitations, reminders, or quick updates such as a venue or time change.',
      'Mwandaaji anaweza kutuma ujumbe kwa wageni wote kwa pamoja — mialiko, vikumbusho, au taarifa za haraka.'),
    F('checkin', 'included', 'Entrance barcode scan check-in', 'Ukaguzi wa barcode mlangoni', YES, YES_SW,
      'At the gate, the ticket barcode is scanned with a phone to verify the guest. It stops fake invitees and makes entry fast.',
      'Mlangoni, barcode ya tiketi hukaguliwa kwa simu kuthibitisha mgeni. Huzuia waalikwa wa uongo na hurahisisha kuingia.'),
    // ── Tier upgrades ──
    F('design', 'upgrade', 'Card design', 'Muundo wa kadi',
      { lite: '1 template', classic: 'Custom branded', signature: 'Bespoke + animation' },
      { lite: 'Kiolezo 1', classic: 'Maalum, chapa ya OpusFesta', signature: 'Ya kipekee + mwendo' }),
    F('rsvp', 'upgrade', 'RSVP dashboard', 'Dashibodi ya RSVP',
      { lite: 'Basic headcount', classic: 'Live confirmations & check-ins', signature: 'Live + analytics' },
      { lite: 'Idadi ya msingi', classic: 'Uthibitisho & ukaguzi wa moja kwa moja', signature: 'Live + uchambuzi' },
      'A live list showing how many guests have confirmed, who has arrived, and when. It helps you plan food and drink budgets accurately.',
      'Orodha ya moja kwa moja inayoonyesha ni wageni wangapi wamethibitisha, nani amefika, na lini.'),
    F('reminders', 'upgrade', 'Notification reminders', 'Vikumbusho vya arifa', CLASSIC_UP, CLASSIC_UP_SW,
      'Guests receive automatic reminders before the event — nudging them to confirm and cutting down no-shows.',
      'Wageni hupokea vikumbusho vya kiotomatiki kabla ya tukio — kuwakumbusha kuthibitisha na kupunguza wasiohudhuria.'),
    F('pledge', 'upgrade', 'Pledge / contribution collection', 'Ukusanyaji wa michango', CLASSIC_UP, CLASSIC_UP_SW,
      'Guest contributions are channeled straight into one event account, with a full report of everyone who contributed.',
      'Michango ya wageni hupelekwa moja kwa moja kwenye akaunti moja ya tukio, na ripoti kamili ya kila aliyechangia.'),
    F('seating', 'upgrade', 'Seat planning', 'Mpangilio wa viti', CLASSIC_UP, CLASSIC_UP_SW,
      'Arrange tables and assign guests to their seats before the event day — respecting family and VIP seating.',
      'Panga meza na uwapangie wageni viti vyao kabla ya siku ya tukio — kuheshimu mpangilio wa familia na wageni maalum.'),
    F('thankyou', 'upgrade', 'Thank-you message blast', 'Ujumbe wa shukrani', CLASSIC_UP, CLASSIC_UP_SW,
      "After the event, a thank-you message is sent to all guests at once via WhatsApp or SMS, in the host's name.",
      'Baada ya tukio, ujumbe wa shukrani hutumwa kwa wageni wote kwa pamoja kwa WhatsApp au SMS, kwa jina la mwenyeji.'),
    F('guestbook', 'upgrade', 'Digital guestbook', 'Kitabu cha wageni cha kidijitali', SIG_ONLY, SIG_ONLY_SW,
      'Guests write greetings, well-wishes, and share photos digitally. The host keeps all these memories together, forever.',
      'Wageni huandika salamu, matakwa mema, na kushiriki picha kidijitali. Mwenyeji hupata kumbukumbu zote mahali pamoja milele.'),
    F('coordinator', 'upgrade', 'Dedicated coordinator', 'Mratibu maalum', SIG_ONLY, SIG_ONLY_SW,
      'One person from OpusFesta who manages your event from start to finish — card design, the guest list, and the event day itself.',
      'Mtu mmoja kutoka OpusFesta anayesimamia tukio lako tangu mwanzo hadi mwisho.'),
    F('website', 'upgrade', 'Wedding website', 'Tovuti ya harusi',
      { lite: 'Add-on', classic: 'Add-on', signature: 'Included' },
      { lite: 'Nyongeza', classic: 'Nyongeza', signature: 'Imejumuishwa' },
      "A personal wedding website with the couple's story, schedule, venue map, photos, and RSVP.",
      'Tovuti binafsi ya harusi yenye hadithi ya wapendanao, ratiba, ramani ya ukumbi, picha, na RSVP.'),
    // ── Add-ons (available on any package) ──
    F('paper', 'addon', 'Paper card prints', 'Machapisho ya kadi (karatasi)', REQ, REQ_SW,
      'For guests who prefer something physical, or as a keepsake, the digital card can be printed on quality card stock on request.',
      'Kwa wageni wanaopendelea kitu cha kushika au kwa kumbukumbu, kadi ya kidijitali huchapishwa kwenye karatasi bora kwa ombi.'),
    F('sms', 'addon', 'Extra SMS credits', 'Salio la ziada la SMS', REQ, REQ_SW),
    F('door', 'addon', 'On-site door scanning attendant', 'Mhudumu wa kukagua mlangoni', REQ, REQ_SW,
      "OpusFesta sends a trained attendant to scan guests' tickets at the entrance on the event day.",
      'OpusFesta hutuma mhudumu aliyefunzwa kuja kukagua tiketi za wageni mlangoni siku ya tukio.'),
  ],
}

export async function loadPackagesContent(): Promise<PackagesContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return PACKAGES_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-packages')
      .eq('section_key', 'wedding-tiers')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<PackagesContent>
      | undefined
    if (stored) {
      return {
        heading: stored.heading ?? PACKAGES_FALLBACK.heading,
        heading_sw: stored.heading_sw ?? PACKAGES_FALLBACK.heading_sw,
        subheading: stored.subheading ?? PACKAGES_FALLBACK.subheading,
        subheading_sw: stored.subheading_sw ?? PACKAGES_FALLBACK.subheading_sw,
        note: stored.note ?? PACKAGES_FALLBACK.note,
        note_sw: stored.note_sw ?? PACKAGES_FALLBACK.note_sw,
        tiers:
          stored.tiers && Array.isArray(stored.tiers) && stored.tiers.length > 0
            ? stored.tiers
            : PACKAGES_FALLBACK.tiers,
        features:
          stored.features && Array.isArray(stored.features) && stored.features.length > 0
            ? stored.features
            : PACKAGES_FALLBACK.features,
      }
    }
    return PACKAGES_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] packages load failed', err)
    return PACKAGES_FALLBACK
  }
}
