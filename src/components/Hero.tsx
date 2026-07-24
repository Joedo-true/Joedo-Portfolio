import { motion } from 'framer-motion';
import { HeroCanvas } from './three/HeroCanvas';
import { Counter } from './ui/Counter';
import { site } from '../data/site';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-32 top-0 h-[38rem] w-[38rem] animate-aurora rounded-full bg-brand-violet/20 blur-3xl dark:bg-brand-violet/25" />
      <div className="absolute right-[-10%] top-24 h-[34rem] w-[34rem] animate-aurora rounded-full bg-brand-fuchsia/15 blur-3xl [animation-delay:-6s]" />
      <div className="absolute bottom-[-20%] left-1/3 h-[36rem] w-[36rem] animate-aurora rounded-full bg-brand-cyan/10 blur-3xl [animation-delay:-11s]" />
    </div>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-28 pb-14 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:pt-24"
    >
      <div className="absolute inset-0 bg-grid mask-fade-b opacity-60" />
      <Aurora />

      <div className="container-x relative z-10 grid items-center gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:gap-8">
        {/* Левая колонка — оффер */}
        <motion.div variants={container} initial="hidden" animate="visible" className="order-2 lg:order-1">
          <motion.div variants={item} className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-brand-emerald/30 bg-brand-emerald/10 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-brand-emerald" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-emerald" />
              </span>
              Свободен для новых проектов
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">
              осталось 2 слота в этом месяце
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 text-balance text-4xl font-extrabold leading-[1.06] tracking-tight text-ink-950 dark:text-white sm:text-5xl md:text-6xl lg:text-[3.85rem]"
          >
            Создаю React-интерфейсы, которые{' '}
            <span className="text-gradient">продают за вас</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300"
          >
            Калькуляторы лидов, CRM-панели и умные каталоги под ключ. Ускоряю загрузку до максимума,
            навожу порядок в логике и делаю так, чтобы каждый экран работал на заявку — а не просто
            красиво выглядел.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
            <a
              href="#projects"
              data-cursor
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-violet to-brand-indigo px-7 py-3.5 text-base font-semibold text-white shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_80px_-15px_rgba(139,92,246,0.7)]"
            >
              Смотреть кейсы
              <span className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
            </a>
            <a
              href="#contact"
              data-cursor
              className="gradient-border group inline-flex items-center justify-center gap-2 rounded-full bg-white/70 px-7 py-3.5 text-base font-semibold text-ink-900 transition-all duration-300 hover:-translate-y-0.5 dark:bg-white/[0.04] dark:text-white"
            >
              Получить оценку за 24 часа
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </a>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400"
          >
            <span className="inline-flex items-center gap-2"><Dot /> Фиксирую сроки и смету</span>
            <span className="inline-flex items-center gap-2"><Dot /> Отвечаю за результат</span>
            <span className="inline-flex items-center gap-2"><Dot /> Деплой под ключ</span>
          </motion.div>
        </motion.div>

        {/* Правая колонка — 3D-экспонат */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="relative order-1 h-[20rem] sm:h-[24rem] lg:order-2 lg:h-[34rem]"
        >
          <div className="absolute inset-0 -z-10 m-auto h-3/4 w-3/4 rounded-full bg-brand-violet/20 blur-3xl" />
          {/* Канвас намеренно крупнее своего слота и выходит за него: модель
              рендерится в центре большого прозрачного холста, поэтому её края
              физически не доходят до видимой границы — обрезки нет вообще. */}
          <div className="absolute -inset-x-16 -inset-y-14 sm:-inset-x-20 lg:-inset-x-24 lg:-inset-y-16">
            <HeroCanvas />
          </div>
        </motion.div>
      </div>

      {/* Планка статистики */}
      <div className="container-x relative z-10 mt-12 lg:mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="panel grid grid-cols-2 gap-y-6 rounded-2xl px-6 py-6 sm:grid-cols-4 sm:divide-x sm:divide-white/10"
        >
          {site.stats.map((s) => (
            <div key={s.label} className="px-2 text-center sm:px-5">
              <p className="text-3xl font-extrabold tracking-tight text-ink-950 dark:text-white sm:text-4xl">
                <span className="text-gradient">
                  <Counter to={s.to} prefix={'prefix' in s ? s.prefix : ''} suffix={'suffix' in s ? s.suffix : ''} decimals={'decimals' in s ? s.decimals : 0} />
                </span>
              </p>
              <p className="mt-1 text-xs leading-tight text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const Dot = () => <span className="h-1.5 w-1.5 rounded-full bg-brand-violet" />;
