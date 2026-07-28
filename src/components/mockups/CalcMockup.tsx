import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface StepDef {
  q: string;
  options: { label: string; add: number }[];
}

const steps: StepDef[] = [
  {
    q: 'Тип проекта',
    options: [
      { label: 'Лендинг', add: 40000 },
      { label: 'Магазин', add: 90000 },
      { label: 'Веб-приложение', add: 150000 },
    ],
  },
  {
    q: 'Дизайн',
    options: [
      { label: 'Готовый макет', add: 0 },
      { label: 'Нужен UI/UX', add: 35000 },
    ],
  },
  {
    q: 'Интеграции',
    options: [
      { label: 'Без интеграций', add: 0 },
      { label: 'CRM / API', add: 25000 },
      { label: 'Оплата + CRM', add: 45000 },
    ],
  },
  {
    q: 'Сроки',
    options: [
      { label: 'Стандартные', add: 0 },
      { label: 'Срочно', add: 30000 },
    ],
  },
];

const LINE = { borderColor: 'var(--line)' } as const;

export function CalcMockup() {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);

  const total = Object.entries(picks).reduce(
    (s, [k, opt]) => s + steps[Number(k)].options[opt].add,
    0,
  );

  const choose = (opt: number) => {
    setPicks((p) => ({ ...p, [step]: opt }));
    setTimeout(() => {
      if (step < steps.length - 1) setStep((s) => s + 1);
      else setDone(true);
    }, 200);
  };

  const reset = () => {
    setStep(0);
    setPicks({});
    setDone(false);
  };

  const progress = done ? 100 : (step / steps.length) * 100;
  const fmt = (n: number) => n.toLocaleString('ru-RU');

  return (
    <div className="flex h-full flex-col p-3 text-left">
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-mega text-white/35">
          <span>{done ? 'готово' : `шаг ${step + 1} / ${steps.length}`}</span>
          <span className="tabular-nums">{Math.round(progress)}%</span>
        </div>
        <div className="h-[2px] bg-white/12">
          <motion.div
            className="h-full bg-neon-magenta"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="relative flex-1">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <p className="mb-2.5 font-mono text-[11px] uppercase tracking-mega text-white">
                {steps[step].q}
              </p>
              <div className="space-y-1.5">
                {steps[step].options.map((o, i) => (
                  <button
                    key={o.label}
                    onClick={() => choose(i)}
                    className="flex w-full items-center justify-between border px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.05em] transition-colors"
                    style={
                      picks[step] === i
                        ? { borderColor: '#FF3DAF', background: '#FF3DAF14', color: '#fff' }
                        : { ...LINE, color: 'rgba(255,255,255,0.6)' }
                    }
                  >
                    {o.label}
                    {o.add > 0 && <span className="text-white/35">+{fmt(o.add)}</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
            >
              <p className="font-mono text-[9px] uppercase tracking-mega text-white/40">
                ориентировочно
              </p>
              <p className="my-2 font-mono text-3xl font-light text-neon-magenta">{fmt(total)} ₽</p>
              <button
                onClick={reset}
                className="border px-3 py-1 font-mono text-[9px] uppercase tracking-mega text-white/70"
                style={LINE}
              >
                посчитать заново
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!done && (
        <div className="mt-3 flex items-center justify-between border px-3 py-2" style={LINE}>
          <span className="font-mono text-[9px] uppercase tracking-mega text-white/40">итого</span>
          <motion.span
            key={total}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="font-mono text-sm tabular-nums text-white"
          >
            {fmt(total)} ₽
          </motion.span>
        </div>
      )}
    </div>
  );
}
