/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070D18',
          900: '#0B192C',
          800: '#14274E',
          700: '#1E3E62',
          600: '#2B5885',
        },
        civic: {
          teal: '#008080',
          tealLight: '#00A8A8',
          cyan: '#00ADB5',
          amber: '#F59E0B',
          emerald: '#10B981',
          rose: '#EF4444',
          slate: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
