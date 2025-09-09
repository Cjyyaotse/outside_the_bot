/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "manrope": ["Manrope", "sans-serif"]
      },
      colors: {
        "primary": "#000000"
      }
    },
  },
  plugins: [],
}