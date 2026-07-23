import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  viewBox: '0 0 24 24',
  width: 24,
  height: 24,
  fill: 'none',
  ...props,
});

/* Иконки нарисованы одним цветом (currentColor), чтобы плитка
   при наведении могла плавно окрашиваться в фирменный цвет технологии. */

export const ReactIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="2.1" fill="currentColor" />
    <g stroke="currentColor" strokeWidth="1.1" fill="none">
      <ellipse cx="12" cy="12" rx="10" ry="4.2" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
    </g>
  </svg>
);

export const TsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.4" />
    <text
      x="12"
      y="16.5"
      textAnchor="middle"
      fontFamily="JetBrains Mono, monospace"
      fontSize="9.5"
      fontWeight="700"
      fill="currentColor"
    >
      TS
    </text>
  </svg>
);

export const JsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.4" />
    <text
      x="12"
      y="16.5"
      textAnchor="middle"
      fontFamily="JetBrains Mono, monospace"
      fontSize="9.5"
      fontWeight="700"
      fill="currentColor"
    >
      JS
    </text>
  </svg>
);

export const TailwindIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path
      d="M7 10.2c.7-2.8 2.4-4.2 5-4.2 3.9 0 4.4 2.9 6.3 3.4 1.3.3 2.5-.2 3.5-1.5-.7 2.8-2.4 4.2-5 4.2-3.9 0-4.4-2.9-6.3-3.4-1.3-.3-2.5.2-3.5 1.5Z"
      fill="currentColor"
      opacity="0.95"
    />
    <path
      d="M1.2 17c.7-2.8 2.4-4.2 5-4.2 3.9 0 4.4 2.9 6.3 3.4 1.3.3 2.5-.2 3.5-1.5-.7 2.8-2.4 4.2-5 4.2-3.9 0-4.4-2.9-6.3-3.4-1.3-.3-2.5.2-3.5 1.5Z"
      fill="currentColor"
      opacity="0.6"
    />
  </svg>
);

export const FramerIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 2h14v7h-7zM5 9h7l7 7H5zM5 16h7v7z" fill="currentColor" />
  </svg>
);

export const RechartsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <rect x="6" y="12" width="2.6" height="6" rx="0.6" fill="currentColor" />
    <rect x="10.7" y="8" width="2.6" height="10" rx="0.6" fill="currentColor" />
    <rect x="15.4" y="5" width="2.6" height="13" rx="0.6" fill="currentColor" opacity="0.7" />
  </svg>
);

export const ViteIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M22 4.5 12 22 2 4.5 12 7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none" />
    <path d="M13.6 6 8.5 7l.8 8.5L15 8.2l-2.6-.5z" fill="currentColor" opacity="0.85" />
  </svg>
);

export const GitIcon = (p: IconProps) => (
  <svg {...base(p)} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="6" cy="6" r="2.4" fill="none" />
    <circle cx="6" cy="18" r="2.4" fill="none" />
    <circle cx="17.5" cy="9" r="2.4" fill="none" />
    <path d="M6 8.4v7.2M6 15.6c0-4 2-6 5-6.4" fill="none" />
  </svg>
);

export const VercelIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 4 22 20H2z" fill="currentColor" />
  </svg>
);

export const NetlifyIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3 21 12l-9 9-9-9z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
    <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const CodeIcon = (p: IconProps) => (
  <svg {...base(p)} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12" fill="none" />
  </svg>
);

export const ApiIcon = (p: IconProps) => (
  <svg {...base(p)} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 8 3 12l4 4M17 8l4 4-4 4" fill="none" />
    <circle cx="12" cy="12" r="2.3" fill="currentColor" stroke="none" />
    <path d="M12 3v3M12 18v3" fill="none" />
  </svg>
);

export const FigmaIcon = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor">
    <path d="M9 2h3v6H9a3 3 0 0 1 0-6Z" opacity="0.9" />
    <path d="M12 2h3a3 3 0 0 1 0 6h-3z" opacity="0.6" />
    <path d="M9 8h3v6H9a3 3 0 0 1 0-6Z" opacity="0.75" />
    <circle cx="15" cy="11" r="3" opacity="0.6" />
    <path d="M9 14h3v3a3 3 0 1 1-3-3Z" opacity="0.9" />
  </svg>
);
