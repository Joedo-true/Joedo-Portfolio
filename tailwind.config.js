/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Глубокий графит / near-black для «музейной» тёмной темы
        ink: {
          950: '#06070C',
          900: '#0B0E17',
          850: '#0F1320',
          800: '#161B2B',
          700: '#232A3D',
          600: '#333B52',
        },
        // Молочно-белый для светлой темы (чистая галерея)
        cream: {
          50: '#FCFCFD',
          100: '#F6F7FA',
          200: '#EDF0F5',
        },
        brand: {
          violet: '#8B5CF6',
          indigo: '#6366F1',
          fuchsia: '#D946EF',
          cyan: '#22D3EE',
          emerald: '#10B981',
        },
      },
      boxShadow: {
        glow: '0 24px 70px -18px rgba(139, 92, 246, 0.5)',
        'glow-sm': '0 10px 34px -10px rgba(139, 92, 246, 0.55)',
        'glow-cyan': '0 24px 70px -18px rgba(34, 211, 238, 0.4)',
        card: '0 30px 80px -40px rgba(0, 0, 0, 0.6)',
        'inner-hi': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '70%': { transform: 'scale(2.2)', opacity: '0' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-26px) translateX(10px)' },
        },
        'gradient-move': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        aurora: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '33%': { transform: 'translate(6%, -8%) scale(1.15)' },
          '66%': { transform: 'translate(-6%, 6%) scale(0.95)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(400%)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 7s ease-in-out infinite',
        'float-slow': 'float-slow 11s ease-in-out infinite',
        'gradient-move': 'gradient-move 6s ease infinite',
        shimmer: 'shimmer 1.6s infinite',
        marquee: 'marquee 32s linear infinite',
        'spin-slow': 'spin-slow 26s linear infinite',
        aurora: 'aurora 18s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
        scan: 'scan 7s linear infinite',
      },
    },
  },
  plugins: [],
};
