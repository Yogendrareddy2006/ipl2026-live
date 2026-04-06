/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#080e1a',
        card: '#0f1724',
        border:'#1a2535',
      },
      fontFamily: { sans:['Inter','system-ui','sans-serif'] },
    },
  },
  plugins: [],
};
