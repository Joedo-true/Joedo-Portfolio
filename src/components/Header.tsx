import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { site } from '../data/site';

function Logo() {
  return (
    <a
      href="#top"
      className="group inline-flex items-center font-mono text-lg font-bold tracking-tight"
      aria-label={`${site.name}.dev — на главную`}
    >
      <span className="text-slate-400 transition-colors group-hover:text-brand-violet dark:text-slate-500">
        [
      </span>
      <span className="text-ink-900 transition-colors group-hover:text-brand-violet dark:text-white dark:group-hover:text-brand-violet">
        {site.name}
      </span>
      <span className="text-slate-400 transition-colors group-hover:text-brand-violet dark:text-slate-500">
        ]
      </span>
      <span className="text-brand-indigo transition-colors group-hover:text-brand-fuchsia dark:text-brand-violet">
        .dev
      </span>
    </a>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      className="relative grid h-10 w-10 place-items-center rounded-full border border-slate-200
        text-slate-600 transition-colors hover:border-brand-violet/50 hover:text-brand-violet
        dark:border-ink-700 dark:text-slate-300 dark:hover:border-brand-violet/60"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.25 }}
        >
          {isDark ? <MoonIcon /> : <SunIcon />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-slate-200/70 shadow-sm dark:border-ink-800/70'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between">
        <Logo />

        {/* Центр: якорные ссылки (desktop) */}
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {site.nav.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors
                  hover:text-brand-indigo dark:text-slate-300 dark:hover:text-brand-violet"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Правая часть */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {/* Кнопка «Быстрая связь»: рамка плавно заполняется цветом */}
          <a
            href="#contact"
            className="group relative hidden overflow-hidden rounded-full border border-brand-violet/60
              px-5 py-2 text-sm font-semibold text-brand-indigo transition-colors duration-300
              hover:text-white dark:text-brand-violet dark:hover:text-white sm:inline-flex"
          >
            <span
              className="absolute inset-0 -z-0 origin-left scale-x-0 bg-gradient-to-r from-brand-violet to-brand-indigo
                transition-transform duration-300 ease-out group-hover:scale-x-100"
            />
            <span className="relative z-10">Быстрая связь</span>
          </a>

          {/* Бургер (mobile) */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Меню"
            aria-expanded={menuOpen}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200
              text-slate-700 dark:border-ink-700 dark:text-slate-200 lg:hidden"
          >
            <div className="space-y-1.5">
              <span
                className={`block h-0.5 w-5 bg-current transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`}
              />
              <span className={`block h-0.5 w-5 bg-current transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
              <span
                className={`block h-0.5 w-5 bg-current transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Мобильное меню */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="glass overflow-hidden border-b border-slate-200/70 dark:border-ink-800/70 lg:hidden"
          >
            <ul className="container-x flex flex-col gap-1 py-4">
              {site.nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-4 py-3 text-base font-medium text-slate-700
                      transition-colors hover:bg-brand-violet/10 hover:text-brand-indigo
                      dark:text-slate-200 dark:hover:text-brand-violet"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contact"
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 block rounded-lg bg-gradient-to-r from-brand-violet to-brand-indigo
                    px-4 py-3 text-center text-base font-semibold text-white"
                >
                  Быстрая связь
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
