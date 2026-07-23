import { useState } from 'react';
import { motion } from 'framer-motion';
import { skillGroups, type Skill } from '../data/skills';
import { Reveal, RevealGroup, revealChild } from './ui/Reveal';
import { SectionHeading } from './ui/SectionHeading';

function SkillTile({ skill }: { skill: Skill }) {
  const [hover, setHover] = useState(false);
  const Icon = skill.icon;

  return (
    <motion.div variants={revealChild}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="group relative flex aspect-[4/3] cursor-default flex-col items-center justify-center gap-2.5
          overflow-hidden rounded-2xl border border-slate-200/80 bg-white/60 p-4 backdrop-blur-md transition-all duration-300
          dark:border-white/10 dark:bg-white/[0.03]"
        style={{
          borderColor: hover ? skill.color : undefined,
          boxShadow: hover ? `0 16px 40px -18px ${skill.color}` : undefined,
          transform: hover ? 'translateY(-4px)' : undefined,
        }}
      >
        {/* Мягкая заливка фирменным цветом при наведении */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle at 50% 30%, ${skill.color}22, transparent 70%)` }}
        />
        <div
          className="relative transition-colors duration-300"
          style={{ color: hover ? skill.color : undefined }}
        >
          <Icon className="h-8 w-8 text-slate-500 transition-colors duration-300 dark:text-slate-300" style={{ color: hover ? skill.color : undefined }} />
        </div>
        <span
          className="relative text-sm font-semibold text-slate-700 transition-colors duration-300 dark:text-slate-200"
          style={{ color: hover ? skill.color : undefined }}
        >
          {skill.name}
        </span>
      </div>
    </motion.div>
  );
}

export function Skills() {
  return (
    <section id="stack" className="relative overflow-hidden py-24 sm:py-32">
      {/* Тонкий фон */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-brand-violet/[0.03] to-transparent" />

      <div className="container-x relative">
        <SectionHeading
          eyebrow="Экспонат 03 — Стек"
          title={
            <>
              Инструменты, проверенные <span className="text-gradient">в бою</span>
            </>
          }
          subtitle="Только современный и надёжный стек, сгруппированный по назначению — так видно системность подхода. Наведите на плитку."
        />

        <div className="mt-16 space-y-12">
          {skillGroups.map((group) => (
            <div key={group.title}>
              <Reveal>
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex items-baseline gap-2.5">
                    <h3 className="text-lg font-bold text-ink-900 dark:text-white">{group.title}</h3>
                    <span className="font-mono text-xs uppercase tracking-widest text-brand-violet/80">
                      {group.caption}
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-ink-700" />
                </div>
              </Reveal>

              <RevealGroup className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {group.items.map((skill) => (
                  <SkillTile key={skill.name} skill={skill} />
                ))}
              </RevealGroup>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
