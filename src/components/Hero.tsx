import { motion } from 'framer-motion';
import { InteractiveGrid } from './ui/InteractiveGrid';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden pt-24 pb-16">
      {/* Фоновая интерактивная сцена */}
      <div className="absolute inset-0 bg-grid mask-fade-b opacity-70" />
      <InteractiveGrid />

      {/* Мягкие цветовые пятна */}
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-brand-violet/20 blur-3xl dark:bg-brand-violet/15" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-brand-fuchsia/15 blur-3xl" />

      <div className="container-x relative z-10">
        <motion.div variants={container} initial="hidden" animate="visible" className="max-w-3xl">
          {/* Тег доступности с пульсирующим индикатором */}
          <motion.div variants={item}>
            <span
              className="inline-flex items-center gap-2.5 rounded-full border border-brand-emerald/30
                bg-brand-emerald/10 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-brand-emerald" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-emerald" />
              </span>
              Доступен для новых проектов · Фриланс &amp; Контракт
            </span>
          </motion.div>

          {/* Главный заголовок */}
          <motion.h1
            variants={item}
            className="mt-7 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight
              text-ink-950 dark:text-white sm:text-5xl md:text-6xl lg:text-[4.1rem]"
          >
            Создаю быстрые и интерактивные{' '}
            <span className="text-gradient">веб-интерфейсы на React</span>, которые превращают ваших
            посетителей в клиентов
          </motion.h1>

          {/* Подзаголовок */}
          <motion.p
            variants={item}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300"
          >
            Специализируюсь на разработке кастомных калькуляторов, CRM-систем и умных каталогов. Навожу
            порядок в логике, ускоряю загрузку сайтов до максимума и делаю интерфейсы, в которых приятно
            работать вашим пользователям.
          </motion.p>

          {/* CTA-кнопки */}
          <motion.div variants={item} className="mt-9 flex flex-col gap-3.5 sm:flex-row sm:items-center">
            <a
              href="#projects"
              className="group inline-flex items-center justify-center gap-2 rounded-full
                bg-gradient-to-r from-brand-violet to-brand-indigo px-7 py-3.5 text-base font-semibold
                text-white shadow-glow transition-all duration-300 hover:shadow-[0_25px_70px_-15px_rgba(139,92,246,0.65)]
                hover:-translate-y-0.5"
            >
              Посмотреть мои работы
              <span className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
            </a>

            <a
              href="#contact"
              className="group relative inline-flex items-center justify-center rounded-full p-[1.5px]
                transition-transform duration-300 hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-violet via-brand-fuchsia to-brand-indigo opacity-90" />
              <span
                className="relative inline-flex items-center justify-center gap-2 rounded-full
                  bg-cream-50 px-7 py-3 text-base font-semibold text-ink-900 transition-colors
                  group-hover:bg-transparent group-hover:text-white dark:bg-ink-900 dark:text-white"
              >
                Обсудить ваш проект
              </span>
            </a>
          </motion.div>

          {/* Мелкая подпись-доверие */}
          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400"
          >
            <span className="inline-flex items-center gap-2">
              <CheckDot /> Чистый код на TypeScript
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckDot /> Адаптив под любой экран
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckDot /> Деплой на Vercel / Netlify
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Индикатор скролла */}
      <motion.a
        href="#projects"
        aria-label="Прокрутить вниз"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block"
      >
        <div className="flex h-9 w-6 items-start justify-center rounded-full border-2 border-slate-400/60 p-1.5 dark:border-slate-500/60">
          <motion.span
            className="h-1.5 w-1 rounded-full bg-slate-400 dark:bg-slate-400"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
        </div>
      </motion.a>
    </section>
  );
}

const CheckDot = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-brand-emerald">
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
    <path d="m8 12 2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
