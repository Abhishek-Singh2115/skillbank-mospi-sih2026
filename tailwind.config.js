/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index-new.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(30, 58, 138, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 30px -4px rgba(30, 58, 138, 0.14), 0 4px 10px -2px rgba(0, 0, 0, 0.06)',
        'glow-blue': '0 0 25px -5px rgba(37, 99, 235, 0.4)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
      }
    },
  },
  plugins: [],
}
