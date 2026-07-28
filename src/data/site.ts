// Единая точка правды для контактов, мета-данных и «продающих» цифр.
// ⚠️ Цифры в `stats` — плейсхолдеры. Замените на свои реальные перед публикацией.
export const site = {
  name: 'Joedo',
  role: 'Фронтенд-разработчик на React',
  telegram: {
    handle: '@Joedotrue',
    url: 'https://t.me/Joedotrue',
  },
  email: 'joedotrue1@gmail.com',
  github: {
    handle: 'joedo-true',
    url: 'https://github.com/joedo-true',
  },
  nav: [
    { id: 'services', label: 'Services' },
    { id: 'projects', label: 'Works' },
    { id: 'stack', label: 'Skills' },
    { id: 'process', label: 'Process' },
    { id: 'contact', label: 'Contact' },
  ],
  // Плейсхолдеры — отредактируйте под свою реальную статистику
  stats: [
    { to: 10, suffix: '+', label: 'проектов в продакшене' },
    { to: 96, suffix: '', label: 'средний балл PageSpeed' },
    { to: 2.4, prefix: '×', decimals: 1, label: 'рост заявок с сайта' },
    { to: 1, suffix: '+', label: 'год в коммерческой разработке' },
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
