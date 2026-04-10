/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './script.js'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        skyline: '#0ea5e9',
        mint: '#34d399',
        cloud: '#f8fafc'
      },
      boxShadow: {
        glow: '0 20px 50px rgba(14, 165, 233, 0.18)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
