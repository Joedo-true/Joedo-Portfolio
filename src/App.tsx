import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';
import { Workflow } from './components/Workflow';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Marquee } from './components/ui/Marquee';
import { GrainOverlay } from './components/ui/GrainOverlay';
import { CustomCursor } from './components/ui/CustomCursor';
import { site } from './data/site';

function MarqueeBand() {
  const items = site.marquee.map((t) => (
    <span className="text-lg font-semibold tracking-tight text-slate-500 dark:text-slate-400 sm:text-xl">
      {t}
    </span>
  ));
  return (
    <div className="relative border-y border-slate-200/70 py-6 dark:border-white/10">
      <Marquee items={items} />
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
      <GrainOverlay />
      <CustomCursor />
    </div>
  );
}
