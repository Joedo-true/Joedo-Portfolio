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
        // Глубокий графит для тёмной темы (не чистый чёрный)
        ink: {
          950: '#0B1120',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        },
        // Молочно-белый для светлой темы
        cream: {
          50: '#FCFCFD',
          100: '#F7F8FA',
          200: '#EEF1F5',
        },
        brand: {
          violet: '#8B5CF6',
          indigo: '#6366F1',
          fuchsia: '#D946EF',
          emerald: '#10B981',
        },
      },
      boxShadow: {
        glow: '0 20px 60px -15px rgba(139, 92, 246, 0.45)',
        'glow-sm': '0 8px 30px -8px rgba(139, 92, 246, 0.5)',
        card: '0 24px 60px -30px rgba(15, 23, 42, 0.35)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '70%': { transform: 'scale(2.2)', opacity: '0' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'gradient-move': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 7s ease-in-out infinite',
        'gradient-move': 'gradient-move 6s ease infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
