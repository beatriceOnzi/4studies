/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/views/**/*{.handlebars, html, js}"],
  theme: {
    extend: {
       colors: {
        white: '#F4EDFF',
        purple:{
          light: '#C18CED',
          dark: '#282161',
        },
        pink:{
          medium: '#C7148C',
          dark: '#7A1A58',
          light: '#df81d1',
          darker: '#4F0C2F'
        },
        blue:{
          medium: '#362E81',
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
