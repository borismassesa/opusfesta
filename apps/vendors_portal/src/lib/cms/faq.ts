import { createSupabaseServerClient } from '@/lib/supabase-server'

export type FaqItem = {
  id: string
  q: string
  a: string
}

export type FaqContent = {
  eyebrow: string
  headline_line_1: string
  headline_line_2: string
  headline_line_3: string
  subheadline: string
  cta_label: string
  cta_href: string
  items: FaqItem[]
}

export const FAQ_FALLBACK: FaqContent = {
  eyebrow: '',
  headline_line_1: 'Everything',
  headline_line_2: 'you need',
  headline_line_3: 'to know.',
  subheadline: "Still have questions? Our vendor success team is one message away.",
  cta_label: 'Talk to our team',
  cta_href: '/sign-up',
  items: [
    {
      id: 'q1',
      q: 'Is it really free to join?',
      a: 'Yes. Creating your storefront, listing services, and receiving leads are free on the Starter plan. You only pay if you upgrade to Pro for advanced tools, or stop using OpusFesta. No setup fees, no credit card to start.',
    },
    {
      id: 'q2',
      q: 'How does OpusFesta send me leads?',
      a: 'Couples on OpusFesta filter by category, city, date, budget and style. When their criteria match your storefront, your profile shows in their results — and qualified enquiries land in your inbox.',
    },
    {
      id: 'q3',
      q: 'Do you take a commission on bookings?',
      a: 'On the Starter plan we charge a small service fee on bookings paid through OpusFesta. On Pro, you can switch to a flat monthly fee with 0% commission. Either way, the numbers are transparent before you ever sign up.',
    },
    {
      id: 'q4',
      q: 'How do payments work?',
      a: 'Couples can pay deposits and balances by mobile money (M-Pesa, Airtel) or card. Funds settle to your linked account on a weekly cycle. Auto-reminders chase the balance — you never have to.',
    },
    {
      id: 'q5',
      q: 'How long does it take to get verified?',
      a: 'Most storefronts are reviewed within 24 hours. We confirm your business details, portfolio quality, and a few sample reviews — then you go live with a verified badge that builds trust with couples.',
    },
    {
      id: 'q6',
      q: 'Can I import existing reviews and clients?',
      a: 'Yes. On Pro, you can import past clients to request reviews, and migrate Google or Facebook reviews into your OpusFesta profile so your social proof comes with you.',
    },
  ],
}

export async function loadFaqContent(): Promise<FaqContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return FAQ_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'vendors_home')
      .eq('section_key', 'faq')
      .maybeSingle()
    const stored = data?.content as Partial<FaqContent> | undefined
    if (stored) {
      return {
        ...FAQ_FALLBACK,
        ...stored,
        items:
          Array.isArray(stored.items) && stored.items.length > 0
            ? (stored.items as FaqItem[])
            : FAQ_FALLBACK.items,
      }
    }
    return FAQ_FALLBACK
  } catch {
    return FAQ_FALLBACK
  }
}
