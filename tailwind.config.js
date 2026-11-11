/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Noto Serif"', 'Georgia', 'serif'],
        sans: ['"Noto Sans"', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        ink: '#003366',
        nave: '#f7f8fa',
        gold: '#003366',
        'gold-deep': '#00264d',
        parchment: '#303336',
        velvet: '#003366',
        denim: '#004d99',
        alerta: '#9b2c2c',
        paper: '#f7f8fa',
      },
    },
  },
  plugins: [],
};
