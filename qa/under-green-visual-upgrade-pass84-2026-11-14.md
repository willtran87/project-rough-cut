# Pass84 — murky flood surface and wall contact

Scope: refine V22/V25 and preserve V26. The complete 53 requirements, 48 review refinements and seven whole-level gates remain authoritative. Local flood acceptance does not establish Level 1 parity or whole-level performance.

## Retained artwork

The rising flood uses dark brown/green silt tones, finer pixel-sampled ripples, small broken reflections from existing lamps and a narrow dark contact band following actual enclosing walls. A static one-channel distance field supplies the wall relationship. Wave normals become quieter at the contact edge. Grazing views become slightly more opaque so distant water conceals the bottom.

The first preview spread the amber reflection too broadly; the retained version reduces specular strength and tightens the highlight. Existing flood height, phase timing, movement slowdown, wet receivers, floating leaves and geometry remain unchanged. This pass does not alter channel water or add lamps. The contact field represents enclosing walls, not root/prop intersections; broader water composition and actor-contact polish remain open.

Two runtime files: `web/under-green-flood-scene.js` and new `web/under-green-flood-shore.js`. The field is 896x1232 Red8, 1,103,872 bytes, linear filtered without mipmaps and disposed with the flood. It adds one sampled texture while the flood is rendered, with no extra geometry or draws. Its measured Node construction time of 68.1ms is a microdiagnostic, not a whole-game startup measurement.

## Verification

- `tools/verify-under-green-flood-finish.cjs`: native and software reports both pass, 49 captures and 4,992 clear camera poses each. Native large views render at actual 2560x1600; software at actual 960x600 within a 2560x1600 viewport. Additional layouts are 1280x720, 390x844 and 844x390. Paired player states, draws and triangle counts agree. E pump, pause, Q, crouch and deterministic camera return pass. The minimum-lamp fixture is dry; it does not qualify minimum-light flood readability.
- Paired flood-cycle states cover elapsed 0, 35, 39, 42, 49, 60, 70 and 90 seconds. Reported wet-wall waterline equals simulation depth. Dry/warning/receded images at 0, 35, 70 and 90 are byte-identical to baseline on both renderers.
- `tools/verify-under-green-flood-finish-motion.cjs`: both renderers pass eight changing frames, exact return to the starting frame, frozen animation when paused and exact stationary reduced-motion output. Ten actual GPU shore samples per renderer agree with independent wall-distance expectations within 0.025m. The initial diagnostic failures were test-scene failures: the custom light shader needs a PointLight declaration. Adding a zero-intensity diagnostic light fixed the harness; runtime lighting was not changed.
- `tools/verify-under-green-flood-shore.mjs`: 7,790 independent Box2 reference samples; maximum quantization error 0.001942m; deterministic bytes.
- `tools/verify-under-green-flood-finish-normals.cjs`: 18 native samples per version over six camera poses and three times; maximum final vector error 0.003485 against finite-difference wave normals. This ran before the final specular-only adjustment, which does not change normals.
- Existing physical receiver suite, copied to `output/under-green/visual-pass84/verify-receivers.cjs`: native pass, 108 receivers, 138 wetness/contact samples, 26,532 leaf-height samples, 132 leaves, maximum depth 0.38m, full floor area 1778.19 square metres and 34 opaque walls. Elevated keeper records remain above the peak. This is native receiver evidence only.
- Installed gameplay client: twelve bursts, terminal success, final ready/playing at (0,15.24), checkpoint 0, elapsed 3.0667s, no error artifact. The initial click timed out while Preparing; the action sequence then entered gameplay. Final screenshot inspected. This dry walkthrough supplements the custom flood tests.

Native flood rise and motion frames, software entry and compact landscape, and the installed-client gameplay capture were visually inspected. All successful final browser reports contain no page errors. Evidence is under `output/under-green/visual-pass84/`.

## Remaining work

Full matched Level 1 comparison, whole-route composition, broader channel/shore treatment, actor motion and software performance remain open. No item status or release gate is promoted by this pass.

## Local render cost

Six warm pairs and 24 alternating GPU-fenced samples per view. The native and software runs were sequential. These are stationary local measurements, not full-route frame-pacing acceptance.

| Renderer / view | Median before → after (ms) | P95 before → after (ms) |
|---|---:|---:|
| hardware / flood-gallery | 17.0 → 17.2 | 19.4 → 19.4 |
| hardware / flood-floor | 11.8 → 12.0 | 13.3 → 13.6 |
| hardware / dry-gallery | 18.3 → 19.5 | 19.8 → 22.5 |
| software / flood-gallery | 274.4 → 273.0 | 302.2 → 312.2 |
| software / flood-floor | 106.1 → 109.7 | 129.4 → 144.8 |
| software / dry-gallery | 209.9 → 213.2 | 277.0 → 296.7 |

Native flooded-gallery rendering remains 550 draws / 434,808 triangles / 211 programs; textures increase from 55 to 56. Native flood-floor is 217 draws / 358,359 triangles, unchanged. Actual rendering resolutions: native 2560x1600, software 960x600. No added vertex-color mismatch.

The small native flood median increases do not prove zero cost. Software remains far too slow, including the baseline; the floor view regresses locally. The dry-gallery pair also changes despite identical images and hidden flood, so these samples include host/runtime variation. Other Bird Squad test processes were observed during the software run. No performance gate is closed.
