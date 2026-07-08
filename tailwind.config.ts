import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#145231',
        },
        mustard: {
          400: '#e8b64a',
          500: '#d4a017',
          600: '#b3860f',
        },
        terracotta: {
          400: '#e0755a',
          500: '#c85a3d',
          600: '#a8432a',
        },
      },
      fontFamily: {
        display: ['var(--font-bebas-neue)', 'Impact', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
