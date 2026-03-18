/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2563eb',    // Robust Blue
          secondary: '#7c3aed',  // Ethereal Violet
          accent: '#06b6d4',     // Energetic Cyan
          surface: '#0f172a',    // Deep Slate
          background: '#020617', // Midnight Slate
          border: '#1e293b',     // Muted Slate
        },
        luxury: {
          gold: '#fbbf24',
          rose: '#f43f5e',
          emerald: '#10b981',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}