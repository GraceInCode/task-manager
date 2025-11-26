/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, sophisticated palette
        cream: '#faf7f0',
        sand: '#f4f0e8',
        clay: '#e8ddd4',
        terracotta: '#d4a574',
        rust: '#b8956a',
        charcoal: '#2d2926',
        ink: '#1a1816',
        sage: '#9ca986',
        moss: '#7d8471',
        lavender: '#c8b5d1',
        plum: '#8b7a9e',
        coral: '#e8a598',
        peach: '#f2c4a0',
        mint: '#b8d4c8',
        steel: '#6b7280',
        fog: '#9ca3af',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        handwriting: ['Caveat', 'cursive'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(45, 41, 38, 1)',
        'soft-warm': '0 8px 32px rgba(212, 165, 116, 0.15)',
        'ink-drop': '0 4px 20px rgba(26, 24, 22, 0.25)',
        'paper': '0 2px 8px rgba(45, 41, 38, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        'torn': '0 3px 12px rgba(45, 41, 38, 0.12)',
      },
      animation: {
        'wiggle': 'wiggle 0.3s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'tilt': 'tilt 0.2s ease-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        tilt: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-2deg)' },
        },
      },
      cursor: {
        'fancy': 'url("data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="%23d4a574"/%3E%3C/svg%3E") 12 12, pointer',
      },
    },
  },
  plugins: [],
}