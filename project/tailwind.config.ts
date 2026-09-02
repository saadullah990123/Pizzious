import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Single brand typeface everywhere — set via next/font in layout.tsx.
        // Falls back to system fonts only if the web font somehow fails to load.
        sans: ['var(--font-jakarta)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#FFFDF9',
          100: '#FBF8F1',
          200: '#F3EEDB',
          300: '#E7DEC0',
          400: '#D5C799',
          500: '#FF4500',
          600: '#E63900',
          700: '#CC3300',
          800: '#992600',
          900: '#661A00',
          flame: '#FF4500',
          flameDark: '#D63A00',
          yellow: '#F59E0B',
          yellowLight: '#FEF3C7',
          gold: '#D97706',
          surface: '#FFFFFF',
          bg: '#F8F6F0',
          bgAlt: '#F1EDE2',
          darkText: '#18181B',
          mutedText: '#52525B',
          card: '#FFFFFF',
          cardHover: '#FAFAF7',
          border: '#E8E4D8',
          borderLight: '#F2EFE6',
          dark: '#141416',
          darker: '#0C0D0E',
        },
      },
      boxShadow: {
        'glow-flame': '0 4px 20px -2px rgba(255, 69, 0, 0.35)',
        'glow-yellow': '0 4px 20px -2px rgba(245, 158, 11, 0.35)',
        'glow-whatsapp': '0 4px 20px 2px rgba(37, 211, 102, 0.4)',
        'card': '0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 12px 30px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.95' },
        }
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
export default config;