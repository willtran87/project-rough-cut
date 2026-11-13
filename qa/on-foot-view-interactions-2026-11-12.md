# First-person interaction view and binding-aware coaching

November 12, 2026. Scope: review items 6, 8, 41 and 44; actual Level 1 and Under the Green consumers.

## Reproduced and fixed

Both chapters checked interaction facing against the travel heading while rendering rear glance with a different camera heading. Ordinary keyboard input reproduced two failures: turning the view away left the nearby action available and Use activated it off-screen; a control revealed by rear glance remained unavailable. Baseline: `output/on-foot-view-interactions/before.json` and the corresponding before screenshots.

Under the Green now supplies the actual view heading to its interaction helper. Level 1 uses its existing rear-glance view for visibility and target ranking, plus the rendered stance eye height for elevation checks. Travel heading, movement, reach, obstruction, target priority hysteresis and chapter-specific action semantics remain owned by their existing systems. Back Nine's vehicle/runner interactions were not changed.

The prompt audit also found three hardcoded Level 1 HUD instructions: the opening walking lesson, optional chip lesson and active aiming instruction. They now call the existing movement/action label resolvers. With I/J/K/L movement and B chip, visible HUD text reads the matching keys; pressing and releasing B still performs the ordinary shot.

## Verification

- `tools/verify-on-foot-view-interactions.cjs` passes with default bindings and `--remapped`. Real R/E and Y/T input exercises looking away, rejected activation, returning to the forward view, rear-visible action and successful activation in both chapters. Travel headings stay unchanged. Diagnostics, visible prompt ownership and labels agree. Remapped mode also verifies actual I/J/K/L coaching, B practice/aim prompts and B chip release.
- Before/after artifacts: `output/on-foot-view-interactions/{before,verified,remapped}.json`. Fixtures place the player near authored controls and keep Joe away; actual key handling, glance animation, targeting, UI and activation remain live. The Level 1 fixture waits for world/actor readiness before testing motion. An early probe without that wait sampled a frozen loading state; it is not the retained baseline.
- Rear-facing action captures inspected at **2560×1600, 1280×720, 844×390 and 390×844** in both chapters. Remapped T interaction and B aiming screenshots inspected at 2560×1600. Under the Green's final fixture uses a distant searching Joe so that it does not trigger a misleading entrance caption beside the pump. Level 1 retains its existing landscape stage on portrait screens; this pass does not claim a portrait HUD redesign.
- Existing Under the Green rule, build-browser and controls regressions pass: valid reach/facing, use/persistence, gate cancellation/occupancy/completion, water advice, normal vertical mouse look, rear-glance travel, stance/speed parity, controller/touch movement and inherited preferences.
- Current `verify-spatial-settings-browser.cjs` passes, including actual pointer response, device gains, normal vertical look, live settings, crouch/sprint toggles, pause and cross-chapter preference integration.
- The historical combined `verify-quality.cjs` stops at line 14's sensitivity assertion. It directly writes `state.lookSensitivity` after changing the authoritative spatial service. A copy served with both interaction changes reversed fails at the same assertion (`output/on-foot-view-interactions/verify-quality-before.cjs`). This pass does not claim that combined suite is green or alter product sensitivity to satisfy its obsolete fixture. The preceding facing/activation checks and current dedicated spatial suite pass.
- Standard Level 1 client completed four iterations. Latest `level-one-client/shot-3.png` and `state-3.json` inspected: actual first-hole gameplay, loaded course, story closed, 22 course units traveled, no error artifacts. The initial two-iteration run reached loading without a fresh gameplay canvas; it was not counted as gameplay verification.
- Standard web-game client completed Under the Green iterations: latest screenshot/state inspected, playing/ready at 0.8 seconds, movement and scene coherent, no error artifacts. Syntax and scoped whitespace checks pass.

The full 44-item objective remains incomplete. First-person Listening Focus semantic comparison, broader prompt/interaction coverage, encounter acceptance and human/device/listening validation remain separate work.
