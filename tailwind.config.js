/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#38bdf8',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        dark: {
          950: '#0a0a0a',
          900: '#121212',
          850: '#1a1a1a',
          800: '#1f1f1f',
          700: '#2a2a2a',
          600: '#3a3a3a',
        }
      },
      backgroundColor: {
        'app-bg': '#0a0a0a',
        'card-bg': '#1a1a1a',
        'card-hover': '#1f1f1f',
      },
      borderColor: {
        'card': '#2a2a2a',
      },
    },
  },
  plugins: [],
};
