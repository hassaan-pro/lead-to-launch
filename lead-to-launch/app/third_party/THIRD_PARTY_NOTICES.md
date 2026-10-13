# Third-party notices

Lead to Launch builds website-generation prompts. The design rules in `lib/design-directives.ts` and `lib/generation/knowledge.ts`
are condensed and adapted from the open source projects below. Their licenses require that the
license text and notices travel with any derived work, so they are kept in this folder.

| Project | Author | License | Source | Snapshot |
| --- | --- | --- | --- | --- |
| taste-skill | Leonxlnx | MIT | https://github.com/Leonxlnx/taste-skill | d237dd3 |
| impeccable | Paul Bakaus | Apache-2.0 | https://github.com/pbakaus/impeccable | c63b8dd |
| skills | Emil Kowalski | MIT | https://github.com/emilkowalski/skills | 2d22863 |

## What was used and how it was changed

These changes are stated here because Apache-2.0 section 4(b) asks for it.

- **taste-skill** (soft-skill and minimalist archetypes): the visual archetypes, the banned fonts,
  icon, shadow, layout and motion patterns, and the mobile collapse rules were rewritten as short
  prompt directives. No files were copied verbatim.
- **impeccable** (shape, typeset and persuade-mode references): the design-brief-first workflow, the
  typographic role and measure guidance, and the one-dominant-move principle were rewritten as short
  prompt directives. Its platform reference files (ios.md, android.md), which impeccable derives from
  ehmo/platform-design-skills (MIT), were NOT used. The original NOTICE is kept in this folder.
- **emilkowalski/skills** (animate, mobile-native): the easing curve, duration ranges, transform and
  opacity rule, reduced-motion and hover-gating rules, and the 100svh, 16px input and tap target
  fixes were rewritten as short prompt directives.

Nothing in this folder is a statement of endorsement by the original authors.

`lib/generation/knowledge.ts` is the larger of the two. It is the system prompt for the in-app generator and
adds a library of page architectures and creative constraint cards. Those additions are original to this project.
The architectures, constraint cards and prompt workflow are not taken from the projects above.
