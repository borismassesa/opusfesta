import { createSupabaseServerClient } from '@/lib/supabase'

export type FeatureIconKey =
  | 'calendar-check'
  | 'users'
  | 'shield-check'
  | 'sparkles'
  | 'heart-handshake'
  | 'message-square'
  | 'bell'
  | 'clipboard-list'
  | 'wallet'
  | 'gift'
  | 'map-pin'
  | 'star'

export type ChecklistItem = {
  id: string
  label: string
  weeks: string
  done: boolean
}

export type FeatureCard = {
  id: string
  icon: FeatureIconKey
  title: string
  body: string
}

export type PricingComparisonContent = {
  headline_line_1: string
  headline_line_2: string
  subheadline: string
  cta_label: string
  cta_href: string
  couple_image_url: string
  promo_image_url: string
  promo_heading_line_1: string
  promo_heading_line_2: string
  promo_subheading: string
  checklist_label: string
  checklist: ChecklistItem[]
  features: FeatureCard[]
}

export const PRICING_COMPARISON_FALLBACK: PricingComparisonContent = {
  headline_line_1: 'STRESS-FREE',
  headline_line_2: 'PLANNING.',
  subheadline:
    'Plan your wedding without the chaos. We handle the details so you can enjoy the moment.',
  cta_label: 'Start planning today',
  cta_href: '#',
  couple_image_url: '/assets/images/authentic_couple.jpg',
  promo_image_url: '/assets/images/bridewithumbrella.jpg',
  promo_heading_line_1: 'Your big day.',
  promo_heading_line_2: 'Our priority.',
  promo_subheading: "Everything you need. Nothing you don't.",
  checklist_label: 'Your checklist',
  checklist: [
    { id: 'photographer', label: 'Book photographer', weeks: 'Done', done: true },
    { id: 'invitations', label: 'Send invitations', weeks: 'Done', done: true },
    { id: 'catering', label: 'Confirm catering menu', weeks: '3 wks left', done: false },
    { id: 'seating', label: 'Finalise seating plan', weeks: '6 wks left', done: false },
    { id: 'cake', label: 'Order wedding cake', weeks: '8 wks left', done: false },
  ],
  features: [
    {
      id: 'checklists',
      icon: 'calendar-check',
      title: 'Smart checklists',
      body: 'Personalised to-dos built around your exact wedding date. Get reminders before anything becomes urgent.',
    },
    {
      id: 'guests',
      icon: 'users',
      title: 'Guest list & RSVPs',
      body: 'Collect responses, track dietary needs, and manage seating. All updated in real time.',
    },
    {
      id: 'verified',
      icon: 'shield-check',
      title: 'Verified vendors only',
      body: 'Every vendor on OpusFesta is reviewed and vetted. No surprises, no unreliable listings.',
    },
  ],
}

export async function loadPricingComparisonContent(): Promise<PricingComparisonContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return PRICING_COMPARISON_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'home')
      .eq('section_key', 'pricing-comparison')
      .maybeSingle()
    const stored = data?.content as Partial<PricingComparisonContent> | undefined
    if (stored) {
      return {
        ...PRICING_COMPARISON_FALLBACK,
        ...stored,
        checklist:
          Array.isArray(stored.checklist) && stored.checklist.length > 0
            ? (stored.checklist as ChecklistItem[])
            : PRICING_COMPARISON_FALLBACK.checklist,
        features:
          Array.isArray(stored.features) && stored.features.length > 0
            ? (stored.features as FeatureCard[])
            : PRICING_COMPARISON_FALLBACK.features,
      }
    }
    return PRICING_COMPARISON_FALLBACK
  } catch {
    return PRICING_COMPARISON_FALLBACK
  }
}
