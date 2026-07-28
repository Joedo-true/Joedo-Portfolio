import { motion } from 'framer-motion';
import { workflowSteps } from '../data/workflow';
import { SectionHeading } from './ui/SectionHeading';
import { WaveGrid } from './ui/WaveGrid';

export function Workflow() {
  return (
    <section id="process" className="relative rule-t py-20 sm:py-28">
      <div className="pointer-events-none absolute right-0 top-0 hidden h-[20rem] w-2/5 text-white lg:block">
        <WaveGrid className="h-full w-full" cols={18} rows={12} amp={10} opacity={0.26} animated={false} />
      </div>
      <div className="container-x relative">
        <SectionHeading
          title="Process"
          label="How it works"
          seed={31}
          intro="Вы всегда знаете, на каком этапе проект и что будет дальше. Чёткие шаги, демо на каждом этапе и контроль сроков."
        />
      </div>

      {/* Таймлайн как таблица на волосяных линиях */}
      <div className="mt-14 rule-t">
        {workflowSteps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            className="group rule-b transition-colors duration-300 hover:bg-white/[0.025]"
          >
            <div className="container-x grid gap-4 py-8 md:grid-cols-[7rem_1fr_1.2fr] md:items-baseline md:gap-10">
              <span className="font-mono text-3xl font-light text-white/25 transition-colors duration-300 group-hover:text-white">
                {step.num}
              </span>
              <h3 className="font-mono text-base uppercase tracking-[0.06em] text-white">
                {step.title}
              </h3>
              <p className="max-w-xl text-sm leading-relaxed text-white/55">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="container-x flex flex-col items-start justify-between gap-5 py-8 sm:flex-row sm:items-center">
        <p className="text-sm text-white/55">
          Фиксирую сроки и объём работ на старте. Вы получаете результат, а не отговорки.
        </p>
        <a href="#contact" className="pill shrink-0">
          Обсудить проект <span aria-hidden>↗</span>
        </a>
      </div>
    </section>
  );
}
