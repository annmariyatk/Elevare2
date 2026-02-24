/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        elevare: {
          blue: "#0091DA",
          dark: "#006bb3",
        }
      }
    },
  },
  plugins: [],
}