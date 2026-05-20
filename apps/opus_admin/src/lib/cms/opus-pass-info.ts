export type OpusPassInfoParagraph = {
  id: string
  heading: string
  body: string
}

export type OpusPassInfoContent = {
  title: string
  lead: string
  paragraphs: OpusPassInfoParagraph[]
  closing_heading: string
  cta_label: string
  cta_href: string
}

export type OpusPassInfoRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassInfoContent
  draft_content: OpusPassInfoContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_INFO_FALLBACK: OpusPassInfoContent = {
  title: 'About OpusPass',
  lead: 'Invites, guests and your wedding website — all in one beautifully simple place, designed for couples in Tanzania.',
  paragraphs: [
    {
      id: 'what',
      heading: 'What OpusPass is',
      body: 'OpusPass replaces the printed invitation and the spreadsheet RSVP tracker. Pick a design, send it to your guests by WhatsApp or SMS, and let them tap to confirm — no apps to install, no awkward calls.',
    },
    {
      id: 'how',
      heading: 'How it fits together',
      body: "Your invitation, guest list, RSVPs, and wedding website all sync automatically. Update a date or venue once and every guest sees it instantly. Want paper invites too? Add a premium print run any time — it's optional, not the default.",
    },
    {
      id: 'why',
      heading: 'Why couples choose OpusPass',
      body: 'Designed for East African weddings: Swahili and English templates, local mobile money for premium add-ons, and templates for kitchen parties, send-offs, and kadi za michango — moments other tools forget.',
    },
  ],
  closing_heading: 'Ready when you are.',
  cta_label: 'Get started',
  cta_href: '/sign-up',
}
