/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
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
        // Role-based Themes (Dynamic Context Adapters)
        superadmin: {
          primary: 'rgb(var(--color-primary-rgb, 129 140 248) / <alpha-value>)',
          secondary: 'rgb(var(--color-secondary-rgb, 99 102 241) / <alpha-value>)',
        },
        schooladmin: {
          primary: 'rgb(var(--color-primary-rgb, 14 165 233) / <alpha-value>)',
          secondary: 'rgb(var(--color-secondary-rgb, 2 132 199) / <alpha-value>)',
        },
        teacher: {
          primary: 'rgb(var(--color-primary-rgb, 168 85 247) / <alpha-value>)',
          secondary: 'rgb(var(--color-secondary-rgb, 147 51 234) / <alpha-value>)',
        },
        student: {
          primary: 'rgb(var(--color-primary-rgb, 16 185 129) / <alpha-value>)',
          secondary: 'rgb(var(--color-secondary-rgb, 5 150 105) / <alpha-value>)',
        },
        parent: {
          primary: 'rgb(var(--color-primary-rgb, 244 63 94) / <alpha-value>)',
          secondary: 'rgb(var(--color-secondary-rgb, 225 29 72) / <alpha-value>)',
        },
        accountant: {
          primary: 'rgb(var(--color-primary-rgb, 251 191 36) / <alpha-value>)',
          secondary: 'rgb(var(--color-secondary-rgb, 245 158 11) / <alpha-value>)',
        },
        librarian: {
          primary: 'rgb(var(--color-primary-rgb, 6 182 212) / <alpha-value>)',
          secondary: 'rgb(var(--color-secondary-rgb, 8 145 178) / <alpha-value>)',
        },
        transporter: {
          primary: 'rgb(var(--color-primary-rgb, 251 146 60) / <alpha-value>)',
          secondary: 'rgb(var(--color-secondary-rgb, 249 115 22) / <alpha-value>)',
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