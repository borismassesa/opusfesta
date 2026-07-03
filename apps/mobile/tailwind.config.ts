import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  // Class-based dark mode: the active scheme is driven by NativeWind's
  // `colorScheme` (set from ColorSchemeProvider), which flips the `of-*` CSS
  // variables declared in global.css (:root = light, .dark:root = dark).
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Backed by CSS custom properties so a single class works in both
        // schemes. Values live in global.css / src/constants/palette.ts (ofVars),
        // kept in sync by src/theme/palette.sync.test.ts. `of-surface` is the
        // themed card background that replaces raw `bg-white`.
        of: {
          primary: 'var(--of-primary)',
          medium: 'var(--of-medium)',
          light: 'var(--of-light)',
          pale: 'var(--of-pale)',
          cream: 'var(--of-cream)',
          surface: 'var(--of-surface)',
          white: 'var(--of-white)',
          dark: 'var(--of-dark)',
          text: 'var(--of-text)',
          muted: 'var(--of-muted)',
          border: 'var(--of-border)',
          green: 'var(--of-green)',
          gold: 'var(--of-gold)',
          coral: 'var(--of-coral)',
          ink: 'var(--of-ink)',
          line: 'var(--of-line)',
          danger: 'var(--of-danger)',
          accent: 'var(--of-accent)',
          placeholder: 'var(--of-placeholder)',
        },
        br: {
          bg: '#faf7fc',
          surface: '#faf7fc',
          'on-surface': '#1A0A2E',
          'on-surface-variant': '#6B5A7A',
          'primary-container': '#5B2D8E',
          'on-primary': '#ffffff',
          'surface-tint': '#7B4FA2',
          'tertiary-container': '#7B4FA2',
          'secondary-container': '#E5CFF0',
          'on-secondary-container': '#3D1B66',
          'tertiary-fixed': '#F3EBF9',
          'on-tertiary-fixed': '#2A1245',
          'surface-container-low': '#f6f1f9',
          'surface-container': '#f0e8f5',
          'surface-container-high': '#e8ddf0',
          'surface-container-highest': '#e0d4e8',
          'surface-container-lowest': '#ffffff',
          outline: '#8E7A9E',
          'outline-variant': '#D8C8E4',
          'primary-fixed': '#F0E2F7',
          'on-primary-container': '#C9A0DC',
          'on-tertiary-container': '#C9A0DC',
          error: '#ba1a1a',
          secondary: '#7B4FA2',
        },
      },
      fontFamily: {
        playfair: ['PlayfairDisplay-SemiBold'],
        'playfair-bold': ['PlayfairDisplay-Bold'],
        'space-grotesk': ['SpaceGrotesk-Regular'],
        'space-grotesk-bold': ['SpaceGrotesk-Bold'],
        'work-sans': ['WorkSans-Regular'],
        'work-sans-medium': ['WorkSans-Medium'],
        'work-sans-semibold': ['WorkSans-SemiBold'],
        'work-sans-bold': ['WorkSans-Bold'],
        'dancing-script': ['DancingScript-Regular'],
        'dancing-script-bold': ['DancingScript-Bold'],
      },
      borderRadius: {
        card: '24px',
        button: '9999px',
        pill: '9999px',
        chip: '20px',
        input: '14px',
      },
    },
  },
  plugins: [],
};

export default config;
