import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Counter } from './ui/Counter';
import { Barcode } from './ui/Barcode';
import { WarpGridSVG } from './ui/WarpGridSVG';
import { site } from '../data/site';

const rise = {
  hidden: { opacity: 0, y: 12 },
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
    <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* Сетка занимает баннер целиком — от самого верха страницы */}
      <div className="pointer-events-none absolute inset-0 text-white">
        <WarpGridSVG className="h-full w-full" cols={26} rows={22} amp={30} opacity={0.42} />
      </div>

      {/* Затемнение под текстом: сетка не должна съедать контраст подзаголовка */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 46% 38% at 50% 45%, rgba(11,11,13,0.92) 0%, rgba(11,11,13,0.7) 45%, transparent 78%)',
        }}
      />

      {/* Текст по центру баннера */}
      <div className="container-x relative z-10 flex flex-1 items-center justify-center py-32">
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.08, delayChildren: 0.15 }}
          className="text-center"
        >
          <motion.h1
            variants={rise}
            className="font-mono text-[clamp(2.2rem,7.5vw,5.8rem)] font-light uppercase leading-[0.98] tracking-[0.02em] text-white"
          >
            React
            <br />
            интерфейсы
            <br />
            под ключ
          </motion.h1>

          <motion.p
            variants={rise}
            className="mx-auto mt-8 max-w-lg text-sm leading-relaxed text-white/50"
          >
            Калькуляторы лидов, CRM-панели и умные каталоги. Ускоряю загрузку, навожу порядок в
            логике и делаю так, чтобы каждый экран работал на заявку.
          </motion.p>

          <motion.div variants={rise} className="mt-10 flex flex-wrap justify-center gap-3">
            <a href="#projects" className="pill">
              Смотреть кейсы <span aria-hidden>↓</span>
            </a>
            <a href="#contact" className="pill pill-solid">
              Оценка за 24 часа <span aria-hidden>↗</span>
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Нижняя техническая подпись */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="container-x relative z-10 hidden pb-8 lg:block"
      >
        <div className="meta leading-5">
          <Clock />
          <br />
          frontend
          <br />
          portfolio
        </div>
        <Barcode seed={7} className="mt-3 text-white/70" />
      </motion.div>

      {/* Полоса статистики */}
      <div className="relative z-10 rule-t">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {site.stats.map((s, i) => (
            <div
              key={s.label}
              className={`px-5 py-6 sm:px-8 ${i % 2 === 1 ? 'rule-l' : ''} ${
                i > 0 ? 'lg:rule-l' : ''
              } ${i < 2 ? 'rule-b lg:border-b-0' : ''}`}
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
