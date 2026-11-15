# Intro craft refinements — 2026-11-14

Implemented the second approved set of ten intro refinements. The existing game clock, 8.15-second sequence, dialogue timing, input paths and menu presentation remain integrated.

## Implementation

| Item | Result |
| --- | --- |
| Weighted mower approach | Six-percent forward scale with a brief three-pixel recoil; background stays still. |
| Restrained Joe acting | Cached neutral, grip and grin poses; hands and shoulders settle before the expression changes. |
| Cutting follows the mower | Opening in tall grass tracks the deck; short turf and retained edge stubble appear underneath. |
| Clippings have weight | 28 finite clippings arc, rotate, land and fade into the foreground. |
| Practical light | Cached warm receiver light on mower surfaces and two small ground pools. |
| Wet highlights | Bounded pixel glints on painted steel, handle and gate hardware. |
| Smaller title | Weathered mark at lower left, without the large opaque rectangle over Joe. |
| Pause before the line | Motor drops at 4.18 seconds; grip changes at 4.5; dialogue begins at 5.25. |
| Continuous setting | Selected menu scene used behind the transparent subject; foreground fades out into that scene. |
| Portrait framing | Tall stage, closer subject, separated caption and touch prompt. |

`web/intro-presentation.js` owns this presentation. Targeted integration in `web/game.js`, `web/course-menu.css` and cache keys in `web/index.html`. No additional animation loop or WebGL context. Cached poses and light textures; maximum 80 ambient speckles and 28 finite clippings. The existing 30Hz intro cap, focus/visibility pausing and reduced-motion behavior remain. Temporary handoff surface used only during the final dissolve. Existing opening fallback retained.

## Artwork

Built-in image_gen used for transparent extraction and a neutral expression variant. Final sources are `assets/intro-joe-grin-cutout.png` and `assets/intro-joe-neutral-cutout.png`; runtime WebPs are `web/assets/optimized/intro-joe-grin-cutout.webp` (267,540 bytes) and `web/assets/optimized/intro-joe-neutral-cutout.webp` (246,748 bytes). Exact prompts and references: `assets/intro-joe-animation-prompts.txt`. Alpha preserved; neutral's one-pixel source-width difference normalized by the shared render cache. Rejected full-frame anticipation variant retained under `output/intro-craft/rejected` and not loaded by the game.

## Validation

Evidence is isolated in `output/intro-craft` to preserve the preceding pass.

- Native and SwiftShader full intro runs and functional assertions passed with no browser errors. Enter/Space/Escape, touch and controller skip; focus freeze/resume; hidden freeze; OS reduced-motion preference; identical reduced-motion hold captures; no residual menu entrance animations.
- Rendered beats at 0.6, 2.6, 4.3, 4.7, 5.1, 5.8, 7.3 and 8.14 seconds. High-resolution 2560x1600, ordinary 1280x720 and portrait 390x844. Clean transparent silhouettes replaced the initially rejected polygon mask. Portrait screenshot test waits for ResizeObserver before rendering again.
- Native baseline task time 465/462 ms over 8.16/8.56 seconds; final 582/533 ms over 8.44/8.31 seconds. Shared-host native samples averaged about 26–28 rendered fps after versus 26–30 before. This is a small absolute CPU increase, not a speedup or a locked-30fps claim.
- SwiftShader baseline task time 483/431 ms over 8.12/8.16 seconds; final 537/424 ms over 8.13/8.15 seconds, 245/246 rendered frames (about 30Hz). No new renderer requirement.
- Menu idle baseline 63.7/54.3/53.3 ms task time per three seconds; final 77.3/66.1/61.2 ms. Both sets had zero layout work, artwork copies and observed layer paints, with movement in 59/59 sampled intervals. Blur paused motion. Small timing variance/increase; retained low-cost idle rendering. These are browser task metrics, not total GPU utilization or a direct simultaneous YouTube playback test.

Reproducible tools: `tools/verify-intro-style.cjs` with `INTRO_EVIDENCE=output/intro-craft`, `tools/verify-menu-smoothness.cjs` with `MENU_EVIDENCE=output/intro-craft/menu`. Native/software timing and checks have separate directories; menu reports use a nested root to avoid overwriting intro reports.

- Final chapter-picker regression passed all four previews, mouse/touch/keyboard/controller selection, Settings return, four viewport Start Game bounds including 844x390, three destination URLs (loading stubbed), and actual Night Order launch. No browser errors.
- Installed standard gameplay client executed through `tools/verify-presented-client.mjs`; actual final screenshot inspected at 2560x1600. State: intro at 5.7 seconds, phase Joe, pose 2, ready true. No error artifact. Logical game canvas 1280x720.
- Silent real-time recording: `preview/intro-to-menu.mp4`; final menu screenshot inspected. Game audio remains enabled in production. High-resolution title and portrait caption frames also inspected.
- Final JavaScript syntax and targeted diff whitespace checks passed. Owned test processes exited successfully; existing 4187 server retained. No agents, CUA, commits or deployments. Production snapshots under `final-source`.
