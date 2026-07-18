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
        // Editorial Romance tokens, backed by CSS custom properties (global.css
        // / palette.ts ofVars, guarded by palette.sync.test.ts). Mirrors the JS
        // `editorial` object: `useTheme().editorial.onSurface` ↔ `text-ed-on-surface`.
        ed: {
          'bg': 'var(--ed-bg)',
          'surface': 'var(--ed-surface)',
          'surface-container-lowest': 'var(--ed-surface-container-lowest)',
          'surface-container-low': 'var(--ed-surface-container-low)',
          'surface-container': 'var(--ed-surface-container)',
          'surface-container-high': 'var(--ed-surface-container-high)',
          'surface-container-highest': 'var(--ed-surface-container-highest)',
          'on-surface': 'var(--ed-on-surface)',
          'on-surface-variant': 'var(--ed-on-surface-variant)',
          'primary-container': 'var(--ed-primary-container)',
          'on-primary': 'var(--ed-on-primary)',
          'on-primary-container': 'var(--ed-on-primary-container)',
          'primary-fixed': 'var(--ed-primary-fixed)',
          'surface-tint': 'var(--ed-surface-tint)',
          'secondary': 'var(--ed-secondary)',
          'secondary-container': 'var(--ed-secondary-container)',
          'on-secondary-container': 'var(--ed-on-secondary-container)',
          'tertiary-container': 'var(--ed-tertiary-container)',
          'tertiary-fixed': 'var(--ed-tertiary-fixed)',
          'on-tertiary-fixed': 'var(--ed-on-tertiary-fixed)',
          'on-tertiary-container': 'var(--ed-on-tertiary-container)',
          'outline': 'var(--ed-outline)',
          'outline-variant': 'var(--ed-outline-variant)',
          'error': 'var(--ed-error)',
          'header-tint': 'var(--ed-header-tint)',
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
