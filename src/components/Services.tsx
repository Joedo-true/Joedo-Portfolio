import { motion } from 'framer-motion';
import { services } from '../data/services';
import { SectionHeading } from './ui/SectionHeading';
import { RevealGroup, revealChild } from './ui/Reveal';
import { TiltCard } from './ui/TiltCard';
import { SpotlightGroup } from './ui/SpotlightGroup';

export function Services() {
  return (
    <section id="services" className="relative overflow-hidden py-24 sm:py-32">
      <div className="container-x relative">
        <SectionHeading
          eyebrow="Экспонат 01 — Услуги"
          title={
            <>
              Что я <span className="text-gradient">строю под ключ</span>
            </>
          }
          subtitle="Не «сайт ради сайта», а инструмент под вашу бизнес-задачу. Выберите формат — остальное беру на себя: от структуры до деплоя."
        />

        <SpotlightGroup>
          <RevealGroup className="mt-16 grid gap-5 sm:grid-cols-2" stagger={0.1}>
            {services.map((s) => (
              <motion.div key={s.id} variants={revealChild}>
                <TiltCard glare={false} className="panel h-full overflow-hidden rounded-3xl p-7 sm:p-8">
                  {/* Единый прожектор на всю сетку — виден только в пределах карточки */}
                  <div data-spotlight className="spotlight-layer pointer-events-none absolute inset-0 rounded-[inherit]" />
                  {/* Свечение акцента */}
                  <div
                    className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-40 blur-3xl"
                    style={{ background: `radial-gradient(circle, ${s.accent}, transparent 70%)` }}
                  />

                <div className="relative flex items-start justify-between gap-4">
                  <div
                    className="grid h-14 w-14 place-items-center rounded-2xl text-2xl"
                    style={{ background: `${s.accent}1f`, boxShadow: `inset 0 0 0 1px ${s.accent}44` }}
                  >
                    {s.icon}
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: `${s.accent}1a`, color: s.accent }}
                  >
                    {s.outcome}
                  </span>
                </div>

                <h3 className="relative mt-5 text-xl font-bold text-ink-950 dark:text-white sm:text-2xl">
                  {s.title}
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {s.description}
                </p>

                <div className="relative mt-5 flex flex-wrap gap-2">
                  {s.deliverables.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/60 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                    >
                      <span style={{ color: s.accent }}>✓</span>
                      {d}
                    </span>
                  ))}
                </div>
                </TiltCard>
              </motion.div>
            ))}
          </RevealGroup>
        </SpotlightGroup>

        {/* Нижняя CTA-полоса */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="panel mt-6 flex flex-col items-center justify-between gap-4 rounded-3xl px-7 py-6 text-center sm:flex-row sm:text-left"
        >
          <p className="text-base text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-ink-900 dark:text-white">Не нашли свой формат?</span>{' '}
            Опишите задачу — предложу решение и оценку.
          </p>
          <a
            href="#contact"
            data-cursor
            className="whitespace-nowrap rounded-full bg-gradient-to-r from-brand-violet to-brand-indigo px-6 py-3 text-sm font-semibold text-white shadow-glow-sm transition-transform hover:-translate-y-0.5"
          >
            Обсудить проект →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
