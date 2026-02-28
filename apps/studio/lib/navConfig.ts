export type StudioNavKind = 'route' | 'section' | 'legal';
export type StudioSocialIconKey = 'instagram' | 'twitter' | 'linkedin';

export interface StudioNavItem {
  id: string;
  label: string;
  href: string;
  kind: StudioNavKind;
}

export interface StudioSocialLink {
  id: string;
  label: string;
  href: string;
  iconKey: StudioSocialIconKey;
  external: true;
}

export const primaryNav: StudioNavItem[] = [
  { id: 'home', label: 'Home', href: '/', kind: 'route' },
  { id: 'portfolio', label: 'Portfolio', href: '/portfolio', kind: 'route' },
  { id: 'journal', label: 'Journal', href: '/journal', kind: 'route' },
];

export const sidebarNav: StudioNavItem[] = [
  ...primaryNav,
  { id: 'work', label: 'Work', href: '/#work', kind: 'section' },
  { id: 'services', label: 'Services', href: '/#services', kind: 'section' },
  { id: 'process', label: 'Process', href: '/#process', kind: 'section' },
  { id: 'testimonials', label: 'Testimonials', href: '/#testimonials', kind: 'section' },
  { id: 'faq', label: 'FAQ', href: '/#faq', kind: 'section' },
  { id: 'contact', label: 'Contact', href: '/#contact', kind: 'section' },
];

export const footerQuickLinks: StudioNavItem[] = [
  { id: 'work', label: 'Work', href: '/#work', kind: 'section' },
  { id: 'services', label: 'Services', href: '/#services', kind: 'section' },
  { id: 'process', label: 'Process', href: '/#process', kind: 'section' },
  { id: 'testimonials', label: 'Testimonials', href: '/#testimonials', kind: 'section' },
  { id: 'faq', label: 'FAQ', href: '/#faq', kind: 'section' },
];

export const legalLinks: StudioNavItem[] = [
  { id: 'privacy', label: 'Privacy Policy', href: '/privacy', kind: 'legal' },
  { id: 'terms', label: 'Terms', href: '/terms', kind: 'legal' },
];

export const socialLinks: StudioSocialLink[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    href: process.env.NEXT_PUBLIC_STUDIO_INSTAGRAM_URL ?? '',
    iconKey: 'instagram',
    external: true,
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    href: process.env.NEXT_PUBLIC_STUDIO_TWITTER_URL ?? '',
    iconKey: 'twitter',
    external: true,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: process.env.NEXT_PUBLIC_STUDIO_LINKEDIN_URL ?? '',
    iconKey: 'linkedin',
    external: true,
  },
];

export function isSectionLink(href: string): boolean {
  return href.startsWith('/#') || href.startsWith('#');
}

export function normalizeStudioHref(href: string): string {
  return href.startsWith('#') ? `/${href}` : href;
}

export function getNavItemId(item: Pick<StudioNavItem, 'id'>): string {
  return `studio-nav-${item.id}`;
}

export function isValidSocialHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}
