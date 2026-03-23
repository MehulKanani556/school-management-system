/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#58a6ff',    // High-Spec Blue
          secondary: '#7c3aed',  // Neural Purple
          accent: '#00f2ff',     // Liquid Cyan
          surface: '#0b1120',    // Deep Sea Navy (Premium Depth)
          background: '#020617', // Midnight Core
          border: '#1e293b',     // Metallic Slate
        },
        luxury: {
          gold: '#fbbf24',
          rose: '#f43f5e',
          emerald: '#10b981',
        },
        // Role-based Themes (Max Vibrancy Cyber-Accents)
        superadmin: {
          primary: '#818cf8',    // Indigo Pulse
          secondary: '#6366f1',
        },
        schooladmin: {
          primary: '#0ea5e9',    // Cyber Cyan
          secondary: '#0284c7',
        },
        teacher: {
          primary: '#a855f7',    // Amethyst Core
          secondary: '#9333ea',
        },
        student: {
          primary: '#10b981',    // Neon Emerald
          secondary: '#059669',
        },
        parent: {
          primary: '#f43f5e',    // Rose Command
          secondary: '#e11d48',
        },
        accountant: {
          primary: '#fbbf24',    // Amber Ledger
          secondary: '#f59e0b',
        },
        librarian: {
          primary: '#06b6d4',    // Flux Sky
          secondary: '#0891b2',
        },
        transporter: {
          primary: '#fb923c',    // Kinetic Orange
          secondary: '#f97316',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      screens: {
        xs: "320px",
        sm375: "375px",
        sm: "425px",
        md600: "601px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
        "3xl": "1920px",
        "4xl": "2560px",
      },
      container: {
        center: true, // Center the container by default
        screens: {
          sm: '420px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
          '3xl': '1800px',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}