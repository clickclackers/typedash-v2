/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'pink-8008': '#f44c7f',
        'grey-8008': '#333a45',
        'lightgrey-8008': '#939eae',
      },
    },
    plugins: [],
  },
};
