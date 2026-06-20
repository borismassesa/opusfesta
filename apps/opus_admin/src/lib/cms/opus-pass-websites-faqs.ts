import type { MaybeLocalized } from '@/lib/cms/localized'

export type OpusPassWebsitesFaqItem = {
  id: string
  // Translatable text.
  question: MaybeLocalized
  answer: MaybeLocalized
}

export type OpusPassWebsitesFaqsContent = {
  heading: MaybeLocalized
  description: MaybeLocalized
  items: OpusPassWebsitesFaqItem[]
}

export type OpusPassWebsitesFaqsRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassWebsitesFaqsContent
  draft_content: OpusPassWebsitesFaqsContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_WEBSITES_FAQS_FALLBACK: OpusPassWebsitesFaqsContent = {
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
