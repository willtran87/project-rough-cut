# Final Cut — catastrophe, road and fence coda

Full 72-item goal remains active/incomplete. This pass advances FC47/49/50/51/58/59/64/66. It does not certify finished animation, audio listening quality, unfamiliar-player engagement or release performance.

## Authoritative behavior

- Only the existing physical saturated-swale trigger starts the aftermath. Victory is immediately irreversible and saved. The live rig's exact wreck position and heading now persist instead of moving to a generic position on reload.
- A shared aftermath clock drives wheelspin, torn turf, chassis drop/roll, unequal wing strain, manifold rupture at 3.2 seconds, reel grind-down, shutdown at seven seconds, and a short final PA fragment at 8–9.2 seconds. Water reaches toward the empty grandstand and loses pressure after the initial spectacle. Essential movement and camera control remain available.
- The single shipped Joe actor is reparented out of the cab. It transitions past a visible running board/rail, then walks fixed course-side waypoints using the existing gait sampled by applied distance and relaxed arm IK. Joe waits short of the fence until the player secures the boundary. No actor acquires the player as a pursuit target and no aftermath actor/debris can capture them.
- The gate closes after the player's center passes y98.5, beyond its full swing. The same angle controls its rendered leaf and collision. Closure takes .6 seconds; immediate sprint reversal at left/center/right cannot strand the player inside. The public face reads COURSE CLOSED. Sign backs are opaque rather than mirrored text.
- The player may inspect the scene indefinitely. A normal Use action near the road sign ends the chapter; reaching the road no longer immediately replaces the world with artwork. This preserves an optional coda without a forced waiting period. Existing ordinary-input pilots and browser completion now perform that actual action.
- Snapshots include aftermath clock, exact wreck coordinates, Joe's waypoint/position/phase, and secured boundary. A secured save restores the player on the public side with the gate latched. Legacy victory saves still load. Pause stops all simulation and actor progression.
- The fixed audio graph now has 14 voices, adding traffic and breathing to the public-road mix. Disabled engine/reels stop, water recedes in the mix, and physical rupture/shutdown/gate events use spatial emitters. These remain procedural sounds; no human listening approval is claimed.

## Verification

- `node tools/verify-final-cut-ending.mjs`: passes three frame rates (30/60/120Hz) through actual trap contact, irreversible victory, staged collapse, player walking through gate, rotating collision, pause, coherent reload, nonlethal Joe arrival, and explicit finish. Also covers late departure/waiting restoration, five gate angles, and immediate sprint reversal at both gate edges and center.
- `node tools/verify-final-cut-ending-browser.cjs`: actual keyboard road traversal, gate closure, pause/reload on public side, Use to finish, same-actor state, real reduced-motion UI, bounded applause window and fixed audio count. Twelve screenshot/state samples, no page/console errors. Trap observation and road-approach setup use explicit fixtures; this is not an uninterrupted first-time playthrough.
- Existing rules, mowing, danger-message, controls, opening and browser suites pass. Seven complete ordinary-control pilots now take 75.16 seconds walking, 78.88 sprinting and 57.14 from pump preparation. This remains a compact prototype, not proof of the full dramatic pacing.
- Inspected collapse, dismount, steps, walking and fence at 2560×1600, plus fence at 1280×720, 844×390 and 390×844. Fixed mirrored signs and oversized glowing water after inspection. The rail-contact sample improved from ~8cm to ~2cm hand error. Complete dismount foot planting and contact continuity still require animation polish.
- Installed standard client completed both `standard-ending` and the final post-geometry `standard-ending-final` run. Latest final screenshot/state inspected: ready/playing, 17.92m traveled, reveal, 14 audio sources, no error artifacts. Final ending/opening browser reruns also completed successfully after geometry changes; the reduced-motion and revised water/fence renders were inspected.

Artifacts are under `output/final-cut/ending/`: `rules.json`, `browser.json`, twelve named screenshots, and profiling reports. The generated ending image remains supplementary to the newly playable coda.

## Measured rendering and remaining risk

`node tools/profile-final-cut-ending.cjs` renders 60 repeated samples per frozen pose after five warmup renders, awaiting `advanceTime(0)` and forcing GPU completion with `gl.finish`. This includes a requestAnimationFrame wait and synchronous driver overhead. It is a diagnostic comparison, **not ordinary gameplay FPS or sustained acceptance**. The final geometry profile ran without other tests started by this task.

| Tier / pose | Resolution | Median / p95 (ms) | Draws / triangles |
| --- | --- | --- | --- |
| RTX 3090 / cutting | 1280×720 | 16.9 / 18.0 | 89 / 72,058 |
| RTX 3090 / collapse | 1280×720 | 17.0 / 18.0 | 111 / 88,724 |
| RTX 3090 / fence | 1280×720 | 16.9 / 17.9 | 125 / 88,960 |
| SwiftShader / cutting | 960×540 | 53.4 / 102.9 | 89 / 51,322 |
| SwiftShader / collapse | 960×540 | 67.4 / 132.8 | 111 / 57,620 |
| SwiftShader / fence | 960×540 | 71.8 / 118.3 | 125 / 57,856 |

Initial software medians were 121.6/166.5/170.4ms. Reducing resolution and removing one spotlight barely helped, so both quality losses were reverted. Rigid sibling batching reduced draw calls from 144/185/215 to 89/111/125 while retaining each animated parent. Low-poly droplets and two crossed, three-level leaves per software tuft reduced vertex work; all 1,944 tuft locations/heights/cut rules remain intact. Hardware retains three five-level leaves. Shader/geometry/texture counts remain bounded.

Use 16.7ms hardware and 33.3ms software as provisional live-frame targets for the later sustained test, with p95/spikes reported separately. **Software performance is not accepted.** It still needs further optimization and normal moving-camera/frame-completion profiling; this pass neither hides that risk nor claims CPU submission time proves smoothness. The conservative synchronized maximum included a 650ms software cutting outlier, so warmup/driver variance also needs investigation.

## Still required

Keep all 72 requirements. Main outstanding work includes distinct physical entrances/Joe relocation, authored overview and three different crossing decisions, final world/rig/actor/effects quality, recorded spatial sound and listening tests, ball aiming/recovery, evidence-aware consequences/art variants, mastery/replay/credits/postcredits, broader lifecycle/device/campaign runs and unfamiliar-player comprehension/engagement tests. The coda's structure now exists; its final polish and acceptance do not.
