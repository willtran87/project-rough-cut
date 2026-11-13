# Under the Green presentation and shared controller menus

November 12, 2026. Implementation and automated browser review; not an unfamiliar-player or physical-device study. All 44 review items remain tracked in the implementation ledger. The previous goal turn refined the build prompt and was progress; this turn changes runtime behavior and produces verification evidence.

## Player-facing changes

- Water now issues from six physical nozzles as eight curved streams, lands in irregular foam, and runs toward collection grates at the banks. The nozzle positions and curves share authored data. Nearby active channels alone update droplets; reduced motion freezes animation while actual pressure changes still switch the stream and signal state.
- Stop octagon, warning triangle and low-flow chevron replace color-only signal squares. Each box has faces on both sides. Boxes sit clear of the wall, above 2.2 m, supported by a bracket. Most repeated overhead water instructions were removed; the protected lesson retains one teaching sign.
- Portrait and short landscape views use a compact contextual water strip. Learned control hints retire, and one bottom message gives immediate attacks priority over checkpoint/optional text. The full objective remains in Pause. This does not yet implement shared message priority across every chapter.
- Root collars, bunker strata, a connected painted pump housing, range netting with trapped balls, a framed keeper gate and a permanent records cabinet extend the golf infrastructure. The record moved to a maintenance recess at (-24.15, 56.6), is collected with ordinary Use, remains readable in Pause, and is acknowledged by the ending. These are an initial district pass: close wall views still look repetitive and the broader course composition needs further work.
- A shared `dom-gamepad-menu.js` adapter now drives Under the Green and Back Nine DOM menus. D-pad/left stick moves focus; horizontal input adjusts ranges/selects; A activates; B closes an expanded section or resumes from Pause; Start pauses/resumes. Focus remains visible and scrolls into view at compact sizes. Controller disconnect pauses active play. Reconnection and menu transitions require neutral input before accepting a held button. Gameplay profiles remain distinct.

## Defects caught during review

Visual inspection caught repeated foam rings, striped stream textures, signal faces hidden behind their housing, signal boxes partly buried in walls, a records sign behind the wall cap, old pump grilles floating above the replacement housing, and environmental details hidden behind retaining walls. The current pass corrects those placements/presentation problems. It does not claim finished art direction.

The rendered actor audit caught Joe's foot vertices within the clearance margin of the new raised grate bars at the keeper spillway. Lowering the bars to a flush 2 cm surface resolved the sampled intersections; the test expectation was retained. A landscape menu check caught a partially offscreen focused checkbox; centered focus scrolling corrected it.

## Verification

| Check | Result and scope |
| --- | --- |
| `node tools/verify-under-green-presentation.cjs` | Pass. Four pressure phases, eight arcs/channel, prioritized attack caption, reachable record/journal/result, reduced-motion state transitions, HUD layout. Captures at 2560×1600, 1280×720, 844×390 and 390×844. |
| `node tools/verify-under-green-folded-browser.cjs` | Pass. 1,240 sampled static-clearance positions; actual pump Use/save, keyboard movement across drained outlet, range checkpoint and secured gate aftermath/result. |
| `node tools/verify-under-green-clearance-browser.cjs` | Pass. Nine rendered Joe/tool poses, each with 14,697 deformed vertices, including wall preparation and open/partial/closed gate. No sampled intersections after the grate correction. Not an all-space clearance proof. |
| `node tools/verify-chapter-gamepad-menus.cjs` | Pass. Both chapter menus operated through injected Gamepad API input; settings, focus, checkboxes, ranges, UG pressure select and journal, start/pause/resume/retry, disconnect and held reconnect. Focus screenshots at the four sizes above. Main-menu link activation/navigation is tested against a stub destination; this is not a new end-to-end Level 1 menu test. |
| `node tools/verify-under-green-controls.cjs` | Pass. Level 1 movement/speed/stance agreement, normal real pointer-lock vertical look, rear glance, controller deadzone/speeds, touch run, saved remaps/sensitivity/FOV. |
| `node tools/verify-back-nine-opening-controls.cjs` | Pass. Opening next/back/skip, held-input protection, fullscreen, gamepad start/pause, touch start, failed-art skip and reduced-motion behavior. |
| `node tools/verify-runner-controls.mjs` | Pass. Back Nine steering/follow-camera semantics, ignored mouse, obstacle clearance and charge counterplay. |
| Required develop-web-game client | Two input bursts, latest image and text state inspected. Artifacts under `output/chapter-gamepad-menus/standard-client`. |

Reports: `output/under-green/presentation/browser.json`, `output/under-green/folded/browser.json`, `output/under-green/clearance/rendered-geometry.json`, `output/chapter-gamepad-menus/browser.json`, `output/under-green/controls.json`, `output/back-nine-opening/controls.json`.

Screenshots actually inspected include spillway pressure on desktop/portrait, roots and physical signals, pump housing, records after collection, bunker/range/keeper views, Under the Green landscape settings, Back Nine desktop/portrait settings, and the standard client's gameplay capture. No errors were reported by the passing browser checks. At the fixed spillway view, batching produced 43–46 draw calls across phases; the root-gallery client view is around 205. These are scenario counts, not device frame-rate or memory budgets.

## Remaining work

Late range/CP1 tension, stronger pump before/after sightlines, district composition/material variety and broader camera/actor clearance remain open. Touch still needs two-thumb sprint ergonomics. Level 1's canvas menus and remaining DOM settings need their own integration audit; the DOM adapter is used by two chapters, not a claim of full campaign controller certification. Broader caption/comfort settings, performance budgets on representative devices, unfamiliar-player sessions and actual listening reviews remain pending. No physical controller, phone ergonomic or human playtest results are claimed.
