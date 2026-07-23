export interface WorkflowStep {
  num: string;
  title: string;
  description: string;
  icon: string;
}

export const workflowSteps: WorkflowStep[] = [
  {
    num: '01',
    title: 'Обсуждение и ТЗ',
    description:
      'Анализирую ваши бизнес-задачи, изучаю конкурентов, составляю чёткую структуру будущего сайта.',
    icon: '💬',
  },
  {
    num: '02',
    title: 'Проектирование (UI/UX)',
    description:
      'Создаю удобную сетку интерфейса, утверждаем логику работы кнопок, форм и калькуляторов.',
    icon: '🎨',
  },
  {
    num: '03',
    title: 'Разработка на React',
    description:
      'Пишу чистый, масштабируемый код на TypeScript, настраиваю быстрые фильтры, анимации и адаптивную вёрстку под мобильные устройства.',
    icon: '⚛️',
  },
  {
    num: '04',
    title: 'Тестирование и запуск',
    description:
      'Проверяю скорость работы, исправляю баги, разворачиваю проект на быстром хостинге (Vercel/Netlify) и передаю вам готовую работу.',
    icon: '🚀',
  },
];
