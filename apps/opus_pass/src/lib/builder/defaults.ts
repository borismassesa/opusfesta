import type {
  Block,
  BlockType,
  BuilderMeta,
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

// Declared up here (not lower in the file) because the deterministic
// makeStaticBlock() factory reads it while DEFAULT_DOC is being built at module
// init — a `const` declared after DEFAULT_DOC would still be in its TDZ.
const LOREM =
  'We met under the warm Bagamoyo sun and have been writing our story ever since. We would be honoured to have you with us as we begin this new chapter.'

// The default navigation mirrors the structured pages an OpusPass couple gets.
export const DEFAULT_NAV = [
  'Home',
  'Schedule',
  'Travel',
  'Gift Registry',
  'Guest Book',
  'Wedding Party',
  'Gallery',
  'Things To Do',
  'FAQs',
]

export const DEFAULT_META: BuilderMeta = {
  partnerA: 'Neema Joseph',
  partnerB: 'Amani Mushi',
  date: '2026-08-22',
  location: 'Bagamoyo, Tanzania',
  welcome: "We're getting married!",
  presetId: 'bagamoyo',
  layoutId: 'full-width',
  animationStyle: 'none',
  transition: 'rise',
  fontEffect: 'none',
  pages: [
    { key: 'home', label: 'Home', visible: true },
    { key: 'schedule', label: 'Schedule', visible: true },
    { key: 'travel', label: 'Travel', visible: true },
    { key: 'registry', label: 'Gift Registry', visible: true },
    { key: 'guestbook', label: 'Guest Book', visible: true },
    { key: 'party', label: 'Wedding Party', visible: true },
    { key: 'gallery', label: 'Gallery', visible: true },
    { key: 'things', label: 'Things To Do', visible: true },
    { key: 'faqs', label: 'FAQs', visible: true },
    { key: 'rsvp', label: 'RSVP', visible: false },
  ],
  photos: [],
  slug: 'neema-and-amani',
  visibility: 'published',
  announcement: false,
  password: false,
  searchVisible: true,
}

// The hero is COMPOSED from `meta` at render time (see composeDoc in
// presets.ts), so the hero section here is just a deterministic seed; the
// builder panels drive it through `meta`.
export const DEFAULT_DOC: SiteDoc = {
  title: 'Neema & Amani',
  nav: DEFAULT_NAV,
  meta: DEFAULT_META,
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
      name: 'Home',
      layout: 'centered',
      background: { kind: 'color', value: '#FFFFFF', overlay: 0 },
      padding: 120,
      blocks: [
        {
          id: 'blk_headline',
          type: 'heading',
          text: 'Neema Joseph',
          font: 'Playfair Display',
          fontSize: 48,
          letterSpacing: -1,
          color: '#1A1A1A',
          animation: 'Fade In Up',
          animate: true,
          align: 'center',
          mt: 0,
          mb: 0,
        },
      ],
    },
    {
      id: 'sec_story',
      type: 'content',
      name: 'Our Story',
      layout: 'centered',
      padding: 80,
      background: { kind: 'color', value: '#FBF9F5', overlay: 0 },
      blocks: [
        { ...makeStaticBlock('eyebrow', 'blk_story_eb'), text: 'Our Story' } as Block,
        { ...makeStaticBlock('heading', 'blk_story_h'), text: 'How it all began', fontSize: 40, mt: 8 } as Block,
        makeStaticBlock('text', 'blk_story_t'),
        makeStaticBlock('gallery', 'blk_story_g'),
      ],
    },
    {
      id: 'sec_details',
      type: 'details',
      name: 'Wedding Day',
      layout: 'centered',
      padding: 80,
      background: { kind: 'color', value: '#F3EAFA', overlay: 0 },
      blocks: [
        { ...makeStaticBlock('eyebrow', 'blk_det_eb'), text: 'Wedding Day' } as Block,
        { ...makeStaticBlock('heading', 'blk_det_h'), text: 'When & where', fontSize: 40, mt: 8 } as Block,
        makeStaticBlock('countdown', 'blk_det_c'),
        makeStaticBlock('map', 'blk_det_m'),
      ],
    },
    {
      id: 'sec_registry',
      type: 'registry',
      name: 'Registry',
      layout: 'centered',
      padding: 80,
      background: { kind: 'color', value: '#FFFFFF', overlay: 0 },
      blocks: [
        { ...makeStaticBlock('eyebrow', 'blk_reg_eb'), text: 'Registry' } as Block,
        { ...makeStaticBlock('heading', 'blk_reg_h'), text: 'Your presence is the present', fontSize: 38, mt: 8 } as Block,
        makeStaticBlock('registry', 'blk_reg_r'),
      ],
    },
    {
      id: 'sec_rsvp',
      type: 'rsvp',
      name: 'RSVP',
      layout: 'centered',
      padding: 80,
      background: { kind: 'color', value: '#FBF9F5', overlay: 0 },
      blocks: [
        { ...makeStaticBlock('heading', 'blk_rsvp_h'), text: 'RSVP', fontSize: 40 } as Block,
        makeStaticBlock('rsvp', 'blk_rsvp_r'),
      ],
    },
  ],
}

/**
 * Deterministic block factory for the module-level DEFAULT_DOC — identical
 * output to makeBlock() but with a caller-supplied id and no uid()/Date/random,
 * so the server and the first client render match exactly.
 */
function makeStaticBlock<T extends BlockType>(type: T, id: string): Extract<Block, { type: T }> {
  const base = { id, mt: 16, mb: 16, align: 'center' as const }
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
      case 'countdown':
        return { ...base, type, date: '2026-08-22', label: 'Until we say "I do"' }
      case 'map':
        return { ...base, type, venue: 'Bagamoyo Beach Resort', address: 'Bagamoyo, Pwani, Tanzania' }
      case 'registry':
        return {
          ...base,
          type,
          items: [
            { id: `${id}_1`, label: 'Honeymoon Fund', href: '#', hint: 'Help us explore Zanzibar' },
            { id: `${id}_2`, label: 'Our Home', href: '#', hint: 'Pieces for our first home' },
            { id: `${id}_3`, label: 'Charity Gift', href: '#', hint: 'Give back in our name' },
          ],
        }
      case 'rsvp':
        return {
          ...base,
          type,
          title: 'Will you celebrate with us?',
          note: 'Kindly respond by 1 August 2026.',
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
