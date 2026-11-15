# Original feature restoration — 2026-11-07

Local candidate: `20261107-original-features`, served from `web/` on port 4187.

## Restored presentation

- Change Request: a fixed 3D clipboard, layered paper and metal clip. The paper uses nearest-filtered parchment detail from the existing prop atlas. Actual E collection removes it; Emergency Appeal drops the document at its recorded location. Existing eligibility, score tradeoff and Joe response remain authoritative.
- Environmental omens: bending grass, scattering bird silhouettes and a low fog wake at the original omen coordinates and lifetime.
- Zone events: fence-knock marks, breathing hedge leaves/mist, pond lights, clubhouse doorway light cycling, hedge debris, dark sprinkler arcs, falling range balls and a release sweep. Pond, hedge and clubhouse events anchor to the corresponding 3D scenery; anchors remain fixed while the player moves.
- Tactical evidence: Cadence Forecast ground dashes, Cut Trace freshness and heading, Status Request area and ahead/side/behind caption.
- Exit: mounted beacon with a broken ground sweep at the maintenance shed.

These are spatial adaptations of the original effects. They use world depth testing and the existing event timers, sounds and trigger rules. They do not restore the old screen projection or introduce additional gameplay threats.

## Resource limits and preservation

`web/original-features.js` is a read-only presentation adapter. It uses one capped instanced box batch (112 instances on software, 176 on hardware) and a two-paper batch: at most two additional draws. One private 192×256 paper texture reuses an already shipped atlas; no new asset downloads, shadow lights, physics, path searches or full-screen passes. Fog wakes share the existing mist budget. Distance/frustum culling and the existing 12/24 Hz atmosphere update cadence bound work. Private buffers/materials/texture are released on scene replacement.

Decorative events yield during protected interactions, relief periods and pursuit. Reduced Motion or zero effects density suppresses them while documents and tactical evidence remain. The beacon is static with Reduced Motion. The existing E controls, remapping, movement and smarter Joe pathing are retained.

## Verification

- `node tools/verify-original-features.cjs` and `--software`: 22 captures each, no browser errors. Checks actual E collection and appeal, all eight events, all three omens, fixed anchors, unchanged simulation on render, comfort gates, zero-density tactical evidence, status direction, timer expiry, pause, shader reuse and one restored group after scene replacement.
- High-resolution screenshots inspected at 2560×1600; additional captures at 1280×720 and 844×390. Inspection caught and corrected doorway panes behind the existing glass, pond lights below opaque water and an unsupported exit beacon. Grass heights and bird spacing were varied after inspection.
- `verify-atmosphere-return.cjs --software`: passes existing ghost/mist/shaft/trail behavior, first-use shader checks, comfort/pause/map handling, scene replacement and framebuffer occlusion tests. Effect draw ceiling now allows the two restoration batches (11 total).
- `verify-interact-controls.cjs`: passes E interaction, menu Enter, remapped G, conflict swaps, settings migration/persistence and responsive prompts.
- Ghost behavior, gaze, gaze variety, movement variety and feedback suites pass. Release check passes 90 scenarios and all 56 runtime images (20.8 MB); syntax and whitespace checks pass.
- Installed normal Playwright client completed two iterations with no error artifacts; gameplay screenshot and state inspected (scene ready, first hole, 14 units traveled). The software renderer still reported slow GPU frames, so whole-game software frame pacing remains open.

Artifacts: `output/original-features-20261107/{hardware,software,atmosphere,client}`. The reported effect update cost covers the entire atmosphere CPU update, not GPU frame time; these tests do not establish a whole-game FPS improvement. Existing software-rendering foliage/pond frame-pacing limits remain a separate issue.

## Later human playtest

Play a fresh run using E. Check that the clipboard can be found without a debug camera, the appeal feels readable during escape, and zone events are noticeable without resembling obstacles or obscuring the route. Compare normal, Reduced Motion and zero effects density. Check the Status Request bearing after turning away and the exit beacon on final approach. Record event visibility, control confusion and discomfort with the previously prepared playtest materials; human acceptance remains deferred at the user's request.
