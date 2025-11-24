import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        sage: {
          50: '#f2fbf5',
          100: '#e1f6e8',
          200: '#c3ebd2',
          300: '#94dcb0',
          400: '#5ec489',
          500: '#38a76b',
          600: '#298653',
          700: '#246b45',
          800: '#215539',
          900: '#1c4631',
        },
        blush: {
          50: '#fdf2f8',
          100: '#fce7f3',
          500: '#f472b6',
        },
        charcoal: {
          900: '#0f172a',
        },
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'marquee-up': 'marquee-up 40s linear infinite',
        'marquee-down': 'marquee-down 40s linear infinite',
        'fade-in': 'fadeSlideIn 0.8s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'marquee-up': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        'marquee-down': {
          '0%': { transform: 'translateY(-50%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeSlideIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
