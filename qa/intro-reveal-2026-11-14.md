# Concealed Joe reveal — 2026-11-14

User correction: Joe must be revealed incrementally and unsettlingly through grass cut by gardening tools. The previous immediately visible portrait spoiled the intended horror beat.

## New sequence

- Gate and first 1.12 seconds: opaque close grass, no Joe portrait or silhouette.
- 1.12 seconds: first engine surge and low mower breach. Joe's face remains fully hidden.
- 2.18 seconds: short serrated hedge-cutter stroke opens an eye-level slit; one eye holds in view.
- 3.18 seconds: second upper stroke exposes a narrow vertical portion of the face. Grip and tool remain hidden behind the grass; cutter retracts.
- 4.22 seconds: mower pushes forward through the cut mass, joining the openings. Ragged grass and severed stems continue framing Joe.
- 4.60 seconds: motor falls silent. Joe holds the stare before the existing 5.25-second line and grin.
- 7.20–8.15 seconds: foreground dissolves into the matching menu scene and menu breeze resumes.

Four finite debris bursts follow the cuts. Grass blocks the painted Joe layers rather than fading him in from a full silhouette. Removed the preceding constant speckles, tidy turf stripes and decorative glint sequence from the reveal. Reused the project's grass texture and transparent Joe poses; no new generated assets. Loading/failed portraits stay concealed rather than falling through to the old portrait renderer. Reduced motion uses discrete cuts, with no cutter movement, debris or push.

## Performance

Canvas caches and the existing game clock remain; no new animation loop/context. The final handoff surface is still allocated only for the short dissolve. Maximum 32 cut fragments across the sequence; ordinary menu speckles resume during handoff.

Found an existing cadence error: an early presentation accepted within the tolerance left `lastPresentedFrame` unchanged when using modulo, allowing another render on the next display refresh. Corrected the remainder only for opening modes; gameplay and menu timing remain unchanged.

Native full-sequence samples after the cadence fix: 350/331 ms browser task time over 8.08/8.16 seconds, 243/245 render-counter increments. Before the cadence fix in this pass: 466/396 ms, 481/486 increments. SwiftShader final: 407/392 ms over 8.09/8.16 seconds, 260/262 increments (counter includes event-driven presentations). These are shared-host browser metrics, not a guarantee about simultaneous video playback or total GPU use.

## Checks and evidence

`output/intro-reveal` contains separate native/software timings, screenshots and baseline source snapshots. `tools/verify-intro-style.cjs` passed natural completion, Enter/Space/Escape/touch/controller skips, focus and hidden pausing, OS reduced motion, identical reduced-motion hold captures, and completed menu entrance, with no browser errors. Inspected 2560x1600, 1280x720 and 390x844 framing.

New `tools/verify-intro-reveal.cjs` checks the actual rendered face pixels: zero exposed after the first machine cut; a small eye area after the second; increasing exposure across the final cuts. Also checks synchronized engine surges and silence before dialogue, and that missing portraits never reveal the old scene. Captures both cutter strokes and the still holds.

Final exposure counts in the 280x290 face-region comparison: 0, 3,967, 25,645 and 75,687 changed pixels at 1.65, 2.75, 3.7 and 4.9 seconds. Missing-portrait concealment passed. No browser errors.

Menu idle samples: 69/60/59 ms task time per three seconds, zero layout work, repeated artwork copies or observed layer paints; 59/59 changing particle intervals, blur pause passed. Menu code/layout unchanged in this pass.

Installed standard gameplay client via `tools/verify-presented-client.mjs` captured actual intro at 5.7 seconds, phase Joe, pose 2, ready true, logical canvas 1280x720 inside 2560x1600 page. Final screenshot and state inspected. Preview `preview/intro-to-menu.mp4` is a silent screen recording; engine/voice remain in the game. Native/software tests completed, final edge-art cleanup rechecked with the reveal assertions, installed client and native functional suite. Syntax/targeted whitespace checks passed. All owned test processes terminal; original 4187 server retained. No agents, CUA, image generation, commits or deployments.
