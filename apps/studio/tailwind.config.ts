import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#171717',
        'brand-panel': '#FFF1E3',
        'brand-accent': '#FF8800',
        'brand-secondary': '#CC6500',
        'brand-bg': '#FFF8F1',
        'brand-border': '#171717',
        'brand-muted': '#8A7662',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'DM Sans', 'sans-serif'],
        mono: ['var(--font-mono)', 'Space Mono', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '0px',
      },
      boxShadow: {
        'brutal-sm': '4px 4px 0px 0px #17171780',
        'brutal': '4px 4px 0px 0px #171717',
        'brutal-md': '4px 4px 0px 0px #171717, 4px 2px 4px -1px #171717',
        'brutal-lg': '4px 4px 0px 0px #171717, 4px 4px 6px -1px #171717',
        'brutal-xl': '4px 4px 0px 0px #171717, 4px 8px 10px -1px #171717',
        'brutal-accent': '4px 4px 0px 0px #FF8800',
      },
    },
  },
  plugins: [],
} satisfies Config;
