/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          0: 'rgb(var(--surface-0) / <alpha-value>)',
          1: 'rgb(var(--surface-1) / <alpha-value>)',
          2: 'rgb(var(--surface-2) / <alpha-value>)',
          3: 'rgb(var(--surface-3) / <alpha-value>)',
          4: 'rgb(var(--surface-4) / <alpha-value>)',
        },
        ink: 'rgb(var(--ink) / <alpha-value>)',
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
          emerald: 'rgb(var(--accent-emerald) / <alpha-value>)',
          amber:   'rgb(var(--accent-amber) / <alpha-value>)',
          rose:    'rgb(var(--accent-rose) / <alpha-value>)',
          violet:  'rgb(var(--accent-violet) / <alpha-value>)',
          cyan:    'rgb(var(--accent-cyan) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3458EF 0%, #9B5DE5 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #00E5A0 0%, #00CFFF 100%)',
        'gradient-amber': 'linear-gradient(135deg, #FFB547 0%, #FF4D6D 100%)',
        'gradient-surface': 'linear-gradient(180deg, rgb(var(--surface-1)) 0%, rgb(var(--surface-0)) 100%)',
        'card-glow': 'radial-gradient(ellipse at top left, rgba(52,88,239,0.15) 0%, transparent 60%)',
      },
      boxShadow: {
        'glow-brand': '0 0 30px rgba(52,88,239,0.25)',
        'glow-emerald': '0 0 30px rgba(0,229,160,0.2)',
        'glow-amber': '0 0 20px rgba(255,181,71,0.2)',
        'card': '0 1px 3px rgb(var(--shadow-ambient) / calc(0.4 * var(--shadow-scale))), 0 4px 16px rgb(var(--shadow-ambient) / calc(0.3 * var(--shadow-scale)))',
        'card-hover': '0 4px 24px rgb(var(--shadow-ambient) / calc(0.5 * var(--shadow-scale))), 0 0 0 1px rgb(var(--ink) / 0.05)',
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
        'marquee': 'marquee var(--marquee-duration, 30s) linear infinite',
        'marquee-reverse': 'marquee-reverse var(--marquee-duration, 30s) linear infinite',
        'pop-in': 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        'float-up': 'floatUp 2.4s ease-out forwards',
        'ring-out': 'ringOut 1.6s ease-out infinite',
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
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.4)' },
          '60%': { opacity: '1', transform: 'scale(1.1)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        floatUp: {
          '0%': { opacity: '0', transform: 'translateY(0) scale(0.7)' },
          '15%': { opacity: '1' },
          '85%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(-140px) scale(1)' },
        },
        ringOut: {
          '0%': { opacity: '0.5', transform: 'scale(0.8)' },
          '100%': { opacity: '0', transform: 'scale(1.8)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
