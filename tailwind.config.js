/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 👈 これだ！この一行が手動切り替えを可能にする
  theme: {
    extend: {},
  },
  plugins: [],
}