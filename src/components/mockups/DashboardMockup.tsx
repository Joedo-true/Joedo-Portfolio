import { useState } from 'react';
import { Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const revenue = [
  { m: 'Пн', v: 32 },
  { m: 'Вт', v: 48 },
  { m: 'Ср', v: 41 },
  { m: 'Чт', v: 66 },
  { m: 'Пт', v: 58 },
  { m: 'Сб', v: 78 },
  { m: 'Вс', v: 92 },
];

const channels = [
  { m: 'Direct', v: 44 },
  { m: 'Search', v: 72 },
  { m: 'Social', v: 55 },
  { m: 'Email', v: 38 },
];

const orders = [
  { id: '#1042', name: 'ООО «Ветер»', sum: '₽ 84 200', status: 'Оплачен', ok: true },
  { id: '#1041', name: 'Ирина К.', sum: '₽ 12 900', status: 'В работе', ok: false },
  { id: '#1040', name: 'Studio Nord', sum: '₽ 46 500', status: 'Оплачен', ok: true },
];

export function DashboardMockup() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="flex h-full flex-col gap-3 p-4 text-left sm:p-5">
      {/* Верхняя строка со статистикой */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Выручка', value: '₽ 1.24M', trend: '+18%' },
          { label: 'Заявки', value: '316', trend: '+42' },
          { label: 'Конверсия', value: '7.8%', trend: '+1.3%' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200/80 bg-white/70 p-2.5 dark:border-ink-700/70 dark:bg-ink-800/60"
          >
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{s.label}</p>
            <p className="mt-0.5 text-sm font-bold text-ink-900 dark:text-white">{s.value}</p>
            <p className="text-[10px] font-semibold text-brand-emerald">{s.trend}</p>
          </div>
        ))}
      </div>

      {/* График выручки */}
      <div className="rounded-xl border border-slate-200/80 bg-white/70 p-3 dark:border-ink-700/70 dark:bg-ink-800/60">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-semibold text-ink-900 dark:text-slate-200">Продажи за неделю</p>
          <span className="rounded-md bg-brand-violet/10 px-1.5 py-0.5 text-[10px] font-medium text-brand-violet">
            Live
          </span>
        </div>
        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ stroke: '#8B5CF6', strokeWidth: 1 }}
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 10,
                  border: 'none',
                  boxShadow: '0 8px 30px rgba(0,0,0,.15)',
                }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke="#8B5CF6"
                strokeWidth={2}
                fill="url(#rev)"
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Каналы — интерактивные бары (фильтрация по клику) */}
        <div className="rounded-xl border border-slate-200/80 bg-white/70 p-3 dark:border-ink-700/70 dark:bg-ink-800/60">
          <p className="mb-1 text-xs font-semibold text-ink-900 dark:text-slate-200">Каналы</p>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channels} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="m" tick={{ fontSize: 8, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Bar dataKey="v" radius={[4, 4, 0, 0]} onClick={(_, i) => setActive(i === active ? null : i)}>
                  {channels.map((_, i) => (
                    <Cell
                      key={i}
                      cursor="pointer"
                      fill={active === null || active === i ? '#10B981' : '#10B98155'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Мини-таблица заказов */}
        <div className="rounded-xl border border-slate-200/80 bg-white/70 p-3 dark:border-ink-700/70 dark:bg-ink-800/60">
          <p className="mb-1.5 text-xs font-semibold text-ink-900 dark:text-slate-200">Заказы</p>
          <ul className="space-y-1.5">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between text-[10px]">
                <span className="font-mono text-slate-400">{o.id}</span>
                <span
                  className={`rounded px-1.5 py-0.5 font-medium ${
                    o.ok
                      ? 'bg-brand-emerald/15 text-emerald-600 dark:text-emerald-300'
                      : 'bg-amber-400/15 text-amber-600 dark:text-amber-300'
                  }`}
                >
                  {o.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
