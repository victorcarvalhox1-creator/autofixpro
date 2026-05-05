export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        mono: ['"Courier New"', 'monospace'],
      },
      colors: {
        brand: {
          midnight: '#0F172A',
          slate: '#1E293B',
          gray: '#64748B',
          'gray-light': '#94A3B8',
          'gray-border': '#CBD5E1',
          'gray-bg': '#F1F5F9',
          snow: '#F8FAFC',
          amber: '#F59E0B',
          'amber-dark': '#D97706',
        }
      }
    },
  },
  plugins: [],
}
