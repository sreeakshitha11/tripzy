/** @type {import('tailwindcss').Config} */

// Forest Trails palette. The five brand colours live as CSS variables in src/index.css
// (so plain CSS can use them too); Tailwind reads them here with opacity support.
const token = name => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colours
        forest: token('forest'),   // #142D20 - navigation, dark surfaces, headings
        pine: token('pine'),       // #245C45 - primary actions
        sage: token('sage'),       // #7FAF82 - secondary highlights
        soft: token('soft-green'), // #D8E8C8 - chips, selected states, gentle highlights
        linen: token('linen'),     // #F7F5E8 - page background

        // Semantic tokens
        ink: token('text-primary'),     // #18271D - body text on light surfaces
        muted: token('text-secondary'), // #526456 - descriptions, metadata
        line: token('border-color'),    // #DCE5D8 - card and input borders

        // Green accent scale built around the brand colours (replaces cyan/sky/teal/blue/indigo/purple)
        trail: {
          50: '#EEF4E6',
          100: token('soft-green'),
          200: '#BFD8B0',
          300: '#9FC496',
          400: token('sage'),
          500: '#3A7556',
          600: token('pine'),
          700: '#1E4D3A',
          800: '#193D2E',
          900: token('forest'),
          950: '#0C1D14',
        },
        // Sage-tinted neutral scale (replaces slate)
        moss: {
          50: token('linen'),
          100: '#EEEFE2',
          200: token('border-color'),
          300: '#C2CDBF',
          400: '#5F7063',
          500: token('text-secondary'),
          600: '#435346',
          700: '#2F3E33',
          800: token('text-primary'),
          900: '#122019',
          950: '#0B1510',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(20, 45, 32, 0.06)',
        'premium': '0 10px 30px -5px rgba(36, 92, 69, 0.12)',
        'glow': '0 0 20px rgba(127, 175, 130, 0.25)'
      }
    },
  },
  plugins: [],
}
