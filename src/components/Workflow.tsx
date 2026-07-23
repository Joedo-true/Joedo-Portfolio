import { motion } from 'framer-motion';
import { workflowSteps } from '../data/workflow';
import { Reveal, RevealGroup, revealChild } from './ui/Reveal';
import { SectionHeading } from './ui/SectionHeading';

export function Workflow() {
  return (
    <section id="process" className="relative py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Экспонат 04 — Процесс"
          title={
            <>
              Работа как в <span className="text-gradient">хорошем сервисе</span>
            </>
          }
          subtitle="Вы всегда знаете, на каком этапе проект и что будет дальше. Никаких «пропал и не отвечает» — только чёткие шаги, демо на каждом этапе и контроль сроков."
        />

        <div className="relative mt-20">
          {/* Горизонтальная линия времени (desktop) */}
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-brand-violet/10 via-brand-violet/40 to-brand-fuchsia/10 lg:block" />
          {/* Вертикальная линия (mobile/tablet) */}
          <div className="absolute bottom-4 left-[27px] top-4 w-px bg-gradient-to-b from-brand-violet/40 to-brand-fuchsia/10 lg:hidden" />

          <RevealGroup className="grid gap-8 lg:grid-cols-4 lg:gap-6" stagger={0.13}>
            {workflowSteps.map((step) => (
              <motion.div
                key={step.num}
                variants={revealChild}
                className="relative flex gap-5 lg:flex-col lg:gap-0"
              >
                {/* Узел с номером */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className="grid h-14 w-14 place-items-center rounded-2xl border border-brand-violet/30
                      bg-cream-50 font-mono text-lg font-bold text-brand-indigo shadow-glow-sm backdrop-blur-md
                      dark:border-white/10 dark:bg-white/[0.04] dark:text-brand-violet"
                  >
                    {step.num}
                  </div>
                </div>

                {/* Карточка шага */}
                <div className="lg:mt-6">
                  <div className="mb-2 flex items-center gap-2 text-2xl lg:text-xl">
                    <span aria-hidden>{step.icon}</span>
                    <h3 className="text-base font-bold text-ink-900 dark:text-white sm:text-lg">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </RevealGroup>
        </div>

        {/* Гарантия-плашка */}
        <Reveal delay={0.1}>
          <div className="panel mt-16 flex flex-col items-center gap-4 rounded-2xl p-6 text-center sm:flex-row sm:justify-center sm:gap-8 sm:text-left">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-ink-900 dark:text-white">Фиксирую сроки и объём работ</span>{' '}
              на старте. Вы получаете результат, а не отговорки.
            </p>
            <a
              href="#contact"
              className="whitespace-nowrap rounded-full bg-gradient-to-r from-brand-violet to-brand-indigo px-6 py-3 text-sm font-semibold text-white shadow-glow-sm transition-transform hover:-translate-y-0.5"
            >
              Обсудить проект
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
