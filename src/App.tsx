import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { SiteHeader } from './components/Header/SiteHeader';
import { HeroSection } from './components/HeroSection/HeroSection';
import { Section2 } from './components/Section2/Section2';
import { useSiteStore } from './store/useSiteStore';
import { Services } from './components/Services';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';
import { Workflow } from './components/Workflow';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ScanlineOverlay } from './components/ui/ScanlineOverlay';
import { site } from './data/site';

/** Бегущая строка — единственный постоянно движущийся элемент между секциями */
function MarqueeBand() {
  const items = [...site.marquee, ...site.marquee];
  return (
    <div className="rule-t overflow-hidden py-4">
      <div className="flex w-max animate-marquee items-center">
        {items.map((t, i) => (
          <span key={i} className="flex items-center whitespace-nowrap">
            <span className="px-6 font-mono text-[12px] uppercase tracking-mega text-white/45">
              {t}
            </span>
            <span aria-hidden className="text-white/25">
              ◆
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Старая навигация нужна секциям ниже, но на новых экранах спорит с шапкой из
 * ТЗ — они обе висят в тех же углах. Поэтому пилюлю показываем только после
 * раздела 2, то есть уже в старой части страницы.
 */
function usePastNewScreens() {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById('section2');
    if (!anchor) return;
    const observer = new IntersectionObserver(([entry]) => setPast(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  return past;
}

function DeferredNav({ visible }: { visible: boolean }) {
  return (
    <div
      className={`transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <Header />
    </div>
  );
}

/** Тема живёт на корне документа: её читают все новые компоненты (ТЗ 4.2) */
function useThemeAttribute() {
  const theme = useSiteStore((state) => state.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
}

export default function App() {
  useThemeAttribute();
  // Одна развилка на две шапки: пока идут новые экраны — работает шапка из ТЗ,
  // в старой части страницы её сменяет прежняя навигация
  const pastNewScreens = usePastNewScreens();

  return (
    <div className="relative min-h-screen">
      <SiteHeader hidden={pastNewScreens} />
      <DeferredNav visible={pastNewScreens} />
      <main>
        {/* Первый экран прилипший — раздел 2 наезжает и закрывает его (ТЗ 8.1) */}
        <div className="relative h-[100svh]">
          <div className="sticky top-0">
            <HeroSection />
          </div>
        </div>
        <Section2 />
        <MarqueeBand />
        <Services />
        <Projects />
        <Skills />
        <Workflow />
        <Contact />
      </main>
      <Footer />
      <ScanlineOverlay />
    </div>
  );
}
