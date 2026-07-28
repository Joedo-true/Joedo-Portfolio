import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  cat: 'Обувь' | 'Одежда' | 'Аксессуары';
  price: number;
}

const products: Product[] = [
  { id: 1, name: 'Runner Pro', cat: 'Обувь', price: 6900 },
  { id: 2, name: 'Куртка Aero', cat: 'Одежда', price: 12400 },
  { id: 3, name: 'Рюкзак City', cat: 'Аксессуары', price: 4200 },
  { id: 4, name: 'Кепка Sport', cat: 'Аксессуары', price: 1800 },
  { id: 5, name: 'Худи Warm', cat: 'Одежда', price: 5400 },
  { id: 6, name: 'Кеды Lite', cat: 'Обувь', price: 3900 },
];

const cats = ['Все', 'Обувь', 'Одежда', 'Аксессуары'] as const;
const LINE = { borderColor: 'var(--line)' } as const;

export function ShopMockup() {
  const [cat, setCat] = useState<(typeof cats)[number]>('Все');
  const [maxPrice, setMaxPrice] = useState(13000);
  const [cart, setCart] = useState<number[]>([]);

  const filtered = useMemo(
    () => products.filter((p) => (cat === 'Все' || p.cat === cat) && p.price <= maxPrice),
    [cat, maxPrice],
  );
  const total = useMemo(
    () => cart.reduce((s, id) => s + (products.find((p) => p.id === id)?.price ?? 0), 0),
    [cart],
  );
  const fmt = (n: number) => n.toLocaleString('ru-RU');

  return (
    <div className="flex h-full flex-col gap-2.5 p-3 text-left">
      <div className="border p-2.5" style={LINE}>
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`border px-2 py-0.5 font-mono text-[9px] uppercase tracking-mega transition-colors ${
                cat === c ? 'border-neon-blue bg-neon-blue text-black' : 'text-white/55'
              }`}
              style={cat === c ? undefined : LINE}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-mega text-white/35">до</span>
          <input
            type="range"
            min={1800}
            max={13000}
            step={100}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            aria-label="Максимальная цена"
            className="h-[2px] flex-1 cursor-pointer appearance-none bg-white/20 accent-neon-blue"
          />
          <span className="w-16 text-right font-mono text-[10px] tabular-nums text-white">
            {fmt(maxPrice)} ₽
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((p) => {
            const inCart = cart.includes(p.id);
            return (
              <motion.button
                key={p.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setCart((c) => (inCart ? c.filter((x) => x !== p.id) : [...c, p.id]))}
                className="border p-2 text-left transition-colors"
                style={inCart ? { borderColor: '#3B5BFF', background: '#3B5BFF14' } : LINE}
              >
                <span className="block font-mono text-[9px] uppercase tracking-[0.06em] text-white/80">
                  {p.name}
                </span>
                <span className="mt-1 block font-mono text-[10px] text-neon-blue">
                  {fmt(p.price)} ₽
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-auto flex items-center justify-between border p-2.5" style={LINE}>
        <span className="font-mono text-[10px] uppercase tracking-mega text-white/55">
          Корзина [{cart.length}]
        </span>
        <motion.span
          key={total}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          className="font-mono text-sm tabular-nums text-white"
        >
          {fmt(total)} ₽
        </motion.span>
      </div>
    </div>
  );
}
