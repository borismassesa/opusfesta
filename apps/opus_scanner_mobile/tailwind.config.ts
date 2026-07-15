import type { Config } from 'tailwindcss'

/**
 * Colors mirror apps/opus_scanner's web palette exactly (see
 * src/constants/theme.ts for the canonical values) so ported screens keep
 * the same look with the same class names.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#1A1A1A',
        lavender: '#C9A0DC',
        'lavender-dark': '#b97fd0',
        purple: '#8e57b3',
        'lavender-tint': '#F0DFF6',
        green: '#9fe870',
        'green-dark': '#3f8b5c',
        'green-tint': '#E8FBDB',
        amber: '#F5C77E',
        'amber-dark': '#B07F2C',
        'amber-tint': '#FCE9C2',
        rose: '#A84F66',
      },
    },
  },
  plugins: [],
}

export default config
