/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF8F5',
          100: '#F5EFEB',
          200: '#EDE4D8',
          300: '#E1D3C1',
          400: '#CEBC9F',
          500: '#B59E7E',
          600: '#957C5D',
          700: '#6F5940',
          800: '#463625',
          900: '#261B12',
          950: '#18110B',
        },
        caramel: {
          50: '#FFF8F1',
          100: '#FEF0E1',
          200: '#FCDCC2',
          300: '#F8C199',
          400: '#F29F64',
          500: '#E07A2B',
          600: '#C7621B',
          700: '#A34814',
          800: '#813814',
          900: '#692E14',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'creamy': '0 4px 20px -2px rgba(90, 65, 45, 0.06), 0 2px 6px -1px rgba(90, 65, 45, 0.04)',
        'creamy-lg': '0 10px 30px -4px rgba(90, 65, 45, 0.08), 0 4px 12px -2px rgba(90, 65, 45, 0.05)',
        'creamy-xl': '0 20px 40px -6px rgba(90, 65, 45, 0.12), 0 8px 16px -4px rgba(90, 65, 45, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
