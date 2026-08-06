# Планета

Single-screen WebGL site: Vite + React 18 + TypeScript, three.js via
`@react-three/fiber`, GSAP (camera), Zustand (phase). No CSS framework — one
plain `src/index.css`, because the whole site is two layers over a canvas.

There is no text content and no scrolling. The site is a loading screen (2D
canvas star-warp), a "sudden stop" transition, and a procedurally generated
hex-tiled planet you can click to fly closer and rotate with the mouse. See
`README.md`.

Everything tunable lives in `src/config.ts` and is mirrored both to CSS custom
properties on `:root` and to `window.SITE_CONFIG`, synced bidirectionally every
200 ms, so live-editing extensions can drive it. Keys marked `rebuild` in that
file define the planet geometry and only apply on reload.

Two builds share one config: `npm run build` → multi-file `dist/` used by the
GitHub Pages workflow; `npm run build:standalone` → self-contained
`standalone/index.html` (opens via `file://`, committed). After changing anything
under `src/`, rebuild the committed `standalone/index.html`.

The planet must stay deterministic: the landscape is generated from
`planet.seed` alone, and there must be no `Math.random` anywhere on the
generation path.

## Design rules — MANDATORY, not advisory

**These rules are binding for every piece of UI work in this repository.** Read
them before creating, styling, redesigning, or reviewing any component, page,
palette, animation, or piece of UI copy — including changes that look trivial.
They are not an optional style guide and not a suggestion to weigh against
convenience.

The core requirements:

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

**Precedence**: an explicit direction in the brief or in an established design
system wins — the rules fill the gaps a brief leaves open, they do not override a
choice the user has already made deliberately. Absent such a direction, these
rules are the default and must be followed.

Applying these rules to existing code is a change like any other: if following
them means reworking UI the user did not ask you to touch, say what violates the
rules and get agreement first rather than redesigning unprompted.
