import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection/HeroSection';
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
 * Старая навигация нужна секциям ниже, но на первом экране у него своя шапка
 * из ТЗ (название + кнопка-тессеракт) — две сразу спорили бы друг с другом.
 * Поэтому пилюлю показываем только после того, как первый экран прокручен.
 */
function DeferredNav() {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('top');
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setPastHero(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`transition-opacity duration-300 ${
        pastHero ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!pastHero}
    >
      <Header />
    </div>
  );
}

export default function App() {
  return (
    <div className="relative min-h-screen">
      <DeferredNav />
      <main>
        <HeroSection />
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
