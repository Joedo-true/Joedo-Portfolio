# Sollers Shop

Frontend SPA of an online store: Vite + React 19 + TypeScript, Tailwind CSS,
Zustand (cart), Framer Motion, Lenis (smooth scroll). The catalog is a local
database (`src/data/catalog.json`, 194 real products) — see `README.md`.

Two builds share one config: `npm run build` → self-contained `dist/index.html`
(opens via `file://`, committed); `npm run build:pages` → multi-file bundle used
by the GitHub Pages workflow. After changing anything under `src/`, rebuild the
committed single-file `dist/index.html`.

## Design rules — MANDATORY, not advisory

**`.agents/skills/no-ai-slop/SKILL.md` is binding for every piece of UI work in
this repository.** Read it before creating, styling, redesigning, or reviewing
any component, page, palette, animation, or piece of UI copy — including changes
that look trivial. It is not an optional style guide and not a suggestion to
weigh against convenience.

The core requirements, restated so they apply even when the skill file is not
loaded:

1. **Define tokens before writing code.** Pin down, in this order: subject →
   type (a deliberate display/body pairing) → layout (intent + rough wireframe)
   → signature (the one element the design is remembered by). Never start from a
   layout.
2. **No unjustified defaults.** Gradients "because modern", glassmorphism and
   stacked shadows, one system sans doing every job, hero = centered headline +
   two pill buttons + gradient blob, 01/02/03 markers, an untouched shadcn or
   Tailwind theme — each needs a reason for *this* product or it does not ship.
3. **Justify every animation.** Motion must serve orientation or one specific
   moment of delight. No fade/slide on everything that scrolls, no hover-scale
   on every card, no spring easing on utility controls (toggles, inputs).
   If you cannot state what an animation communicates, cut it.
4. **Copy must be product-specific.** If a line could paste unchanged into a
   competitor's page ("unlock your potential", "seamless experience"), rewrite
   it. Plain and active — "Save changes", not "Submit".
5. **Self-critique before shipping.** Remove one thing and check the design
   survives; read the copy out loud; and verify the floor — visible keyboard
   focus, contrast that holds at a glance, mobile widths, and
   `prefers-reduced-motion`. A bold signature element never excuses skipping
   the floor.
6. **Run the same checklist when reviewing.** Name the specific tell, and
   propose one concrete alternative tied to the actual subject.

**Precedence** (from the skill itself): an explicit direction in the brief or in
an established design system wins — the rules fill the gaps a brief leaves open,
they do not override a choice the user has already made deliberately. Absent
such a direction, these rules are the default and must be followed.

Applying these rules to existing code is a change like any other: if following
them means reworking UI the user did not ask you to touch, say what violates the
rules and get agreement first rather than redesigning unprompted.

## Other skills

`.agents/skills/` also holds design/animation skills from `emilkowalski/skill`
(`apple-design`, `emil-design-eng`, `review-animations`, `improve-animations`,
and others). These are available, not mandatory; `no-ai-slop` is the binding one.
