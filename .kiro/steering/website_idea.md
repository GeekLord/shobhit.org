---
inclusion: always
---

<!------------------------------------------------------------------------------------
   Add rules to this file or a short description and have Kiro refine them for you.

   Learn about inclusion modes: https://kiro.dev/docs/steering/#inclusion-modes
-------------------------------------------------------------------------------------->

# shobhit.org

## Product

A playful, visually rich web experience built exclusively for people named "Shobhit." The goal is delight: visitors should feel a sense of shared identity, fun, and surprise. Tone is celebratory and lighthearted, never corporate.

## Core Features

- **Interactive world map**: each Shobhit pins their location and leaves a personal message, forming a global community tapestry. This is the centerpiece.
- **Fun facts** about the significance and meaning of the name "Shobhit."
- **Random rotating quotes** that are thought-provoking or amusing.
- **Animated interactive zones** seeded with hidden Easter eggs and surprises that reward exploration and curiosity.

## Design Language

- Blend soft pastels with vibrant, spirited accent colors; keep the overall palette harmonious, not chaotic.
- Draw animation and interaction inspiration from playful Japanese, Korean, and Chinese web design (micro-interactions, motion, character/mascot energy).
- Animation is essential, not decorative filler. Prefer smooth, performant transitions and hover/scroll effects.
- Prioritize a sense of fun and discovery in every interaction.

## Conventions

- When adding features, ask whether they reinforce delight, shared identity, and surprise. If not, reconsider.
- Keep animations performant: prefer CSS transforms/opacity and `requestAnimationFrame` over layout-thrashing properties.
- Respect `prefers-reduced-motion` so the experience stays accessible.
- Ensure interactive zones and the map are responsive and usable on mobile.
- Easter eggs should be hidden but discoverable, never disruptive to core flows.
