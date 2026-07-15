/**
 * Canonical color values for the scanner app — mirrors apps/opus_scanner's
 * web palette exactly (same hex values appear throughout its *Client.tsx
 * files) and backs the `tailwind.config.ts` color tokens here. Kept as
 * plain exports too because several native APIs (icon `color` props, SVG
 * `stroke`, StatusBar) need a raw hex string, not a className.
 */
export const colors = {
  ink: '#1A1A1A',
  lavender: '#C9A0DC',
  lavenderDark: '#b97fd0',
  purple: '#8e57b3',
  lavenderTint: '#F0DFF6',
  green: '#9fe870',
  greenDark: '#3f8b5c',
  greenTint: '#E8FBDB',
  amber: '#F5C77E',
  amberDark: '#B07F2C',
  amberTint: '#FCE9C2',
  rose: '#A84F66',
  white: '#FFFFFF',
} as const
