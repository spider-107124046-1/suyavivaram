/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
      },
      colors: {
        cerulean: '#2274a5',
        blaze: '#f75c03',
        carrot: '#f49009',
        amber: '#f1c40f',
        paprika: '#e5643c',
        berry: '#d90368',
        dimgrey: '#6d6867',
        emerald: '#00cc66',
      },
    },
  },
  plugins: [],
}
