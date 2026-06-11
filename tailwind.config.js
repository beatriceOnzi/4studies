/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/views/**/*{.handlebars, html, js}"],
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
        soul: ['My Soul', 'sans-serif'],
        italianno: ['Italianno', 'sans-serif'],
        marck: ['Marck Script', 'sans-serif']
      }
    },
  },
  plugins: [],
}
