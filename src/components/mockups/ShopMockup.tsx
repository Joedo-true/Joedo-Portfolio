import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  cat: 'Обувь' | 'Одежда' | 'Аксессуары';
  price: number;
  emoji: string;
}

const products: Product[] = [
  { id: 1, name: 'Runner Pro', cat: 'Обувь', price: 6900, emoji: '👟' },
  { id: 2, name: 'Куртка Aero', cat: 'Одежда', price: 12400, emoji: '🧥' },
  { id: 3, name: 'Рюкзак City', cat: 'Аксессуары', price: 4200, emoji: '🎒' },
  { id: 4, name: 'Кепка Sport', cat: 'Аксессуары', price: 1800, emoji: '🧢' },
  { id: 5, name: 'Худи Warm', cat: 'Одежда', price: 5400, emoji: '👕' },
  { id: 6, name: 'Кеды Lite', cat: 'Обувь', price: 3900, emoji: '👞' },
];

const cats = ['Все', 'Обувь', 'Одежда', 'Аксессуары'] as const;

export function ShopMockup() {
  const [cat, setCat] = useState<(typeof cats)[number]>('Все');
  const [maxPrice, setMaxPrice] = useState(13000);
  const [cart, setCart] = useState<number[]>([]);

  const filtered = useMemo(
    () => products.filter((p) => (cat === 'Все' || p.cat === cat) && p.price <= maxPrice),
    [cat, maxPrice],
  );

  const total = useMemo(
    () => cart.reduce((sum, id) => sum + (products.find((p) => p.id === id)?.price ?? 0), 0),
    [cart],
  );

  const fmt = (n: number) => '₽ ' + n.toLocaleString('ru-RU');

  return (
    <div className="flex h-full flex-col gap-3 p-4 text-left sm:p-5">
      {/* Панель фильтров */}
      <div className="rounded-xl border border-slate-200/80 bg-white/70 p-3 dark:border-ink-700/70 dark:bg-ink-800/60">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                cat === c
                  ? 'bg-brand-emerald text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-ink-700 dark:text-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-slate-400">Цена до</span>
          <input
            type="range"
            min={1800}
            max={13000}
            step={100}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-emerald dark:bg-ink-700"
            aria-label="Максимальная цена"
          />
          <span className="w-16 text-right text-[11px] font-bold tabular-nums text-ink-900 dark:text-white">
            {fmt(maxPrice)}
          </span>
        </div>
      </div>

      {/* Сетка товаров */}
      <div className="grid grid-cols-3 gap-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((p) => {
            const inCart = cart.includes(p.id);
            return (
              <motion.button
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                onClick={() => setCart((c) => (inCart ? c.filter((x) => x !== p.id) : [...c, p.id]))}
                className={`flex flex-col items-center rounded-xl border p-2 text-center transition-colors ${
                  inCart
                    ? 'border-brand-emerald bg-brand-emerald/10'
                    : 'border-slate-200/80 bg-white/70 hover:border-brand-emerald/50 dark:border-ink-700/70 dark:bg-ink-800/60'
                }`}
              >
                <span className="text-2xl">{p.emoji}</span>
                <span className="mt-1 line-clamp-1 text-[10px] font-semibold text-ink-900 dark:text-white">
                  {p.name}
                </span>
                <span className="text-[10px] font-bold text-brand-emerald">{fmt(p.price)}</span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Живая корзина */}
      <div className="mt-auto flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/70 p-3 dark:border-ink-700/70 dark:bg-ink-800/60">
        <span className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
          🛒 Корзина
          <span className="rounded-full bg-brand-emerald px-1.5 text-[10px] font-bold text-white">
            {cart.length}
          </span>
        </span>
        <motion.span
          key={total}
          initial={{ scale: 1.15, color: '#10B981' }}
          animate={{ scale: 1 }}
          className="text-sm font-bold tabular-nums text-ink-900 dark:text-white"
        >
          {fmt(total)}
        </motion.span>
      </div>
    </div>
  );
}
