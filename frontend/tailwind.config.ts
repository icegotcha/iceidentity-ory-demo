/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#f50057',
        'primary-dark': '#bd0041',
        'primary-light': '#ffd9dc',
      },
    },
  },
  plugins: [],
}
