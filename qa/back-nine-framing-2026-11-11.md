# Back Nine guide and chapter presentation

Compared Level 1's actual Night Order guide (`quality-ui.js` / `quality-ui.css` and its rendered capture) with Level 2's guide, pause, HUD and results flow. The shared visual language is dark green, brass/paper accents, monospace type, narrative setup, a highlighted goal, numbered escape steps and an explicit safe-to-begin action.

## Implemented

- Added a visible splash illustration alongside the Back Nine chapter heading. Reuses `web/assets/optimized/back-nine-opening/05-seen-you.webp`, composed around Joe, the industrial mower and the wet course viewed from the cart. No new generation or runtime asset. The image is requested when the guide becomes relevant, not ahead of the fresh opening sequence; skipped intros and checkpoint resumes load only this guide illustration. Failed image loading leaves a usable framed fallback and never blocks Start.
- Added “Rough Cut · Chapter 02” framing and a short narrative caption. Shortened the essential survival copy. Routes, repairs and distractions are under a collapsible optional section.
- Matched the HUD/menu typography to Level 1. Kept the existing chapter-specific objectives, danger signals and colors. Renamed the return link “Main menu.”
- Separated scrolling reading content from a persistent control/action footer. At small sizes, players can read the rest of the guide without losing bindings or the Start/Resume button. Art remains visible in landscape and portrait layouts.
- Added “Review instructions” to Pause. It retains checkpoint progress, explains the actual driving/on-foot state, and uses the correct powered-garage goal on foot. Reviewing, expanding details and replaying the story do not advance the chase.
- Made guide look instructions and gameplay hints respond to keyboard, controller or touch. Added dialog semantics, menu focus containment and focus on the primary action when entering the briefing, pause or completion screen.

## Remaining consistency gaps

| Gap | Current evidence | Suggested next change |
|---|---|---|
| Shared Continue / chapter navigation | Level 2 saves checkpoints, but Level 1's menu has no direct Back Nine resume entry; the current handoff is from the shed exit. | Add one game-level Continue action and an unlocked chapter/replay menu, preserving the distinction between retry and restart. |
| Victory framing | Level 2's garage completion remains a plain message panel. Its defeat screen now has a dedicated illustrated tableau. | Add a garage aftermath illustration and a compact escape report showing cart/on-foot finish, time, damage and optional crew logs. |
| Settings parity | Level 1 has audio category sliders and configurable bindings. Level 2 reads shared master volume/reduced motion but exposes a smaller comfort panel and fixed chase bindings. | Share the settings shell and persistence, with separate driving/on-foot binding contexts and equivalent audio controls. |

Vehicle handling, chapter-specific hazards, checkpoints and the different objective counts should remain distinct; consistency does not require identical mechanics. This audit does not claim exhaustive feature parity or human acceptance.

## Verification

- `verify-back-nine-framing.cjs`: splash asset/skip loading, four viewports, visible primary action, scrollable optional instructions, frozen guide/pause state, review/resume, keyboard focus, controller/touch copy, on-foot checkpoint goal, failed image and reduced motion. Passed at 2560×1600, 1280×720, 844×390 and 390×844. Captures inspected.
- `verify-back-nine-opening.cjs`: five opening scenes, manual navigation, no hidden chase rendering, guide, start, pause replay, skip preference and both checkpoint resumes pass. Checkpoint test now permits the single reused splash request while rejecting opening-sequence prefetch.
- `verify-back-nine-on-foot.cjs --software`: actual controls, rear glance, camera collisions, pause/comfort, beacon and retry pass. Software still has 22 game shader programs, 36 textures and nine audio voices.
- `verify-back-nine-defeat.cjs`: animation → illustrated defeat → retry/restart, reduced motion, image fallback and four layouts pass. Hardware retains 17 programs and 36 game textures.
- Installed standard gameplay client: two on-foot input iterations, screenshot/state reviewed, no error artifacts.
- Release validation: 90 scenarios, unchanged 67 runtime image references / 26.00 MiB; no warnings/failures. Syntax and whitespace checks pass.

Evidence and baseline: `output/back-nine-framing/`; opening and software captures remain under their existing QA output folders. No simulation, pathfinding, collision, vehicle or world-rendering code changed. Existing software frame-time limits remain. Local candidate on port 4187; not deployed.
