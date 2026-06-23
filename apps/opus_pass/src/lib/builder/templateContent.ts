// ─────────────────────────────────────────────────────────────────────────────
//  Per-template content blueprints
//  Each template renders its OWN below-the-hero sections — different copy,
//  different section set + order, different background rhythm — so picking a
//  template gives a genuinely fresh design, not the same skeleton recoloured.
//  composeDoc() calls buildTemplateSections() to produce these deterministically.
// ─────────────────────────────────────────────────────────────────────────────

import type { Block, BuilderMeta, FontKey, Palette, Section } from './types'

const GALLERY_PHOTOS = [
  '/assets/images/cutesy_couple.jpg',
  '/assets/images/coupleswithpiano.jpg',
  '/assets/images/authentic_couple.jpg',
  '/assets/images/churchcouples.jpg',
  '/assets/images/beautiful_bride.jpg',
  '/assets/images/bridering.jpg',
]

type SectionKind =
  | 'story'
  | 'verse'
  | 'details'
  | 'gallery'
  | 'registry'
  | 'rsvp'
  | 'travel'
  | 'things'
  | 'party'

type SectionSpec = {
  kind: SectionKind
  eyebrow?: string
  headline?: string
  body?: string
  /** quote attribution (verse) */
  by?: string
}

/** Which nav page a generated section belongs to (for visibility filtering). */
export const SECTION_PAGE: Record<string, string> = {
  sec_story: 'home',
  sec_verse: 'home',
  sec_details: 'schedule',
  sec_gallery: 'gallery',
  sec_registry: 'registry',
  sec_rsvp: 'rsvp',
  sec_travel: 'travel',
  sec_things: 'things',
  sec_party: 'party',
}

// ── Per-template blueprints (set, order + copy all vary) ──────────────────────

const BLUEPRINTS: Record<string, SectionSpec[]> = {
  bagamoyo: [
    { kind: 'story', eyebrow: 'Our Story', headline: 'Where the tide brought us together', body: 'We met one golden evening on the Bagamoyo shore and have been chasing sunsets ever since. We would be so happy to have you beside us as we begin this next chapter by the sea.' },
    { kind: 'details', eyebrow: 'The Day', headline: 'When & where' },
    { kind: 'travel', eyebrow: 'Travel', headline: 'Getting to the coast', body: 'Bagamoyo is a gentle 1.5-hour drive north of Dar es Salaam. We have a few seaside guesthouses to recommend — details to follow with your invitation.' },
    { kind: 'gallery', headline: 'Moments by the sea' },
    { kind: 'registry', eyebrow: 'Registry', headline: 'Your presence is the present' },
    { kind: 'rsvp', headline: 'Will you join us?' },
  ],
  serengeti: [
    { kind: 'story', eyebrow: 'Our Story', headline: 'How it all began', body: 'From a chance meeting to a lifetime of adventures, our story has grown wild and green and true. We cannot wait to celebrate it surrounded by the people we love most.' },
    { kind: 'gallery', headline: 'A few of our favourites' },
    { kind: 'details', eyebrow: 'The Day', headline: 'When & where' },
    { kind: 'registry', eyebrow: 'Registry', headline: 'Your presence is the present' },
    { kind: 'rsvp', headline: 'RSVP' },
  ],
  tanzanite: [
    { kind: 'verse', body: 'To love and to cherish, from this day forward, for all the days of our lives.', by: '— Together, forever' },
    { kind: 'details', eyebrow: 'Schedule', headline: 'The evening' },
    { kind: 'registry', eyebrow: 'Registry', headline: 'With gratitude' },
    { kind: 'rsvp', headline: 'Kindly respond' },
  ],
  zahari: [
    { kind: 'story', eyebrow: 'Our Love Story', headline: 'Two hearts, one bloom', body: 'Like a garden in full flower, our love has taken its time and grown beautifully. We would be honoured to have you witness the day it blossoms into forever.' },
    { kind: 'gallery', headline: 'Us, lately' },
    { kind: 'details', eyebrow: 'The Day', headline: 'When & where' },
    { kind: 'registry', eyebrow: 'Registry', headline: 'Your presence is the present' },
    { kind: 'rsvp', headline: 'Will you celebrate with us?' },
  ],
  amani: [
    { kind: 'story', eyebrow: 'Us', headline: 'A simple, certain yes', body: 'No grand speeches — just the two of us, sure of each other. We would love for you to be there.' },
    { kind: 'details', eyebrow: 'Details', headline: 'When & where' },
    { kind: 'rsvp', headline: 'RSVP' },
  ],
  dhahabu: [
    { kind: 'story', eyebrow: 'Welcome', headline: 'Together with their families', body: 'With joyful hearts, we invite you to share in the celebration of our marriage. Your presence would make our day complete.' },
    { kind: 'details', eyebrow: 'Schedule', headline: 'Order of the day' },
    { kind: 'party', eyebrow: 'Wedding Party', headline: 'Those standing with us' },
    { kind: 'registry', eyebrow: 'Registry', headline: 'A note on gifts' },
    { kind: 'rsvp', headline: 'Répondez, s’il vous plaît' },
  ],
  kanga: [
    { kind: 'story', eyebrow: 'Our Story', headline: 'A celebration of us', body: 'Bold, bright and full of life — that is us, and that is the party we are throwing. Come ready to eat, dance and celebrate love the East-African way.' },
    { kind: 'gallery', headline: 'The good times' },
    { kind: 'things', eyebrow: 'Things To Do', headline: 'Make a weekend of it', body: 'From the spice markets to the beaches, there is so much to explore. We will share our favourite spots so you can turn the trip into a holiday.' },
    { kind: 'details', eyebrow: 'The Day', headline: 'When & where' },
    { kind: 'rsvp', headline: 'Are you in?' },
  ],
  mwangaza: [
    { kind: 'story', eyebrow: 'Our Story', headline: 'Our golden hour', body: 'Every great love has its dawn. Ours began quietly and has been growing warmer ever since. We would love to share the morning of our forever with you.' },
    { kind: 'details', eyebrow: 'The Day', headline: 'When & where' },
    { kind: 'gallery', headline: 'Sun-soaked moments' },
    { kind: 'registry', eyebrow: 'Registry', headline: 'Your presence is the present' },
    { kind: 'rsvp', headline: 'Will you join us?' },
  ],
}

