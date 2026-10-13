/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#F7F6F2',
          light: '#FCFBF8',
          dark: '#EBE9E1',
        },
        ink: {
          DEFAULT: '#20251F',
          muted: '#60695C',
          light: '#8C9488',
          faint: '#B8BEB5',
        },
        emerald: {
          DEFAULT: '#246B50',
          dark: '#1B523D',
          light: '#358A6A',
          surface: '#E6F0E9',
          border: '#C3DC sample-C9',
        },
        amber: {
          DEFAULT: '#B87928',
          dark: '#8E5B1A',
          surface: '#FDF4E7',
          border: '#F4D4A4',
        },
        crimson: {
          DEFAULT: '#B94B43',
          dark: '#8F342D',
          surface: '#FCECEB',
          border: '#F3BDB9',
        },
        border: {
          DEFAULT: '#E2E0D8',
          light: '#EEECE5',
          dark: '#CBC8BD',
        },
        surface: {
          white: '#FFFFFF',
          card: '#FAFAF8',
          muted: '#F0EFEA',
        }
      },
      fontFamily: {
        serif: ['Lora', 'Merriweather', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'fine': '0 1px 2px 0 rgba(32, 37, 31, 0.04)',
        'panel': '0 2px 8px -2px rgba(32, 37, 31, 0.06), 0 1px 3px -1px rgba(32, 37, 31, 0.04)',
        'elevated': '0 8px 24px -4px rgba(32, 37, 31, 0.08), 0 2px 6px -2px rgba(32, 37, 31, 0.04)',
      }
    },
  },
  plugins: [],
}
