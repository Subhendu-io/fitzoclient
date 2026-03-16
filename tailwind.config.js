/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#C8FF32', // Neon Green
        background: '#0D0D0D', // Deep Black/Grey
        card: '#1A1A1A', // Surface Grey
        text: {
          DEFAULT: '#FFFFFF',
          secondary: '#9E9E9E',
        },
        success: '#C8FF32',
        error: '#EF4444',
      },
      fontFamily: {
        kanit: ['Kanit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
