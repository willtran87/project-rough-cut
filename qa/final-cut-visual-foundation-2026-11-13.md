# Final Cut visual implementation — foundation pass

The 72-item plan is active, not complete. `design/final-cut-visual-implementation-ledger.json` records individual status and remaining work. Level 1 parity has not yet been claimed.

## Changes

- Genuine hardware render tiers at 1600, 1920 and 2560 pixels; automatic software fallback at 960. The chapter-specific setting persists without changing shared control preferences.
- Level 1 authored sky, cratered moon, cloud layers, far ridge, woodland and estate backdrop. Moon direction and cloud coverage also control its light.
- Two new imagegen source atlases and lossless WebP copies: six ground surfaces and eight industrial/architectural materials. Turf and gravel are integrated. Enamel, steel, rubber, brass, timber, plaster, slate and rust replace evenly distributed procedural grain on estate surfaces. Unused soil/mud cells are not claimed as integrated.
- Cooler ambient lighting, three mounted warm refuge downlights, bounded hardware moon shadows. Animated reeds cast matching shadows to prevent a hidden mower shadow revealing the attack.
- Shorter reed margins around dense inner cover, coherent wind, localized attack rustle and clustered crown variation.
- Staggered overlapping slate roofs, physically folded pump-roof sheets, tied rafters and knee braces. These are geometry above the established walking clearance.
- Narrow 3.5–5.1 cm cut blades replace oversized grass stars; the cut-state authority is unchanged.

## Evidence and checks

`output/final-cut/visual-foundation/before/` is the prior fixed-view baseline. `accepted-hardware/` contains current fixed views, actual render dimensions, tier selection/persistence, five viewports and a camera-motion resource/profile check. `software/` verifies the 960 cap and five viewports; that capture precedes the final roof/stubble refinements. `reeds-software/` includes the later four-direction concealment geometry.

- Actual hardware render sizes: 2560×1600, 1920×1080, 1280×720, 844×390 and 390×844. No horizontal overflow. All four quality selections yielded their expected internal widths, and High survived reload.
- `routes/browser.json`: uninterrupted direct, garage and drain routes through movement, three crossings, pump, bell, physical collapse and road completion. No live-state placement during each route. Times 120.280, 103.368 and 130.074 simulated seconds; zero captures; 71 captures for review; zero browser errors.
- `reeds-fixed/report.json`, `reeds-software/report.json`: directional tells, real keyboard escapes, pause, rider contacts, reduced/muted warnings and responsive sizes pass.
- `occlusion.json`: all eight paired screenshots have zero different pixels between the hidden-mower view and the diagnostic no-mower view. The initial moon shadow and thinner reed margin exposed north/east differences; both were fixed before acceptance.
- `verify-final-cut-mowing.mjs`: real mowing in both directions at 30/60/120 Hz, local cover removal, persistent separated cuts, destroyed furniture and save restoration pass.
- `verify-final-cut-rig.mjs`: 2,000 independent collision comparisons, angular/swept contacts, deployment and stop-before-masonry checks pass.
- The installed web-game client was run with the existing story/input payload. Its fixed five-second initial click timeout can expire during software warmup; the subsequent keyboard payload is the meaningful entry/play verification. `client-final/state-0.json` confirms ready=true, playing, intro completed and actual movement to y=9.531; the 960×540 screenshot was inspected. No browser error artifact was produced.

Profiling uses 20 completed draws after warmup, camera movement and `gl.finish`, excluding the RAF wait. It is a spot sample on the RTX 3090, not sustained gameplay FPS or a final performance budget. The report contains the raw timing samples; GPU resource counts stay stable after a full warmup yaw sweep. Software cost, worst-case water/destruction effects and texture-memory budgeting remain open.

## Remaining visual gaps

The architecture still needs distinct refuge identities, better masonry, interiors and less competing signage. Ground needs stronger authored transitions and terrain relief. Broader planting, mower-specific materials, Joe's pixel finish/expressions, physical effects, climax, story continuity and HUD finish remain. Match new close views to Level 1 before considering those items accepted. Preserve full-route and concealment contracts during every subsequent pass.
