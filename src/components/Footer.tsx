import { site } from '../data/site';
import { Barcode } from './ui/Barcode';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="rule-t">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1fr_auto]">
        <div>
          <a href="#top" className="font-mono text-sm uppercase tracking-mega text-white">
            {site.name}
            <span className="text-white/45">.dev</span>
          </a>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/45">
            Фронтенд-разработка интерфейсов на React, которые работают на результат.
          </p>
          <Barcode seed={71} className="mt-6 text-white/60" />
        </div>

        <nav className="flex flex-col gap-3 md:items-end">
          {[
            { label: 'Telegram', href: site.telegram.url },
            { label: 'Email', href: `mailto:${site.email}` },
            { label: 'GitHub', href: site.github.url },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="group inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-mega text-white/60 transition-colors hover:text-white"
            >
              {l.label}
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                ↗
              </span>
            </a>
          ))}
        </nav>
      </div>

      <div className="rule-t">
        <div className="container-x flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="meta">© {year} {site.name}.dev</span>
          <span className="meta">React · TypeScript · Tailwind · Three.js</span>
        </div>
      </div>
    </footer>
  );
}
