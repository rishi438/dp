/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#070b14',
          900: '#0f172a',
          850: '#131e36',
          800: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
