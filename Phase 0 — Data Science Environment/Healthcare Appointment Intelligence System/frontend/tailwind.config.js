/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F7F8F6',
        surface: '#FFFFFF',
        primary: {
          50: '#EFF8F7',
          100: '#D9EFEC',
          200: '#B3DFDA',
          300: '#8CCFC8',
          400: '#4FAFA5',
          500: '#2B8E84',
          600: '#1F6E66',
          700: '#115E59',
          800: '#0E4A46',
          900: '#0A3834',
        },
        charcoal: {
          DEFAULT: '#1E293B',
          muted: '#64748B',
        },
        border: '#E5E7EB',
        success: '#15803D',
        warning: '#B45309',
        danger: '#B91C1C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
}