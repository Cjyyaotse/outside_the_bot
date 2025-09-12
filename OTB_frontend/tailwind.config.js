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
      },
      backgroundImage: {
        "hd-wpaper": "url('./src/assets/images/HD_WALLPAPER.jpg')",
        "mock-map": "url('./src/assets/images/OutbotMap.png')"
      }
    },
  },
  plugins: [],
}