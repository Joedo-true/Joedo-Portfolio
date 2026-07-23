import type { ComponentType, SVGProps } from 'react';
import {
  ApiIcon,
  CodeIcon,
  FigmaIcon,
  FramerIcon,
  GitIcon,
  JsIcon,
  NetlifyIcon,
  ReactIcon,
  RechartsIcon,
  TailwindIcon,
  TsIcon,
  VercelIcon,
  ViteIcon,
} from '../components/ui/TechIcons';

export interface Skill {
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Фирменный цвет бренда — плитка окрашивается в него при наведении */
  color: string;
}

export interface SkillGroup {
  title: string;
  caption: string;
  items: Skill[];
}

export const skillGroups: SkillGroup[] = [
  {
    title: 'Основной стек',
    caption: 'Core',
    items: [
      { name: 'React', icon: ReactIcon, color: '#61DAFB' },
      { name: 'TypeScript', icon: TsIcon, color: '#3178C6' },
      { name: 'JavaScript', icon: JsIcon, color: '#F7DF1E' },
      { name: 'REST API', icon: ApiIcon, color: '#10B981' },
    ],
  },
  {
    title: 'Стили и интерфейс',
    caption: 'UI / UX',
    items: [
      { name: 'Tailwind CSS', icon: TailwindIcon, color: '#2DD4BF' },
      { name: 'Framer Motion', icon: FramerIcon, color: '#FF3D82' },
      { name: 'HTML5 & CSS3', icon: CodeIcon, color: '#E34F26' },
      { name: 'Recharts', icon: RechartsIcon, color: '#8B7DF0' },
      { name: 'Figma', icon: FigmaIcon, color: '#F24E1E' },
    ],
  },
  {
    title: 'Сборка и деплой',
    caption: 'Build & Deploy',
    items: [
      { name: 'Vite', icon: ViteIcon, color: '#7C86FF' },
      { name: 'Git & GitHub', icon: GitIcon, color: '#F05032' },
      { name: 'Vercel', icon: VercelIcon, color: '#A78BFA' },
      { name: 'Netlify', icon: NetlifyIcon, color: '#00C7B7' },
    ],
  },
];
