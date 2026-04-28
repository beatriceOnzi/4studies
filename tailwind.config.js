/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*{.handlebars, html, js}"],
  theme: {
    extend: {
      fontFamily: {
        festive: ['Festive', 'sans-serif'],
        oregano: ['Oregano', 'sans-serif'],
        soul: ['My Soul', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
