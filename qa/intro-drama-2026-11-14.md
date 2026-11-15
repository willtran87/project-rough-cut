# Dramatic reveal polish — 2026-11-14

Preserves the approved concealed reveal, four separate cuts, eye glimpse, silent stare and existing dialogue/menu timing.

Changes in `web/intro-presentation.js`:

- Short grass shudders anticipate each cutter impact; six-pixel overscan prevents exposed borders and keeps gate/loading framing consistent.
- Six textured grass clumps tear away, rotate and fall under gravity. One 96x176 cached sprite reuses the existing grass artwork; no new downloaded/generated assets.
- A finite 14-droplet spray catches the mower lights during the final breach.
- A brief localized warm light catch strengthens the final impact on the machine. No full-screen flash or added bloom pass.
- Cool side shadows are baked into the three pose caches to give the warm face and headlights more depth.

Reduced motion omits shudder, falling clumps, dew and the impact light pulse. Finite debris settles early in the dialogue and stops well before the menu; Joe's pose/timing is unchanged. Existing clock and 30Hz target retained; no extra RAF, timer or WebGL context. Menu source/layout and game logic unchanged. Cache keys updated in `web/index.html`.

Validation/evidence root: `output/intro-drama`. Source baseline captured before edits. Existing reveal test now accepts `INTRO_EVIDENCE` and captures the final breach at 4.42 seconds.

- Rendered face-region exposure counts: 0 / 3,963 / 26,267 / 75,382 changed pixels across machine, eye, partial-face and final-breach holds. Engine surge/silence and safe missing-portrait concealment assertions passed, no browser errors.
- Full native functional suite passed natural completion; keyboard/touch/controller skip; blur/hidden freeze; OS reduced motion; identical reduced-motion hold screenshots; completed menu entrance. High-resolution 2560x1600, ordinary 1280x720 and portrait 390x844 captures.
- Native full-intro samples: 678/382 ms browser task time over 8.50/8.16 seconds, 239/245 render-counter increments. First run slower than the preceding pass on this shared host; no speedup claim. SwiftShader samples: 331/269 ms over 8.07/8.16 seconds, 247/249 render-counter increments. Browser task time is not total GPU use or a simultaneous video-playback guarantee.
- Software functional suite also passed. Menu idle task samples 54/114/58 ms per three seconds; zero layout work, repeated artwork copies and observed layer paints, 59/59 motion intervals, blur pause passed. Timing variance on shared host; low-cost rendering behavior retained.
- Installed standard gameplay client via the existing adapter passed; latest 2560x1600 screenshot inspected with state intro/5.7s/pose2/ready. Native high-resolution breach and final phone frames inspected. Updated silent preview at `preview/intro-to-menu.mp4`. Final reveal assertions rerun after matching gate overscan. Syntax/targeted whitespace checks passed. Final source snapshots and SHA256 manifest saved. All owned processes terminal; existing 4187 server retained. No agents/CUA/image generation/commit/deploy.
