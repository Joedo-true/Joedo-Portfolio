import { useState } from 'react';
import { skillGroups, type Skill } from '../data/skills';
import { SectionHeading } from './ui/SectionHeading';

function SkillCell({ skill, index }: { skill: Skill; index: number }) {
  const [hover, setHover] = useState(false);
  const Icon = skill.icon;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative flex items-center gap-4 px-5 py-5 transition-colors duration-200 sm:px-8"
      style={{ background: hover ? `${skill.color}0f` : undefined }}
    >
      <span className="font-mono text-[11px] tracking-mega text-white/30">
        {String(index + 1).padStart(2, '0')}
      </span>
      <Icon
        className="h-5 w-5 shrink-0 transition-colors duration-200"
        style={{ color: hover ? skill.color : 'rgba(255,255,255,0.55)' }}
      />
      <span
        className="font-mono text-[13px] uppercase tracking-[0.08em] transition-colors duration-200"
        style={{ color: hover ? skill.color : '#fff' }}
      >
        {skill.name}
      </span>
      <span
        className="absolute inset-y-0 left-0 w-px origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100"
        style={{ background: skill.color }}
      />
    </div>
  );
}

export function Skills() {
  return (
    <section id="stack" className="relative rule-t py-20 sm:py-28">
      <div className="container-x">
        <SectionHeading
          title="Стек"
          label="My skills"
          seed={23}
          intro="Только современный и надёжный инструментарий, сгруппированный по назначению — так видно системность подхода."
        />
      </div>

      <div className="mt-14">
        {skillGroups.map((group) => (
          <div key={group.title} className="rule-t">
            {/* Шапка группы */}
            <div className="container-x flex items-baseline justify-between gap-6 py-5">
              <h3 className="font-mono text-[13px] uppercase tracking-mega text-white">
                {group.title}
              </h3>
              <span className="paren-label">({group.caption})</span>
            </div>

            <div className="rule-t grid sm:grid-cols-2 lg:grid-cols-4">
              {group.items.map((skill, i) => (
                <div key={skill.name} className={i % 4 === 0 ? '' : 'lg:rule-l'}>
                  <SkillCell skill={skill} index={i} />
                </div>
              ))}
              {/* Добор пустых ячеек штриховкой, чтобы ряд сетки был замкнут */}
              {Array.from({ length: (4 - (group.items.length % 4)) % 4 }).map((_, i) => (
                <div
                  key={`pad-${i}`}
                  className="hatch hidden opacity-50 lg:block lg:rule-l"
                  aria-hidden
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
