import { motion } from 'framer-motion';
import { services } from '../data/services';
import { SectionHeading } from './ui/SectionHeading';
import { WarpGridSVG } from './ui/WarpGridSVG';

export function Services() {
  return (
    <section id="services" className="relative rule-t py-20 sm:py-28">
      {/* Сетка-фон в правой половине шапки секции */}
      <div className="pointer-events-none absolute right-0 top-0 hidden h-[22rem] w-1/2 text-white lg:block">
        <WarpGridSVG className="h-full w-full" cols={20} rows={16} amp={22} opacity={0.3} duration={34} />
      </div>
      <div className="container-x relative">
        <SectionHeading
          title="Services"
          label="What I build"
          seed={3}
          intro="Не «сайт ради сайта», а инструмент под конкретную бизнес-задачу. Выберите формат — остальное беру на себя: от структуры до деплоя."
        />
      </div>

      {/* Сетка на волосяных линиях, во всю ширину экрана */}
      <div className="mt-14 rule-t">
        <div className="grid sm:grid-cols-2">
          {services.map((s, i) => (
            <motion.article
              key={s.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
              className={`group relative px-5 py-10 transition-colors duration-300 hover:bg-white/[0.025] sm:px-8 lg:px-12
                ${i % 2 === 1 ? 'sm:rule-l' : ''} ${i < services.length - (services.length % 2 === 0 ? 2 : 1) ? 'rule-b' : ''}`}
            >
              <div className="flex items-start justify-between gap-6">
                <span className="font-mono text-[11px] tracking-mega text-white/35">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="chip shrink-0">{s.outcome}</span>
              </div>

              <h3 className="mt-7 font-mono text-xl font-normal uppercase tracking-[0.04em] text-white sm:text-2xl">
                {s.title}
              </h3>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">{s.description}</p>

              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                {s.deliverables.map((d) => (
                  <li key={d} className="meta !normal-case !tracking-normal flex items-center gap-2">
                    <i className="h-px w-3 shrink-0 bg-white/30" />
                    {d}
                  </li>
                ))}
              </ul>

              {/* Линия, подтверждающая наведение на ячейку */}
              <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-white/50 transition-transform duration-500 group-hover:scale-x-100" />
            </motion.article>
          ))}
        </div>
      </div>

      <div className="rule-t">
        <div className="container-x flex flex-col items-start justify-between gap-5 py-8 sm:flex-row sm:items-center">
          <p className="text-sm text-white/55">
            Не нашли свой формат? Опишите задачу — предложу решение и оценку.
          </p>
          <a href="#contact" className="pill shrink-0">
            Обсудить проект <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
