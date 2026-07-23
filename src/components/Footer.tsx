import { site } from '../data/site';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200/70 py-10 dark:border-ink-800/70">
      <div className="container-x flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div>
          <a href="#top" className="font-mono text-base font-bold tracking-tight">
            <span className="text-slate-400 dark:text-slate-500">[</span>
            <span className="text-ink-900 dark:text-white">{site.name}</span>
            <span className="text-slate-400 dark:text-slate-500">]</span>
            <span className="text-brand-indigo dark:text-brand-violet">.dev</span>
          </a>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Фронтенд-разработка интерфейсов на React, которые работают на результат.
          </p>
        </div>

        <div className="flex items-center gap-5 text-sm">
          <a
            href={site.telegram.url}
            target="_blank"
            rel="noreferrer"
            className="text-slate-500 transition-colors hover:text-brand-indigo dark:text-slate-400 dark:hover:text-brand-violet"
          >
            Telegram
          </a>
          <a
            href={`mailto:${site.email}`}
            className="text-slate-500 transition-colors hover:text-brand-indigo dark:text-slate-400 dark:hover:text-brand-violet"
          >
            Email
          </a>
          <a
            href={site.github.url}
            target="_blank"
            rel="noreferrer"
            className="text-slate-500 transition-colors hover:text-brand-indigo dark:text-slate-400 dark:hover:text-brand-violet"
          >
            GitHub
          </a>
        </div>
      </div>

      <div className="container-x mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400 dark:border-ink-800/60">
        © {year} {site.name}.dev · Собрано на React, TypeScript, Tailwind CSS и Framer Motion
      </div>
    </footer>
  );
}
