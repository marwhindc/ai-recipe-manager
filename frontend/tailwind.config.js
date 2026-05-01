/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — matches DESIGN.md / Culinary-Canvas prototype
        saffron:    '#f0a83c',   // warm accent, gradient highlights
        paprika:    '#e07255',   // primary action: nav active, CTAs, focus rings
        olive:      '#6e7d45',   // secondary accent
        cream:      '#faf7f2',   // app background, page fill
        espresso:   '#3d3028',   // primary text and headings
        linen:      '#e8dfd4',   // dividers, card outlines, input strokes
        parchment:  '#ede8e1',   // secondary surfaces, skeletons, muted bg
        taupe:      '#918880',   // secondary text, timestamps, metadata
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem'
      },
      boxShadow: {
        card: '0 4px 24px rgba(58, 45, 31, 0.08)'
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' }
        },
        slideDown: {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(100%)' }
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' }
        }
      },
      animation: {
        'slide-up': 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-down': 'slideDown 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.2s ease-out forwards'
      }
    }
  },
  plugins: []
}