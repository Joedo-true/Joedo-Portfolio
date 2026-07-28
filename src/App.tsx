import { Header } from './components/Header';
import { Hero } from './components/Hero';
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
            <span aria-hidden className="text-neon-magenta">
              ◆
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <main>
        <Hero />
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
