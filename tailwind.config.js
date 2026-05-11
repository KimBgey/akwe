/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#0A0B0F',
          1: '#12141A',
          2: '#1A1D26',
          3: '#222633',
          4: '#2A2F40',
        },
        brand: {
          50:  '#EEF4FF',
          100: '#D9E8FF',
          200: '#BACEFF',
          300: '#8AACFF',
          400: '#577DFF',
          500: '#3458EF',
          600: '#2239D5',
          700: '#1C2EAD',
          800: '#1B2B8A',
          900: '#1C2A6E',
          950: '#141B4D',
        },
        accent: {
          emerald: '#00E5A0',
          amber:   '#FFB547',
          rose:    '#FF4D6D',
          violet:  '#9B5DE5',
          cyan:    '#00CFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3458EF 0%, #9B5DE5 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #00E5A0 0%, #00CFFF 100%)',
        'gradient-amber': 'linear-gradient(135deg, #FFB547 0%, #FF4D6D 100%)',
        'gradient-surface': 'linear-gradient(180deg, #12141A 0%, #0A0B0F 100%)',
        'card-glow': 'radial-gradient(ellipse at top left, rgba(52,88,239,0.15) 0%, transparent 60%)',
      },
      boxShadow: {
        'glow-brand': '0 0 30px rgba(52,88,239,0.25)',
        'glow-emerald': '0 0 30px rgba(0,229,160,0.2)',
        'glow-amber': '0 0 20px rgba(255,181,71,0.2)',
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
