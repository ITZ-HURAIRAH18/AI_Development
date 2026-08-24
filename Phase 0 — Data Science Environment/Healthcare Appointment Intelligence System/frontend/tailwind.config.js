/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F4F4F4', // Carbon Gray 10
        surface: '#FFFFFF',    // Carbon White Layer
        'surface-hover': '#EBEBEB',
        'carbon-gray-100': '#161616',
        'carbon-gray-90': '#262626',
        'carbon-gray-80': '#393939',
        'carbon-gray-70': '#525252',
        'carbon-gray-60': '#6F6F6F',
        'carbon-gray-50': '#8D8D8D',
        'carbon-gray-30': '#C6C6C6',
        'carbon-gray-20': '#E0E0E0',
        'carbon-gray-10': '#F4F4F4',
        primary: {
          50: '#EDF5FF',
          100: '#D0E2FF',
          200: '#A6C8FF',
          300: '#78A9FF',
          400: '#4589FF',
          500: '#0F62FE', // Carbon Blue 60
          600: '#0353E9', // Carbon Blue 70
          700: '#002D9C', // Carbon Blue 80
          800: '#001D6C',
          900: '#001141',
        },
        charcoal: {
          DEFAULT: '#161616',
          muted: '#525252',
        },
        border: '#E0E0E0',
        'border-strong': '#8D8D8D',
        success: '#198038', // Carbon Green 60
        warning: '#F1C21B', // Carbon Yellow 30
        danger: '#DA1E28',  // Carbon Red 60
        info: '#4589FF',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        carbon: '0 2px 6px 0 rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}