// ── Deterministic block helpers ───────────────────────────────────────────────

type Ctx = { palette: Palette; headingFont: FontKey; meta: BuilderMeta }

const base = (id: string, mt: number, mb: number) => ({ id, mt, mb, align: 'center' as const })

function eyebrow(id: string, text: string, c: Ctx): Block {
  return { ...base(id, 0, 14), type: 'eyebrow', text, color: c.palette.accent, letterSpacing: 22 }
}
function heading(id: string, text: string, size: number, c: Ctx): Block {
  return {
    ...base(id, 4, 20),
    type: 'heading',
    text,
    font: c.headingFont,
    fontSize: size,
    letterSpacing: 0,
    color: c.palette.ink,
    animation: 'Fade In Up',
    animate: false,
  }
}
function paragraph(id: string, text: string, c: Ctx): Block {
  return { ...base(id, 0, 8), type: 'text', text, fontSize: 16, color: c.palette.ink }
}

// ── Section recipes ───────────────────────────────────────────────────────────

function sectionShell(id: string, name: string, bg: string, blocks: Block[]): Section {
  return {
    id,
    type: 'content',
    name,
    layout: 'centered',
    padding: 84,
    background: { kind: 'color', value: bg, overlay: 0 },
    blocks,
  }
}

function buildSection(spec: SectionSpec, bg: string, c: Ctx): Section {
  switch (spec.kind) {
    case 'story':
    case 'travel':
    case 'things': {
      const sid = spec.kind === 'story' ? 'sec_story' : spec.kind === 'travel' ? 'sec_travel' : 'sec_things'
      return sectionShell(sid, spec.headline ?? 'Our Story', bg, [
        spec.eyebrow ? eyebrow(`${sid}_eb`, spec.eyebrow, c) : paragraph(`${sid}_sp`, '', c),
        heading(`${sid}_h`, spec.headline ?? '', 38, c),
        paragraph(`${sid}_t`, spec.body ?? '', c),
      ])
    }
    case 'verse': {
      const sid = 'sec_verse'
      return sectionShell(sid, 'Verse', bg, [
        { ...heading(`${sid}_h`, spec.body ?? '', 30, c), mt: 0, mb: 16 },
        spec.by
          ? ({ ...base(`${sid}_by`, 0, 8), type: 'text', text: spec.by, fontSize: 13, color: c.palette.ink } as Block)
          : paragraph(`${sid}_sp`, '', c),
      ])
    }
    case 'details': {
      const sid = 'sec_details'
      return sectionShell(sid, spec.headline ?? 'Wedding Day', bg, [
        spec.eyebrow ? eyebrow(`${sid}_eb`, spec.eyebrow, c) : paragraph(`${sid}_sp`, '', c),
        heading(`${sid}_h`, spec.headline ?? 'When & where', 38, c),
        { ...base(`${sid}_c`, 16, 8), type: 'countdown', date: c.meta.date, label: '' },
        { ...base(`${sid}_m`, 16, 0), type: 'map', venue: 'Wedding Venue', address: c.meta.location || 'To be announced' },
      ])
    }
    case 'gallery': {
      const sid = 'sec_gallery'
      const photos = (c.meta.photos ?? []).filter(Boolean)
      const images = (photos.length >= 3 ? photos : GALLERY_PHOTOS).slice(0, 6)
      return sectionShell(sid, spec.headline ?? 'Gallery', bg, [
        heading(`${sid}_h`, spec.headline ?? 'Moments', 36, c),
        { ...base(`${sid}_g`, 16, 0), type: 'gallery', images },
      ])
    }
    case 'registry': {
      const sid = 'sec_registry'
      return sectionShell(sid, spec.headline ?? 'Registry', bg, [
        spec.eyebrow ? eyebrow(`${sid}_eb`, spec.eyebrow, c) : paragraph(`${sid}_sp`, '', c),
        heading(`${sid}_h`, spec.headline ?? 'Your presence is the present', 34, c),
        {
          ...base(`${sid}_r`, 16, 0),
          type: 'registry',
          items: [
            { id: `${sid}_r1`, label: 'Honeymoon Fund', href: '#', hint: 'Help us explore' },
            { id: `${sid}_r2`, label: 'Our First Home', href: '#', hint: 'Pieces for our home' },
            { id: `${sid}_r3`, label: 'Charity Gift', href: '#', hint: 'Give back in our name' },
          ],
        },
      ])
    }
    case 'party': {
      const sid = 'sec_party'
      return sectionShell(sid, spec.headline ?? 'Wedding Party', bg, [
        spec.eyebrow ? eyebrow(`${sid}_eb`, spec.eyebrow, c) : paragraph(`${sid}_sp`, '', c),
        heading(`${sid}_h`, spec.headline ?? 'Those standing with us', 36, c),
        paragraph(`${sid}_t`, 'The dear friends and family who will stand beside us on the day. We are so grateful for each of them.', c),
      ])
    }
    case 'rsvp':
    default: {
      const sid = 'sec_rsvp'
      return sectionShell(sid, spec.headline ?? 'RSVP', bg, [
        heading(`${sid}_h`, spec.headline ?? 'RSVP', 38, c),
        {
          ...base(`${sid}_r`, 16, 0),
          type: 'rsvp',
          title: 'Will you celebrate with us?',
          note: 'Kindly respond before the big day.',
        },
      ])
    }
  }
}

/**
 * Build the below-hero sections for a template. Alternates surface/bg for rhythm
 * (so dark templates band too). Deterministic — SSR/CSR safe.
 */
export function buildTemplateSections(
  templateId: string,
  palette: Palette,
  headingFont: FontKey,
  meta: BuilderMeta,
): Section[] {
  const specs = BLUEPRINTS[templateId] ?? BLUEPRINTS.serengeti
  const c: Ctx = { palette, headingFont, meta }
  return specs.map((spec, i) => {
    const bg = i % 2 === 0 ? palette.bg : palette.surface
    return buildSection(spec, bg, c)
  })
}
