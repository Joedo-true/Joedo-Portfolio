// Единая точка правды для контактов и мета-данных.
// Замените значения на свои перед деплоем.
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
    { id: 'projects', label: 'Проекты' },
    { id: 'stack', label: 'Стек' },
    { id: 'process', label: 'Процесс' },
    { id: 'contact', label: 'Контакты' },
  ],
} as const;
