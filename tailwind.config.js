/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Моноширинный — доминирующая гарнитура всего интерфейса (сигнатура стиля)
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        // Inter — только для длинных абзацев на русском (читаемость на малых кеглях)
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Плоский near-black — фон-«терминал», на нём читается неон
        base: {
          950: '#08080A',
          900: '#0B0B0D',
          850: '#101013',
          800: '#16161A',
          700: '#1E1E24',
        },
        // Светлая тема — «бумажный» аналог того же каркаса
        paper: {
          50: '#FFFFFF',
          100: '#F4F4F2',
          200: '#E7E7E4',
        },
        // Плоские неоновые акценты (без градиентов)
        neon: {
          magenta: '#FF3DAF',
          blue: '#3B5BFF',
          lav: '#A78BFA',
          cyan: '#22D3EE',
          acid: '#C6FF3D',
        },
      },
      letterSpacing: {
        mega: '0.18em',
        ultra: '0.28em',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '70%': { transform: 'scale(2.2)', opacity: '0' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        // Тонкая строка развёртки, проходящая по секции
        scan: {
          '0%': { transform: 'translateY(-10%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(1000%)', opacity: '0' },
        },
        // Мигающий терминальный курсор
        caret: {
          '0%, 45%': { opacity: '1' },
          '50%, 95%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        // Сдвиг ровно на один период волны — цикл замыкается бесшовно
        wave: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite',
        marquee: 'marquee 34s linear infinite',
        scan: 'scan 7s linear infinite',
        caret: 'caret 1.1s step-end infinite',
        float: 'float 8s ease-in-out infinite',
        wave: 'wave 26s linear infinite',
      },
    },
  },
  plugins: [],
};
