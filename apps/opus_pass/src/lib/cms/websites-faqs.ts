import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

export type WebsitesFaqItem = {
  id: string
  question: string
  answer: string
}

export type WebsitesFaqsContent = {
  heading: string
  description: string
  items: WebsitesFaqItem[]
}

export const WEBSITES_FAQS_FALLBACK: WebsitesFaqsContent = {
  heading: 'Frequently asked questions',
  description: 'Get answers to common wedding website questions below.',
  items: [
    {
      id: 'price',
      question: 'How much does a wedding website cost?',
      answer:
        'Free, forever. Every OpusPass plan comes with a matching wedding website at no extra cost. Premium add-ons like a custom domain (yourname.com) are optional.',
    },
    {
      id: 'included',
      question: "What's typically included on a wedding website?",
      answer:
        'Your story, ceremony and reception details, a bilingual RSVP page with meal choices, travel and hotel info, dress code notes, a photo gallery, registry links, and a Q&A section.',
    },
    {
      id: 'languages',
      question: 'Can my site be in both Swahili and English?',
      answer:
        'Yes. Every template ships with a Swahili-English toggle so guests can read your invite in the language they prefer. You can tweak the wording in both languages.',
    },
    {
      id: 'domain',
      question: 'Can I use a custom link or domain?',
      answer:
        'Every site gets a free opuspass.co/yourname link. Upgrade any time to a custom domain like neemaandamani.com — we handle the setup.',
    },
    {
      id: 'private',
      question: 'Can I make my website private?',
      answer:
        'Yes — protect your site with a passcode that you share with guests, or hide specific pages like the registry from public view.',
    },
    {
      id: 'change',
      question: 'Can I switch designs after I start?',
      answer:
        "Anytime, even the night before your wedding. Switching a design keeps all your content, photos and RSVPs — it's like changing the wrapper, not the gift.",
    },
  ],
}

// Stored shape: translatable fields may be a localized { en, sw } object or a
// legacy plain string. The loader resolves each translatable field for `locale`
// and returns the flat WebsitesFaqsContent the render components already expect.
type StoredWebsitesFaqItem = {
  id?: string
  question?: MaybeLocalized
  answer?: MaybeLocalized
}

type StoredWebsitesFaqs = {
  heading?: MaybeLocalized
  description?: MaybeLocalized
  items?: StoredWebsitesFaqItem[]
}

export async function loadWebsitesFaqsContent(
  locale: Locale = DEFAULT_LOCALE
): Promise<WebsitesFaqsContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return WEBSITES_FAQS_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-websites')
      .eq('section_key', 'faqs')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | StoredWebsitesFaqs
      | undefined
    if (stored) {
      const F = WEBSITES_FAQS_FALLBACK
      return {
        heading: resolveLocalized(stored.heading ?? F.heading, locale),
        description: resolveLocalized(stored.description ?? F.description, locale),
        items:
          stored.items && Array.isArray(stored.items) && stored.items.length > 0
            ? stored.items.map((it) => ({
                id: it.id ?? '',
                question: resolveLocalized(it.question, locale),
                answer: resolveLocalized(it.answer, locale),
              }))
            : F.items,
      }
    }
    return WEBSITES_FAQS_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] websites-faqs load failed', err)
    return WEBSITES_FAQS_FALLBACK
  }
}
