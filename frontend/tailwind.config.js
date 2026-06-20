/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Naturalist-modern theme colors (matching images)
        eco: {
          light: '#F4F6F0',      // Soft background cream/light green
          card: '#F8FAF5',       // Even lighter green/cream for card container background
          green: '#4D7C5B',      // Warm moss green for primary buttons and highlights
          dark: '#1E352F',       // Deep pine/forest green for headers and accents
          border: '#E2E8D8',     // Subtle moss border
          textLight: '#717D6E',  // Muted body text
          accent: '#E65C00',     // Light rust or orange-yellow highlights for alerts/fire
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
