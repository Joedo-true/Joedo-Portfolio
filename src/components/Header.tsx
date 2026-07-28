import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { site } from '../data/site';

/** Знак-логотип: три штриха в квадрате */
function LogoMark() {
  return (
    <a
      href="#top"
      aria-label={`${site.name} — на главную`}
      className="group grid h-9 w-9 shrink-0 place-items-center border border-white/25 transition-colors hover:border-neon-magenta"
    >
      <span className="flex w-4 flex-col gap-[3px]">
        <i className="h-[2px] w-full bg-white transition-colors group-hover:bg-neon-magenta" />
        <i className="h-[2px] w-3/4 bg-white transition-colors group-hover:bg-neon-magenta" />
        <i className="h-[2px] w-full bg-white transition-colors group-hover:bg-neon-magenta" />
      </span>
    </a>
  );
}

export function Header() {
  const [active, setActive] = useState<string>('top');
  const [open, setOpen] = useState(false);

  // Подсветка активного пункта по видимой секции
  useEffect(() => {
    const ids = ['top', ...site.nav.map((n) => n.id)];
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0.01, 0.25, 0.6] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="flex items-start justify-between px-4 py-4 sm:px-6">
        <div className="pointer-events-auto">
          <LogoMark />
        </div>

        {/* Центральная плавающая навигация-пилюля */}
        <nav className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 lg:block">
          <ul
            className="flex items-center gap-1 rounded-full border bg-base-900/85 p-1 backdrop-blur-md"
            style={{ borderColor: 'var(--line)' }}
          >
            {site.nav.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`block rounded-full px-4 py-1.5 font-mono text-[12px] uppercase tracking-mega transition-colors ${
                      isActive ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="pointer-events-auto flex items-center gap-2">
          <a
            href={site.telegram.url}
            target="_blank"
            rel="noreferrer"
            className="pill hidden h-9 sm:inline-flex"
          >
            Telegram <span aria-hidden>↗</span>
          </a>
          <a href="#contact" className="pill hidden h-9 md:inline-flex">
            Связаться <span aria-hidden>↗</span>
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Меню"
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center border border-white/25 lg:hidden"
          >
            <span className="flex w-4 flex-col gap-[3px]">
              <i className={`h-[2px] w-full bg-white transition-transform ${open ? 'translate-y-[5px] rotate-45' : ''}`} />
              <i className={`h-[2px] w-full bg-white transition-opacity ${open ? 'opacity-0' : ''}`} />
              <i className={`h-[2px] w-full bg-white transition-transform ${open ? '-translate-y-[5px] -rotate-45' : ''}`} />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto mx-4 border bg-base-900/95 backdrop-blur-md lg:hidden"
            style={{ borderColor: 'var(--line)' }}
          >
            <ul>
              {site.nav.map((item, i) => (
                <li key={item.id} className={i > 0 ? 'rule-t' : ''}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-5 py-3.5 font-mono text-[13px] uppercase tracking-mega text-white/80"
                  >
                    {item.label}
                    <span aria-hidden className="text-white/30">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
