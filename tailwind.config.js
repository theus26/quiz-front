/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cinzel', 'Palatino Linotype', 'serif'],
        sans: ['Outfit', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        ink: '#161214',
        nave: '#241c1e',
        gold: '#f0d4d6',
        'gold-deep': '#782832',
        parchment: '#f6f3ee',
        velvet: '#782832',
        denim: '#9eb6d4',
        alerta: '#f0b4b4',
        paper: '#f3efe8',
      },
    },
  },
  plugins: [],
};
