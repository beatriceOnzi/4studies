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
        },
        pink:{
          medium: '#C7148C',
          dark: '#7A1A58',
          light: '#df81d1',
          darker: '#4F0C2F'
        },
        blue:{
          medium: '#5D8CE3',
          dark:'#20113B'
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
