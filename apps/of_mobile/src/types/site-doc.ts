// Hand-ported slice of apps/opus_pass/src/lib/builder/types.ts — mobile only
// writes meta + a placeholder sections array (see WEBSITE_DEFAULT_SECTIONS),
// since the public /w/<slug> page's composeDoc() ignores stored `sections`
// entirely and rebuilds the page body from `meta` + a per-preset content
// blueprint. Keep this file in sync with apps/opus_pass/src/lib/builder/types.ts
// and presets.ts if either changes shape.

export type FontKey =
  | 'Playfair Display'
  | 'Cormorant Garamond'
  | 'EB Garamond'
  | 'Montserrat'
  | 'Dancing Script'
  | 'Yellowtail';

export type Palette = {
  bg: string;
  surface: string;
  ink: string;
  accent: string;
  onAccent: string;
};

export type Motif = 'watercolor' | 'greenery' | 'deco' | 'floral' | 'minimal' | 'crest' | 'kanga' | 'sunrise';

export type TemplateDecor = {
  motif: Motif;
  eyebrow: 'tracked' | 'rule' | 'script';
  divider: 'ornament' | 'rule' | 'none';
  card: 'soft' | 'bordered' | 'flat' | 'filled';
  headingUpper: boolean;
};

export type Theme = {
  palette: Palette;
  headingFont: FontKey;
  bodyFont: FontKey;
  decor?: TemplateDecor;
};

// Minimal section/block shape — just enough to satisfy SiteDoc.sections'
// type and the live guard (Array.isArray(doc.sections)). The public page
// never reads this content (see file header), so it's never fully typed
// out here the way opus_pass's own Block union is.
export type Section = {
  id: string;
  type: 'hero' | 'content' | 'rsvp' | 'details' | 'registry' | 'gallery';
  name: string;
  layout: 'centered' | 'split' | 'photo';
  background: { kind: 'image' | 'color'; value: string; overlay: number };
  padding: number;
  blocks: Array<Record<string, unknown>>;
};

export type PageKey = 'home' | 'schedule' | 'travel' | 'registry' | 'party' | 'gallery' | 'things' | 'faqs' | 'rsvp';

export type BuilderPage = { key: PageKey; label: string; visible: boolean };

export type Visibility = 'published' | 'private';

export type BuilderMeta = {
  partnerA: string;
  partnerB: string;
  date: string; // ISO date
  location: string;
  welcome: string;
  presetId: string;
  accentOverride?: string;
  headingFont?: FontKey;
  bodyFont?: FontKey;
  bgColor?: string;
  headingColor?: string;
  paragraphColor?: string;
  navDifferent?: boolean;
  layoutId: string;
  photos: string[];
  animationStyle: string;
  transition: string;
  fontEffect: string;
  pages: BuilderPage[];
  slug: string;
  visibility: Visibility;
  announcement: boolean;
  password: boolean;
  searchVisible: boolean;
};

export type SiteDoc = {
  title: string;
  nav: string[];
  theme: Theme;
  sections: Section[];
  meta: BuilderMeta;
};

export type WebsitePresetId = 'serengeti' | 'tanzanite' | 'kanga';

type WebsitePreset = {
  id: WebsitePresetId;
  name: string;
  palette: Palette;
  headingFont: FontKey;
  bodyFont: FontKey;
  defaultLayoutId: string;
  decor: TemplateDecor;
};

// Ported verbatim from apps/opus_pass/src/lib/builder/presets.ts's
// DESIGN_PRESETS — only the 3 presets mobile's theme picker maps onto.
export const WEBSITE_PRESETS: Record<WebsitePresetId, WebsitePreset> = {
  serengeti: {
    id: 'serengeti',
    name: 'Serengeti',
    palette: { bg: '#F1EFE8', surface: '#FFFFFF', ink: '#2F3B2A', accent: '#5C6B4D', onAccent: '#FFFFFF' },
    headingFont: 'Playfair Display',
    bodyFont: 'EB Garamond',
    defaultLayoutId: 'banner',
    decor: { motif: 'greenery', eyebrow: 'rule', divider: 'ornament', card: 'flat', headingUpper: false },
  },
  tanzanite: {
    id: 'tanzanite',
    name: 'Tanzanite',
    palette: { bg: '#0F1A30', surface: '#16223C', ink: '#F4E9C6', accent: '#E8D9A7', onAccent: '#0F1A30' },
    headingFont: 'Playfair Display',
    bodyFont: 'Cormorant Garamond',
    defaultLayoutId: 'text-only',
    decor: { motif: 'deco', eyebrow: 'tracked', divider: 'ornament', card: 'bordered', headingUpper: true },
  },
  kanga: {
    id: 'kanga',
    name: 'Kanga',
    palette: { bg: '#FBF6EF', surface: '#FFFFFF', ink: '#1A1A1A', accent: '#C0392B', onAccent: '#FFFFFF' },
    headingFont: 'Montserrat',
    bodyFont: 'EB Garamond',
    defaultLayoutId: 'squares',
    decor: { motif: 'kanga', eyebrow: 'tracked', divider: 'ornament', card: 'filled', headingUpper: true },
  },
};

// Every PageKey opus_pass's builder supports, in the order DEFAULT_META
// lists them ('home' excluded — it's always visible, never toggled).
export const WEBSITE_DEFAULT_PAGES: BuilderPage[] = [
  { key: 'schedule', label: 'Schedule', visible: true },
  { key: 'travel', label: 'Travel', visible: true },
  { key: 'registry', label: 'Registry', visible: true },
  { key: 'party', label: 'Wedding Party', visible: true },
  { key: 'gallery', label: 'Gallery', visible: true },
  { key: 'things', label: 'Things To Do', visible: true },
  { key: 'faqs', label: 'FAQs', visible: true },
  { key: 'rsvp', label: 'RSVP', visible: false },
];

// Inert placeholder — composeDoc() on the live public page discards
// `doc.sections` entirely and rebuilds the body from `meta` + the chosen
// preset's content blueprint. This only exists to satisfy SiteDoc's type
// and getPublishedWebsite()'s `Array.isArray(doc.sections)` guard.
export const WEBSITE_PLACEHOLDER_SECTIONS: Section[] = [
  {
    id: 'sec_hero',
    type: 'hero',
    name: 'Home',
    layout: 'centered',
    background: { kind: 'color', value: '#FFFFFF', overlay: 0 },
    padding: 120,
    blocks: [],
  },
];
