import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { projects, type Project } from '../data/projects';
import { Reveal } from './ui/Reveal';
import { SectionHeading } from './ui/SectionHeading';

// Макеты грузятся лениво (в т.ч. тяжёлый Recharts) — hero рисуется мгновенно.
const DashboardMockup = lazy(() =>
  import('./mockups/DashboardMockup').then((m) => ({ default: m.DashboardMockup })),
);
const ShopMockup = lazy(() =>
  import('./mockups/ShopMockup').then((m) => ({ default: m.ShopMockup })),
);
const CalcMockup = lazy(() =>
  import('./mockups/CalcMockup').then((m) => ({ default: m.CalcMockup })),
);

/** Скелетон на время загрузки макета — бесшовная загрузка */
function MockupSkeleton() {
  return (
    <div className="flex h-full flex-col gap-3 p-5">
      <div className="grid grid-cols-3 gap-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-200/70 dark:bg-ink-800" />
        ))}
      </div>
      <div className="h-28 animate-pulse rounded-xl bg-slate-200/70 dark:bg-ink-800" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 animate-pulse rounded-xl bg-slate-200/70 dark:bg-ink-800" />
        <div className="h-24 animate-pulse rounded-xl bg-slate-200/70 dark:bg-ink-800" />
      </div>
    </div>
  );
}

function Mockup({ type }: { type: Project['mockup'] }) {
  return (
    <Suspense fallback={<MockupSkeleton />}>
      {type === 'dashboard' && <DashboardMockup />}
      {type === 'shop' && <ShopMockup />}
      {type === 'calc' && <CalcMockup />}
    </Suspense>
  );
}

/** Оконная рамка «браузера» вокруг интерактивного макета */
function BrowserFrame({ project }: { project: Project }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative"
    >
      {/* Цветное свечение проекта */}
      <div
        className="absolute -inset-4 rounded-[2rem] opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-70"
        style={{ background: `radial-gradient(circle at 50% 40%, ${project.accent}55, transparent 70%)` }}
      />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-cream-100 shadow-card dark:border-ink-700/80 dark:bg-ink-950">
        {/* Верхняя панель окна */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 bg-white/60 px-4 py-2.5 dark:border-ink-700/70 dark:bg-ink-900/60">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <div className="ml-3 flex-1 truncate rounded-md bg-slate-100 px-2.5 py-1 font-mono text-[10px] text-slate-400 dark:bg-ink-800">
            {project.name.toLowerCase().replace(/\s+/g, '')}.app
          </div>
        </div>
        {/* Живой интерактивный интерфейс */}
        <div className="h-[24rem] bg-gradient-to-br from-cream-50 to-cream-100 dark:from-ink-900 dark:to-ink-950">
          <Mockup type={project.mockup} />
        </div>
      </div>
    </motion.div>
  );
}

function ProjectRow({ project, reverse }: { project: Project; reverse: boolean }) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      {/* Макет интерфейса */}
      <div className={reverse ? 'lg:order-2' : ''}>
        <BrowserFrame project={project} />
      </div>

      {/* Описание кейса */}
      <div className={reverse ? 'lg:order-1' : ''}>
        <Reveal>
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-4xl font-bold"
              style={{ color: project.accent }}
            >
              {project.index}.
            </span>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-slate-400">
                {project.name} · {project.category}
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-ink-950 dark:text-white sm:text-[1.7rem]">
            {project.title}
          </h3>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border-l-2 border-red-300 bg-red-50/50 px-4 py-3 dark:border-red-400/40 dark:bg-red-500/5">
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-red-500/90 dark:text-red-300/90">
                Проблема
              </p>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{project.problem}</p>
            </div>
            <div className="rounded-xl border-l-2 border-brand-emerald/60 bg-emerald-50/50 px-4 py-3 dark:border-brand-emerald/40 dark:bg-emerald-500/5">
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-600/90 dark:text-emerald-300/90">
                Что сделано
              </p>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{project.solution}</p>
            </div>
          </div>
        </Reveal>

        {/* Метрики */}
        <Reveal delay={0.15}>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {project.metrics.map((m) => (
              <div key={m.label} className="text-center sm:text-left">
                <p className="text-xl font-extrabold text-ink-950 dark:text-white" style={{ color: project.accent }}>
                  {m.value}
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-slate-500 dark:text-slate-400">{m.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Стек */}
        <Reveal delay={0.2}>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-slate-200 bg-white/60 px-2.5 py-1 font-mono text-xs font-medium text-slate-600 dark:border-ink-700 dark:bg-ink-800/60 dark:text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Кнопки */}
        <Reveal delay={0.25}>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={project.demoUrl}
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-glow-sm transition-transform hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, ${project.accent}, ${project.accent}cc)` }}
            >
              Открыть живое демо
              <span aria-hidden>↗</span>
            </a>
            <a
              href={project.codeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-violet/60 hover:text-brand-indigo dark:border-ink-700 dark:text-slate-200 dark:hover:text-brand-violet"
            >
              Код на GitHub
              <span aria-hidden>🛠</span>
            </a>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

export function Projects() {
  return (
    <section id="projects" className="relative overflow-hidden py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Экспонат 02 — Кейсы"
          title={
            <>
              Не портфолио, а <span className="text-gradient">доказательства</span>
            </>
          }
          subtitle="Три проекта разобраны как бизнес-кейсы: боль клиента → что построено → результат. Каждый макет ниже — живой и интерактивный, попробуйте покликать прямо здесь."
        />

        <div className="mt-20 space-y-24 sm:space-y-32">
          {projects.map((project, i) => (
            <ProjectRow key={project.id} project={project} reverse={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
