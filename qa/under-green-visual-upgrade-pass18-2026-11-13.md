# Under the Green visual upgrade — pass 18

V51 accepted locally: quieter, sharper HUD presentation based on Level 1's current DOM HUD. Full 53-item scope remains active; 12 items accepted, all seven full-level release gates open.

## Change

- `under-green-hud.css` adopts Level 1's Courier family, warm ivory text, muted gold edge, square controls and translucent fading objective panel. Font size follows the scene width, capped at 30px, with compact phone layouts. World art is untouched.
- `under-green-hud.js` provides a concise persistent destination. Full route instructions remain in Pause and text diagnostics. No new event/action banners or default duplicate sound descriptions.
- Water phase, timing, stance-release advice and shape/color signals remain available. Desktop water copy and large optional captions use the same type hierarchy. Short landscape screens separate captions from Use so neither crosses the aiming area.
- The stay-inside objective remains visible on compact screens throughout sluice closure, including Q rear glance away from the release. Existing E/Q, controller and touch bindings remain intact.

## Reference and visual review

Fresh Level 1 captures: `output/under-green/visual-upgrade/pass18-level-one/`, verifier `tools/capture-under-green-hud-reference.cjs`, terminal session 16149, four views, no page errors. The current DOM HUD uses Courier New (30px desktop maximum), rather than the system font used by its separate canvas fallback. Font/color/panel values were checked against `quality-ui.css` and actual computed styles.

This is a HUD reference comparison, not full environment parity acceptance: Level 1's sampled desktop scene target was 1280×720, while Under the Green's native target was 2560×1600. DOM text remains independent of that scene resolution. Both references also cover 1280×720, 390×844 and 844×390 viewports.

Reviewed fresh high-resolution gallery before/after, high-pressure crossing, pump interaction, keeper release, portrait slow-stance/long bindings, maximum captions on portrait and landscape, and closure/rear-glance screenshots. Text is clearer while the objective occupies less space: gallery panel at 2560×1600 changes from 450×104.38 to 391.06×83.58px; portrait from 280×106.53 to 203.03×53.80px. Scene centre remains unobstructed in every accepted fixture.

## Verification

`node tools/verify-under-green-hud.cjs --output=output/under-green/visual-upgrade/pass18-hud-accepted`

Terminal session 14328 passes **51 views** (four before, 47 after), with no console/page errors. Evidence: `pass18-hud-accepted/report.json` and matching PNGs.

- Bounds, overflow, inter-panel overlap and aiming-centre clearance at 2560×1600, 1280×720, 390×844 and 844×390.
- Low, warning, surge, receding and slow-stance water states; default captions stay empty in these cases.
- Actual E operates the pump; Enter does not. Q rotates rear view and returns. Pause freezes time and retains full route instructions.
- Sound descriptions explicitly enabled, audio muted, caption size 140%: text remains bounded alongside interaction controls at all four sizes.
- Actual long-label key remapping, both stance holds and releases. Controller A and touch Use operate the pump through the normal input path.
- Actual E starts sluice closure and reaches secured aftermath. Stay-inside instruction remains visible at all four sizes and during Q.
- Four paired gallery/pump views have identical scene resolution, draw calls, triangles and texture counts. No isolated frame-time claim.

The first test (12569) correctly caught a landscape maximum-caption centre overlap. Session 99786 passed after repositioning it. The later closure reminder improvement was then rerun in 14328; the accepted folder is authoritative. Earlier artifacts are retained.

Installed develop-web-game client: terminal session 96129 exits 0, five screenshot/state pairs in `pass18-client-final/`; final canvas image and text state inspected. Opening completed; gameplay at (0,12.68), stopped after input release, 960×540 software scene. No error artifact. Its initial fixed five-second primary-click timeout occurred while Preparing; subsequent Enter bursts progressed the intro and entered play. Warning retained, no live process was restarted. Earlier client 74604 also exited 0.

## Limits and remaining work

These are controlled placements and real local interaction tests, not a full pursuit playthrough. Controller and touch are emulated. No world geometry, water simulation, navigation, movement rates, Joe behavior or visual assets changed, so prior world-clearance evidence remains applicable rather than being re-claimed as new evidence.

V53 remains pending; vignette and camera motion were not retuned. Remaining material repetition/density, district composition, lights, water, hero props, Joe/scythe/ghost craft, full Level 1 comparison and software performance requirements remain in scope. This pass does not close any whole-level gate.

Six final production/test snapshots and SHA-256 hashes: `output/under-green/visual-upgrade/pass18-source/final-hashes.json`. Baseline HTML/JS/CSS also retained there. All owned browser/client jobs are terminal. No other chapter runtime edits, commits, deployment or artifact deletion.
