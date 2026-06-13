/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ocean': {
          50: '#e6f7ff',
          100: '#b3e7ff',
          200: '#80d7ff',
          300: '#4dc7ff',
          400: '#1ab7ff',
          500: '#00d4ff',
          600: '#00a8cc',
          700: '#007c99',
          800: '#005066',
          900: '#002433',
        },
        'primary': {
          deep: '#0a1628',
          main: '#1e3a5f',
          light: '#2d5a87',
          accent: '#00d4ff',
        },
        'secondary': {
          teal: '#0d9488',
          purple: '#7c3aed',
        },
        'status': {
          normal: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#3b82f6',
          low: '#6b7280',
        },
        'sea': {
          calm: '#06b6d4',
          moderate: '#22c55e',
          rough: '#eab308',
          'very-rough': '#f97316',
          extreme: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 212, 255, 0.4)',
      },
    },
  },
  plugins: [],
}
