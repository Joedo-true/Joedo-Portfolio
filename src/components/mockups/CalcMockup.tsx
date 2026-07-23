import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface StepDef {
  q: string;
  options: { label: string; add: number; emoji: string }[];
}

const steps: StepDef[] = [
  {
    q: 'Тип проекта',
    options: [
      { label: 'Лендинг', add: 40000, emoji: '📄' },
      { label: 'Магазин', add: 90000, emoji: '🛍️' },
      { label: 'Веб-приложение', add: 150000, emoji: '⚙️' },
    ],
  },
  {
    q: 'Дизайн',
    options: [
      { label: 'Готовый макет', add: 0, emoji: '✅' },
      { label: 'Нужен UI/UX', add: 35000, emoji: '🎨' },
    ],
  },
  {
    q: 'Интеграции',
    options: [
      { label: 'Без интеграций', add: 0, emoji: '➖' },
      { label: 'CRM / API', add: 25000, emoji: '🔗' },
      { label: 'Оплата + CRM', add: 45000, emoji: '💳' },
    ],
  },
  {
    q: 'Сроки',
    options: [
      { label: 'Стандартные', add: 0, emoji: '📆' },
      { label: 'Срочно (×1.3)', add: 30000, emoji: '⚡' },
    ],
  },
];

export function CalcMockup() {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);

  const total = Object.entries(picks).reduce(
    (sum, [s, opt]) => sum + steps[Number(s)].options[opt].add,
    0,
  );

  const choose = (opt: number) => {
    setPicks((p) => ({ ...p, [step]: opt }));
    setTimeout(() => {
      if (step < steps.length - 1) setStep((s) => s + 1);
      else setDone(true);
    }, 220);
  };

  const reset = () => {
    setStep(0);
    setPicks({});
    setDone(false);
  };

  const progress = done ? 100 : (step / steps.length) * 100;
  const fmt = (n: number) => '₽ ' + n.toLocaleString('ru-RU');

  return (
    <div className="flex h-full flex-col p-4 text-left sm:p-5">
      {/* Прогресс-бар */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium text-slate-400">
          <span>{done ? 'Готово' : `Шаг ${step + 1} из ${steps.length}`}</span>
          <span className="tabular-nums">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-ink-700">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand-fuchsia to-brand-violet"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Тело квиза */}
      <div className="relative flex-1">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <p className="mb-2.5 text-sm font-bold text-ink-900 dark:text-white">{steps[step].q}</p>
              <div className="space-y-1.5">
                {steps[step].options.map((o, i) => (
                  <button
                    key={o.label}
                    onClick={() => choose(i)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors ${
                      picks[step] === i
                        ? 'border-brand-fuchsia bg-brand-fuchsia/10 text-ink-900 dark:text-white'
                        : 'border-slate-200/80 bg-white/70 text-slate-600 hover:border-brand-fuchsia/50 dark:border-ink-700/70 dark:bg-ink-800/60 dark:text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{o.emoji}</span>
                      {o.label}
                    </span>
                    {o.add > 0 && <span className="text-[10px] text-slate-400">+{fmt(o.add)}</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
            >
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Ориентировочная стоимость
              </p>
              <motion.p
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="my-1 text-3xl font-extrabold text-gradient"
              >
                {fmt(total)}
              </motion.p>
              <button
                onClick={reset}
                className="mt-2 rounded-full bg-gradient-to-r from-brand-fuchsia to-brand-violet px-4 py-1.5 text-xs font-semibold text-white"
              >
                Посчитать заново
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Живой счётчик стоимости */}
      {!done && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 dark:border-ink-700/70 dark:bg-ink-800/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Итого сейчас</span>
          <motion.span
            key={total}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            className="text-sm font-bold tabular-nums text-ink-900 dark:text-white"
          >
            {fmt(total)}
          </motion.span>
        </div>
      )}
    </div>
  );
}
