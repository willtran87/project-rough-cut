# Level 1 arrival-phone composition

Scope: local V01 pixel lettering, V04 opening composition, V19 readable objects and V20 opening transition. The complete 35-item / V01–V21 visual upgrade remains active.

## Change and visual result

The previous phone covered roughly 9.95% of the frame by its projected body rectangle at the default 58-degree field of view. It also remained partly visible when the six-second notification expired. The new camera-local pose occupies 6.19%, a 37.77% reduction, and sits lower on the right so more of the first approach remains exposed.

`course-arrival-presentation.js` derives lift and stow from simulation age. A smooth 0.45-second rise leads into a held reading position, followed by stow from 3.45 to 6.2 seconds. The phone is completely below the viewport before the existing visibility timer hides it. Field-of-view compensation preserves reading size and margins at supported 45/85-degree extremes and in portrait. Reduced motion holds a fixed pose and retains the existing instant expiry. No simulation, notification lifetime, caption timing, danger priority or interaction rule changes.

The 512×768 screen now uses the existing station-paper alphabet drawn in whole-pixel blocks, with eight solid colours. Message text, geometry, hand attachment, nearest magnification, linear minification and palette are retained. The station-paper module changes only by exporting its existing alphabet; its drawing logic and artwork are byte-for-byte unchanged after removing that export/comment.

## Verification

- `tools/verify-course-arrival-composition.cjs`: 18 views each for baseline/current, native/software. Ages 0, .2, .6, 2.6, 4.5, 5.7, 6.19 and 6.21; 2560×1600, 1280×720 and 390×844; extreme field-of-view views; reduced motion and actual keyboard movement. Native before10049/after88737 and software before14949/after68081 exited0.
- Current phone bounds are fully below the frame at age0 and6.19, wholly inside it while held at all tested viewports/FOVs. At6.19, the highest body vertex changed from NDC−.6219 (visible) to−1.5036 (below the frame).
- Map, focus, line of sight and aim hide the phone and restore it when cleared. Escape pause preserves the complete pose/state after1000ms, and resume works. W input moves `(0,15)` to `(0,22.2)` with positive clearance.
- Thirty age changes do not grow warm geometry/texture/program counts. Reset disposes the old screen geometry/material/map once each and reconstructs a visible phone. No fixture browser errors.
- `tools/compare-course-arrival-composition.cjs` passes: 36 matched view pairs; exact world/light/28-lantern/collision inventories and all phone child geometry/local transforms; both stowed screenshots at6.21 are byte-identical to baseline. Eight opaque screen colours and unchanged paper art verified. `comparison.json` stores the measured bounds/area result.
- Existing `tools/verify-course-arrival.mjs` passes latch-once, inactive-clock, skip, finite-recoil and comfort checks. It was rerun during acceptance.
- Installed standard gameplay client through `verify-presented-client.mjs`, five real keyboard bursts, native60183/software75373 exited0. No gameplay state injection. Player advances from roughly7/8 to33/40 with clearance remaining positive. Native canvas2492×1402; software adapted to640×360. Selected start/read/stowed images and state files inspected.

## Capture anomaly investigation

Original `client-native/page-2.png` showed a partly black phone screen, while `shot-2.png`, the raw canvas readback at the same capture, showed the complete message. This anomalous image is retained.

Read-only `tools/inspect-arrival-walk.cjs` replayed the same natural inputs (process41227 exited0). At the reading frame, rays from the camera to four screen samples hit the phone screen before any world object; the screenshot was also correct. It changes no gameplay/phone pose state, apart from normal input and deterministic time advancement.

Installed-client headless audit92804 and headed audit82079 both exited0 with five correct movement captures and no error artifacts. The repeated frame218 page and settled-page captures show the complete message. Presentation records retain identical frame number, visible phone, visible document/HUD and preparation=false before/after/settled. This supports an isolated capture/presentation anomaly; it does not establish its exact cause or prove a renderer bug was fixed. No speculative production renderer change was made.

## Limits and receipt

The opening phone is locally improved and the expiry pop is resolved for normal motion. Existing first-person hand geometry/materials still need artistic refinement, as do broader opening reveals, all-route composition and the remaining full checklist. Software output remains below the high-resolution target; no whole-level performance or fidelity acceptance and no speedup claim.

Artifacts: `output/level-one-arrival-composition/`. Source/test snapshots and SHA256 receipt are stored under `verified-source/manifest.json`. All owned verification/client processes are terminal. Other chapters, global lighting and path-lantern placement are preserved.
