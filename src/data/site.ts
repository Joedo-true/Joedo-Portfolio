// Единая точка правды для контактов, мета-данных и «продающих» цифр.
// ⚠️ Цифры в `stats` — плейсхолдеры. Замените на свои реальные перед публикацией.
export const site = {
  name: 'Joedo',
  role: 'Фронтенд-разработчик на React',
  telegram: {
    handle: '@joedo_dev',
    url: 'https://t.me/joedo_dev',
  },
  email: 'hello@joedo.dev',
  github: {
    handle: 'joedo-true',
    url: 'https://github.com/joedo-true',
  },
  nav: [
    { id: 'services', label: 'Услуги' },
    { id: 'projects', label: 'Кейсы' },
    { id: 'stack', label: 'Стек' },
    { id: 'process', label: 'Процесс' },
    { id: 'contact', label: 'Контакты' },
  ],
  // Плейсхолдеры — отредактируйте под свою реальную статистику
  stats: [
    { to: 40, suffix: '+', label: 'проектов в продакшене' },
    { to: 96, suffix: '', label: 'средний балл PageSpeed' },
    { to: 2.4, prefix: '×', decimals: 1, label: 'рост заявок с сайта' },
    { to: 5, suffix: '+', label: 'лет в коммерческой разработке' },
  ],
  marquee: [
    'React-интерфейсы',
    'TypeScript',
    'PageSpeed 90+',
    'Живые калькуляторы',
    'CRM-дашборды',
    'Умные каталоги',
    'Анимации на Framer Motion',
    'Адаптив под любой экран',
    'Чистый масштабируемый код',
  ],
} as const;
