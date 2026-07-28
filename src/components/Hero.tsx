import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HeroCanvas } from './three/HeroCanvas';
import { Counter } from './ui/Counter';
import { Barcode } from './ui/Barcode';
import { site } from '../data/site';

const rise = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

/** Живые часы — техническая деталь в углу экрана */
function Clock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setT(
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(
          d.getSeconds(),
        ).padStart(2, '0')}`,
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{t}</span>;
}

export function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden pt-24">
      {/* Сигнатурная искривлённая сетка */}
      <div className="absolute inset-0">
        <HeroCanvas />
      </div>

      <div className="container-x relative z-10 flex min-h-[calc(100svh-6rem)] flex-col">
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.08, delayChildren: 0.1 }}
          className="flex-1 pt-10 lg:pt-20"
        >
          <motion.div variants={rise} className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-neon-acid" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-acid" />
            </span>
            <span className="meta !text-white/70">Свободен для новых проектов</span>
          </motion.div>

          <motion.h1
            variants={rise}
            className="mt-7 max-w-[15ch] font-mono text-[clamp(2.4rem,8vw,6.2rem)] font-light uppercase leading-[0.94] tracking-[0.01em] text-white"
          >
            React
            <br />
            <span className="text-neon-magenta">интерфейсы</span>
            <br />
            под ключ
          </motion.h1>

          <motion.p
            variants={rise}
            className="mt-8 max-w-md text-sm leading-relaxed text-white/55"
          >
            Калькуляторы лидов, CRM-панели и умные каталоги. Ускоряю загрузку, навожу порядок в
            логике и делаю так, чтобы каждый экран работал на заявку.
          </motion.p>

          <motion.div variants={rise} className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#projects" className="pill">
              Смотреть кейсы <span aria-hidden>↓</span>
            </a>
            <a href="#contact" className="pill pill-solid hover:!bg-neon-magenta hover:!text-black">
              Оценка за 24 часа <span aria-hidden>↗</span>
            </a>
          </motion.div>
        </motion.div>

        {/* Нижняя техническая подпись */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="hidden pb-8 lg:block"
        >
          <div className="meta leading-5">
            <Clock />
            <br />
            frontend
            <br />
            portfolio
          </div>
          <Barcode seed={7} className="mt-3 text-white/75" />
        </motion.div>
      </div>

      {/* Полоса статистики — на волосяных линиях, во всю ширину */}
      <div className="relative z-10 rule-t">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {site.stats.map((s, i) => (
            <div
              key={s.label}
              className={`px-5 py-6 sm:px-8 ${i > 0 ? 'lg:rule-l' : ''} ${i % 2 === 1 ? 'rule-l lg:rule-l' : ''} ${
                i < 2 ? 'rule-b lg:border-b-0' : ''
              }`}
            >
              <p className="font-mono text-2xl font-light text-white sm:text-3xl">
                <Counter
                  to={s.to}
                  prefix={'prefix' in s ? s.prefix : ''}
                  suffix={'suffix' in s ? s.suffix : ''}
                  decimals={'decimals' in s ? s.decimals : 0}
                />
              </p>
              <p className="meta mt-2 !normal-case !tracking-normal">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
