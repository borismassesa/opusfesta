import { createSupabaseServerClient } from '@/lib/supabase-server'

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
  headline_line_1: 'NEVER MISS',
  headline_line_2: 'A LEAD.',
  subheadline:
    'Stop juggling DMs, WhatsApp threads, and notebooks. OpusFesta puts every enquiry, quote and booking in one place — so nothing slips through.',
  cta_label: 'Start free',
  cta_href: '/sign-up',
  couple_image_url: '/assets/images/mauzo_crew.jpg',
  promo_image_url: '/assets/images/beautyinbride.jpg',
  promo_heading_line_1: 'Your business.',
  promo_heading_line_2: 'On autopilot.',
  promo_subheading: 'Less admin. More bookings.',
  checklist_label: 'This week',
  checklist: [
    { id: 'quote', label: 'Send quote · Sarah & James', weeks: 'Done', done: true },
    { id: 'deposit', label: 'Confirm deposit · Omar & Priya', weeks: 'Done', done: true },
    { id: 'contract', label: 'Sign contract · Fatuma & Kevin', weeks: 'Today', done: false },
    { id: 'review', label: 'Reply to review · Emma & David', weeks: 'Tomorrow', done: false },
    { id: 'invoice', label: 'Send final invoice · Daniel & Grace', weeks: '2 days', done: false },
  ],
  features: [
    {
      id: 'leads',
      icon: 'message-square',
      title: 'One inbox, every lead',
      body: 'Enquiries from couples land in a single inbox. Reply, send quotes, and follow up — without losing the thread.',
    },
    {
      id: 'pipeline',
      icon: 'clipboard-list',
      title: 'Booking pipeline',
      body: 'Drag deals from enquiry to deposit to confirmed. See where every couple is in your funnel at a glance.',
    },
    {
      id: 'payments',
      icon: 'wallet',
      title: 'Get paid faster',
      body: 'Accept deposits via mobile money or card. Auto-reminders chase the balance — so you keep more of what you earn.',
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
      .eq('page_key', 'vendors_home')
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
