import { lazy, Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { projects, type Project } from '../data/projects';
import { SectionHeading } from './ui/SectionHeading';
import { WindowFrame } from './ui/WindowFrame';

const StructureModal = lazy(() => import('./structure/StructureModal'));

const DashboardMockup = lazy(() =>
  import('./mockups/DashboardMockup').then((m) => ({ default: m.DashboardMockup })),
);
const ShopMockup = lazy(() =>
  import('./mockups/ShopMockup').then((m) => ({ default: m.ShopMockup })),
);
const CalcMockup = lazy(() =>
  import('./mockups/CalcMockup').then((m) => ({ default: m.CalcMockup })),
);

function MockupSkeleton() {
  return <div className="hatch h-full w-full opacity-40" />;
}

function Mockup({ type }: { type: Project['mockup'] }) {
  return (
    <Suspense fallback={<MockupSkeleton />}>
      {type === 'dashboard' && <DashboardMockup />}
      {type === 'shop' && <ShopMockup />}
      {type === 'calc' && <CalcMockup />}
    </Suspense>
  );
}

function ProjectBlock({
  project,
  reverse,
  onOpenStructure,
}: {
  project: Project;
  reverse: boolean;
  onOpenStructure: () => void;
}) {
  const fileName = `${project.id}.app`;

  return (
    <article className="rule-t">
      <div className="grid lg:grid-cols-2">
        {/* Описание кейса */}
        <div className={`px-5 py-12 sm:px-8 lg:px-12 ${reverse ? 'lg:order-2 lg:rule-l' : ''}`}>
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-[11px] tracking-mega text-white/35">
              {project.index}
            </span>
            <span className="meta">{project.category}</span>
          </div>

          <h3 className="mt-6 font-mono text-2xl font-light uppercase leading-tight tracking-[0.03em] text-white sm:text-3xl">
            {project.name}
          </h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/55">{project.title}</p>

          {/* Проблема / решение — на волосяных линиях, без карточек */}
          <dl className="mt-9">
            <div className="rule-t py-4">
              <dt className="paren-label !text-neon-magenta">(Проблема)</dt>
              <dd className="mt-2 max-w-md text-sm leading-relaxed text-white/55">
                {project.problem}
              </dd>
            </div>
            <div className="rule-t rule-b py-4">
              <dt className="paren-label !text-neon-acid">(Решение)</dt>
              <dd className="mt-2 max-w-md text-sm leading-relaxed text-white/55">
                {project.solution}
              </dd>
            </div>
          </dl>

          {/* Метрики */}
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
            {project.metrics.map((m) => (
              <div key={m.label}>
                <p className="font-mono text-xl font-light" style={{ color: project.accent }}>
                  {m.value}
                </p>
                <p className="meta mt-1 !normal-case !tracking-normal">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Стек */}
          <div className="mt-8 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <span key={tech} className="chip">
                {tech}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <a href={project.demoUrl} target="_blank" rel="noreferrer" className="pill">
              Живое демо <span aria-hidden>↗</span>
            </a>
            <button type="button" onClick={onOpenStructure} className="pill">
              Структура <span aria-hidden>⌗</span>
            </button>
          </div>
        </div>

        {/* Живой интерфейс в рамке-окне */}
        <div
          className={`flex items-center justify-center p-5 sm:p-8 lg:p-12 ${
            reverse ? 'lg:order-1' : 'lg:rule-l'
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <WindowFrame title={fileName}>
              <div className="h-[24rem]">
                <Mockup type={project.mockup} />
              </div>
            </WindowFrame>
          </motion.div>
        </div>
      </div>
    </article>
  );
}

export function Projects() {
  const [active, setActive] = useState<Project | null>(null);

  return (
    <section id="projects" className="relative rule-t py-20 sm:py-28">
      <div className="container-x">
        <SectionHeading
          title="Кейсы"
          label="Pickup works"
          seed={11}
          intro="Три проекта разобраны как бизнес-кейсы: боль клиента → что построено → результат. Каждый макет ниже живой — попробуйте покликать."
        />
      </div>

      <div className="mt-14">
        {projects.map((project, i) => (
          <ProjectBlock
            key={project.id}
            project={project}
            reverse={i % 2 === 1}
            onOpenStructure={() => setActive(project)}
          />
        ))}
      </div>

      {active && (
        <Suspense fallback={null}>
          <StructureModal projectId={active.id} onClose={() => setActive(null)} />
        </Suspense>
      )}
    </section>
  );
}
