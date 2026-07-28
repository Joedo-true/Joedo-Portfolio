export interface Project {
  id: string;
  index: string;
  name: string;
  category: string;
  title: string;
  problem: string;
  solution: string;
  stack: string[];
  metrics: { value: string; label: string }[];
  /** 👉 ССЫЛКА НА ЖИВОЙ САЙТ. Кнопка «Открыть живое демо» ведёт сюда (в новой вкладке). */
  demoUrl?: string;
  /** Ссылка на репозиторий (сейчас в интерфейсе не используется). */
  codeUrl?: string;
  /** 👉 КАРТИНКА ПРОЕКТА. Положите файл в `public/` и укажите путь,
   *  например './works/autudash.webp'. Пока не задана — рисуется штриховка. */
  image?: string;
  accent: string;
}

export const projects: Project[] = [
  {
    id: 'autudash',
    index: '01',
    name: 'AutuDash',
    category: 'CRM & Analytics Dashboard',
    title: 'Интеллектуальная панель управления для бизнеса',
    problem:
      'Менеджеры малого бизнеса тратят часы на путаницу в Excel и теряют клиентов из-за медленной обработки заявок.',
    solution:
      'Интерактивные графики продаж с фильтрацией по клику, умная таблица заказов с мгновенным живым поиском и встроенная система аналитики. Интерфейс работает без единой перезагрузки страницы.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts'],
    metrics: [
      { value: '0', label: 'перезагрузок страницы' },
      { value: '×3', label: 'быстрее обработка заявок' },
      { value: 'Live', label: 'поиск и фильтрация' },
    ],
    demoUrl: 'https://joedo-true.github.io/-AutuDash-CRM/',
    codeUrl: 'https://github.com/Joedo-true/-AutuDash-CRM',
    accent: '#8B5CF6',
  },
  {
    id: 'sollers',
    index: '02',
    name: 'Sollers Shop',
    category: 'Каталог & E-commerce',
    title: 'Быстрый интернет-магазин с умными фильтрами',
    problem:
      'Стандартные магазины долго грузятся на телефонах, из-за чего бизнес теряет до 40% мобильного трафика.',
    solution:
      'Мгновенная фильтрация сотен товаров по цене (слайдер) и категориям, живая корзина с динамическим пересчётом стоимости на лету. Интегрировано внешнее API, добавлены скелетоны для бесшовной загрузки.',
    stack: ['React', 'Context API', 'Framer Motion', 'REST API'],
    metrics: [
      { value: '−40%', label: 'потерь мобильного трафика' },
      { value: '<1s', label: 'отклик фильтров' },
      { value: '100%', label: 'адаптивность' },
    ],
    demoUrl: 'https://joedo-true.github.io/-sollers-shop/',
    codeUrl: 'https://github.com/Joedo-true/-sollers-shop',
    accent: '#10B981',
  },
  {
    id: 'flexicalc',
    index: '03',
    name: 'FlexiCalc',
    category: 'Многошаговый калькулятор лидов',
    title: 'Интерактивный калькулятор стоимости услуг',
    problem:
      'Холодные клиенты уходят с сайтов, потому что не видят прозрачной цены, а менеджеры устают считать сметы вручную.',
    solution:
      'Геймифицированный опрос (квиз) из 4 шагов с плавной анимацией переходов. Считает стоимость ремонта/услуг на лету и собирает контакты в финальную форму.',
    stack: ['React', 'Framer Motion', 'React Hook Form'],
    metrics: [
      { value: '×2–3', label: 'рост конверсии в заявку' },
      { value: '4 шага', label: 'геймифицированный квиз' },
      { value: 'Live', label: 'расчёт стоимости' },
    ],
    demoUrl: 'https://joedo-true.github.io/FlexiCalc/',
    codeUrl: 'https://github.com/Joedo-true/FlexiCalc',
    accent: '#D946EF',
  },
];
