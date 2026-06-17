import type {
  Block,
  BlockType,
  Section,
  SectionType,
  SiteDoc,
} from './types'

// ─────────────────────────────────────────────────────────────────────────────
//  Defaults & factories
//  The DEFAULT_DOC must be DETERMINISTIC (no Date.now / Math.random) so the
//  server and first client render match. New blocks/sections created at runtime
//  (in event handlers, client-only) may use uid().
// ─────────────────────────────────────────────────────────────────────────────

let counter = 0
/** Runtime-only unique id. Never call during render. */
export function uid(prefix = 'id'): string {
  counter += 1
  // event-handler only → safe to use a time component for cross-mount uniqueness
  return `${prefix}_${counter}_${Math.round(performance.now())}`
}

export const DEFAULT_DOC: SiteDoc = {
  title: 'Neema & Amani',
  nav: ['Our Story', 'Wedding Day', 'RSVP', 'Registry'],
  theme: {
    palette: {
      bg: '#FBF9F5',
      surface: '#FFFFFF',
      ink: '#1A1A1A',
      accent: '#C9A0DC',
      onAccent: '#1A1A1A',
    },
    headingFont: 'Playfair Display',
    bodyFont: 'EB Garamond',
  },
  sections: [
    {
      id: 'sec_hero',
      type: 'hero',
      name: 'Hero',
      layout: 'photo',
      background: {
        kind: 'image',
        value: '/assets/images/couples_together.jpg',
        overlay: 22,
      },
      padding: 96,
      blocks: [
        {
          id: 'blk_eyebrow',
          type: 'eyebrow',
          text: '22 August 2026 · Bagamoyo',
          color: '#FFFFFF',
          letterSpacing: 30,
          align: 'center',
          mt: 0,
          mb: 0,
        },
        {
          id: 'blk_headline',
          type: 'heading',
          text: 'Finally Forever',
          font: 'Playfair Display',
          fontSize: 48,
          letterSpacing: -2,
          color: '#1A1A1A',
          animation: 'Fade In Up',
          animate: true,
          align: 'center',
          mt: 32,
          mb: 24,
        },
        {
          id: 'blk_sub',
          type: 'text',
          text: "We can't wait to celebrate the start of our new chapter with the people who mean the most to us.",
          fontSize: 16,
          color: '#FFFFFF',
          align: 'center',
          mt: 0,
          mb: 0,
        },
        {
          id: 'blk_cta',
          type: 'button',
          label: 'Our Story',
          href: '#our-story',
          variant: 'solid',
          align: 'center',
          mt: 28,
          mb: 0,
        },
      ],
    },
  ],
}

const LOREM =
  'We met under the warm Bagamoyo sun and have been writing our story ever since. We would be honoured to have you with us as we begin this new chapter.'

export function makeBlock<T extends BlockType>(type: T): Extract<Block, { type: T }> {
  const base = { id: uid('blk'), mt: 16, mb: 16, align: 'center' as const }
  const build = (): Block => {
  switch (type) {
    case 'eyebrow':
      return { ...base, type, text: 'A small detail', color: '#1A1A1A', letterSpacing: 24 }
    case 'heading':
      return {
        ...base,
        type,
        text: 'New heading',
        font: 'Playfair Display',
        fontSize: 36,
        letterSpacing: 0,
        color: '#1A1A1A',
        animation: 'Fade In Up',
        animate: true,
      }
    case 'text':
      return { ...base, type, text: LOREM, fontSize: 16, color: '#3A3A3A' }
    case 'button':
      return { ...base, type, label: 'Learn more', href: '#', variant: 'solid' }
    case 'image':
      return {
        ...base,
        type,
        src: '/assets/images/flowers_pinky.jpg',
        alt: 'Photo',
        radius: 16,
        height: 320,
      }
    case 'divider':
      return { ...base, type, color: '#E4DED3' }
    case 'countdown':
      return { ...base, type, date: '2026-08-22', label: 'Until we say "I do"' }
    case 'rsvp':
      return {
        ...base,
        type,
        title: 'Will you celebrate with us?',
        note: 'Kindly respond by 1 August 2026.',
      }
    case 'map':
      return {
        ...base,
        type,
        venue: 'Bagamoyo Beach Resort',
        address: 'Bagamoyo, Pwani, Tanzania',
      }
    case 'registry':
      return {
        ...base,
        type,
        items: [
          { id: uid('reg'), label: 'Honeymoon Fund', href: '#', hint: 'Help us explore Zanzibar' },
          { id: uid('reg'), label: 'Our Home', href: '#', hint: 'Pieces for our first home' },
          { id: uid('reg'), label: 'Charity Gift', href: '#', hint: 'Give back in our name' },
        ],
      }
    case 'gallery':
      return {
        ...base,
        type,
        images: [
          '/assets/images/cutesy_couple.jpg',
          '/assets/images/coupleswithpiano.jpg',
          '/assets/images/authentic_couple.jpg',
        ],
      }
    default:
      return { ...base, type: 'text', text: '', fontSize: 16, color: '#1A1A1A' }
  }
  }
  return build() as Extract<Block, { type: T }>
}

const SECTION_NAMES: Record<SectionType, string> = {
  hero: 'Hero',
  content: 'Our Story',
  rsvp: 'RSVP',
  details: 'Wedding Day',
  registry: 'Registry',
  gallery: 'Gallery',
}

export function makeSection(type: SectionType): Section {
  const id = uid('sec')
  const base = {
    id,
    type,
    name: SECTION_NAMES[type],
    layout: 'centered' as const,
    padding: 72,
    background: { kind: 'color' as const, value: '#FBF9F5', overlay: 0 },
  }
  switch (type) {
    case 'content':
      return {
        ...base,
        blocks: [
          { ...makeBlock('eyebrow'), text: 'Our Story' },
          { ...makeBlock('heading'), text: 'How it all began', fontSize: 40, mt: 8 },
          makeBlock('text'),
        ],
      }
    case 'details':
      return {
        ...base,
        background: { kind: 'color', value: '#F3EAFA', overlay: 0 },
        blocks: [
          { ...makeBlock('eyebrow'), text: 'Wedding Day' },
          { ...makeBlock('heading'), text: 'When & where', fontSize: 40, mt: 8 },
          makeBlock('countdown'),
          makeBlock('map'),
        ],
      }
    case 'rsvp':
      return {
        ...base,
        blocks: [
          { ...makeBlock('heading'), text: 'RSVP', fontSize: 40 },
          makeBlock('rsvp'),
        ],
      }
    case 'registry':
      return {
        ...base,
        background: { kind: 'color', value: '#FFFFFF', overlay: 0 },
        blocks: [
          { ...makeBlock('eyebrow'), text: 'Registry' },
          { ...makeBlock('heading'), text: 'Your presence is the present', fontSize: 38, mt: 8 },
          makeBlock('registry'),
        ],
      }
    case 'gallery':
      return {
        ...base,
        blocks: [
          { ...makeBlock('heading'), text: 'Moments', fontSize: 40 },
          makeBlock('gallery'),
        ],
      }
    case 'hero':
    default:
      return {
        ...base,
        layout: 'photo',
        padding: 96,
        background: { kind: 'image', value: '/assets/images/couples_together.jpg', overlay: 22 },
        blocks: [
          { ...makeBlock('heading'), text: 'Together Forever', color: '#1A1A1A' },
        ],
      }
  }
}
