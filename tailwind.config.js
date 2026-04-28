/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*{.handlebars, html, js}"],
  theme: {
    extend: {
       colors: {
        branco: '#F4EDFF',
        azul: '#362E81',
        roxo:{
          claro: '#C18CED',
          escuro: '#282161',
        }
      },
      fontFamily: {
        festive: ['Festive', 'sans-serif'],
        oregano: ['Oregano', 'sans-serif'],
        soul: ['My Soul', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
