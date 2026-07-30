import { useSiteStore } from '../../store/useSiteStore';
import { PixelReveal } from '../PixelReveal/PixelReveal';
import { MenuIcon } from './MenuIcon';
import { site } from '../../data/site';

/**
 * Шапка сайта (ТЗ 7, шаг 2). Закреплена сверху, а не уезжает вместе с первым
 * экраном: в разделе 2 она обязана быть на виду — там её иконка меняет форму
 * синхронно с переворотом темы (ТЗ 8.5).
 *
 * Цвет берётся из `--text`, поэтому на тёмном первом экране шапка светлая, а
 * после переворота темы становится тёмной — тем же кросс-фейдом.
 */
export function SiteHeader({ hidden = false }: { hidden?: boolean }) {
  const isLoaded = useSiteStore((state) => state.isLoaded);

  return (
    <header
      aria-hidden={hidden}
      className={`fixed inset-x-0 top-0 z-50 flex items-start justify-between px-5 py-5 transition-opacity duration-300 sm:px-8 ${
        hidden ? 'pointer-events-none opacity-0' : 'pointer-events-none'
      }`}
      style={{ color: 'var(--text)' }}
    >
      <PixelReveal
        text={site.name}
        as="span"
        play={isLoaded}
        delay={0.15}
        duration={0.8}
        maxPixelSize={10}
        className="hero-nav-label"
      />

      <button
        type="button"
        aria-label="Меню"
        className="hero-menu-button pointer-events-auto"
        style={{ opacity: isLoaded ? 1 : 0 }}
      >
        <MenuIcon />
      </button>
    </header>
  );
}
