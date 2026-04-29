/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dce9ff',
          500: '#2b6be8',
          600: '#1f59d8',
          700: '#1747b0',
          900: '#102a69',
        },
      },
    },
  },
  plugins: [],
}
