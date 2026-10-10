export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        canvas: '#F2F4F7',
        ok: '#2e7d32',
        bad: '#b71c1c',
        cobalt: '#17365D',
        navy: '#285A8E',
        muted: '#E8ECF1',
        watch: '#b45309',
        high: '#9a3412',
      },
      fontFamily: {
        sans: ['"Inter"', '"Noto Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
