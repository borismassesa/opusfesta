export type NavItem = {
  label: string
  href: string
  description?: string
}

export type NavSection = {
  label: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    label: 'Get started',
    items: [
      { label: 'Design at OpusFesta', href: '/' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    label: 'Foundations',
    items: [
      { label: 'Overview', href: '/foundations' },
      { label: 'Colour', href: '/foundations/color' },
      { label: 'Typography', href: '/foundations/typography' },
      { label: 'Spacing', href: '/foundations/spacing' },
      { label: 'Radius', href: '/foundations/radius' },
      { label: 'Elevation', href: '/foundations/elevation' },
      { label: 'Motion', href: '/foundations/motion' },
      { label: 'Iconography', href: '/foundations/iconography' },
    ],
  },
  {
    label: 'Components',
    items: [
      { label: 'Overview', href: '/components' },
      { label: 'Button', href: '/components/button' },
      { label: 'Pill & Badge', href: '/components/pill' },
      { label: 'Card', href: '/components/card' },
      { label: 'Input', href: '/components/input' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Patterns', href: '/patterns' },
      { label: 'Voice & tone', href: '/voice' },
    ],
  },
]
