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
  { id: '#1042', status: 'Оплачен', ok: true },
  { id: '#1041', status: 'В работе', ok: false },
  { id: '#1040', status: 'Оплачен', ok: true },
];

const CELL = 'border p-2.5';
const LINE = { borderColor: 'var(--line)' } as const;

export function DashboardMockup() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="flex h-full flex-col gap-2.5 p-3 text-left">
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Выручка', value: '1.24M', trend: '+18%' },
          { label: 'Заявки', value: '316', trend: '+42' },
          { label: 'Конверсия', value: '7.8%', trend: '+1.3%' },
        ].map((s) => (
          <div key={s.label} className={CELL} style={LINE}>
            <p className="font-mono text-[9px] uppercase tracking-mega text-white/35">{s.label}</p>
            <p className="mt-1 font-mono text-sm text-white">{s.value}</p>
            <p className="font-mono text-[9px] text-neon-acid">{s.trend}</p>
          </div>
        ))}
      </div>

      <div className={CELL} style={LINE}>
        <div className="mb-1 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-mega text-white/70">
            Продажи / неделя
          </p>
          <span className="font-mono text-[9px] uppercase tracking-mega text-neon-magenta">live</span>
        </div>
        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF3DAF" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#FF3DAF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="m"
                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ stroke: '#FF3DAF', strokeWidth: 1 }}
                contentStyle={{
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono',
                  background: '#0B0B0D',
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: 0,
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke="#FF3DAF"
                strokeWidth={1.5}
                fill="url(#rev)"
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className={CELL} style={LINE}>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-mega text-white/70">Каналы</p>
          <div className="h-[70px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channels} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="m"
                  tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar dataKey="v" onClick={(_, i) => setActive(i === active ? null : i)}>
                  {channels.map((_, i) => (
                    <Cell
                      key={i}
                      cursor="pointer"
                      fill={active === null || active === i ? '#3B5BFF' : '#3B5BFF44'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={CELL} style={LINE}>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-mega text-white/70">Заказы</p>
          <ul className="space-y-1.5">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between font-mono text-[9px]">
                <span className="text-white/40">{o.id}</span>
                <span className={o.ok ? 'text-neon-acid' : 'text-neon-magenta'}>{o.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
