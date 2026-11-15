# Under the Green pass 39 — worn and repaired lamp housings

Status: concrete progress; preceding pass38 was verified progress. V31 is locally implemented across the existing glass/cage work and passes38–39. Full53-item objective remains active; all seven full-level release gates remain pending.

## Changes and visual acceptance

- Added selected hood histories at fixed route locations: three broken/chipped corners, three bent front edges, and two riveted iron repairs. Nine fixtures retain sound housings. The fixed authored indices do not produce an every-other-lamp pattern.
- Replaced only the existing rust hood mesh on each lamp. Damage is a closed solid with real missing edge shape; bent steel drops up to31mm at the outer front corner. Repair strips fold over the front lip above the glass, with two fitted brass rivets. Existing weathered pixel materials and world-space sampling are reused.
- The complete set adds228triangles, no textures/materials/lights/draws. Intact pieces, glass, wires, cages and light clocks remain unchanged. All additions stay within the previous complete fixture envelope; patches remain above the lens.
- Native close views show distinct chips, bends and repairs under both warm and cold illumination. All eight affected housings were inspected together, plus full-size examples of each treatment, software repair detail and final installed-client gameplay. The broken edge is visible without hiding the filament; repair fasteners remain restrained.

## Evidence

- `tools/verify-under-green-lamp-housings.mjs`: all17fixture compositions checked. Unchanged16pieces per fixture retain exact geometry arrays/material identity. New hoods stay closed/manifold at both fixture widths; all normal/position components finite. All geometry fits old fixture bounds, repair strips/rivets stay above glass; counts3chipped/3bent/2patched and+228triangles verified.
- `tools/verify-under-green-lamp-housings.cjs`:45native/45software views across all17lamps, additional clock phases,1280x720/390x844/844x390, actualQ, pause and ReducedMotion. Lens/glow/source clock agreement preserved. Zero page/consoleerrors. All paired resource and draw counts unchanged; triangles change only with visible damaged/repaired batches.
- Native render2560x1600; software render960x600 within2560x1600viewport. Software evidence is not a native-resolution claim.
- Current dry-route check:1379frames/106actual actor-tool mesh checks, zero intersections; maximum foot error2.42e-7. This does not close whole-level hazard/clearance gates.
- Installed develop-web-game client finalshot4/state4 ready/playing(0,8.84),960x540 inspected. InitialPreparing clicktimeout recovered with laterinput. No startup acceptance.

## Requirement acceptance and remaining scope

V31 acceptance asks for physical installed lamps with glass/cages/ceramic/wires/filaments/broken housings and internally structured light surfaces. Earlier work plus38 supplies the glass/cages/fittings/wiring;39 resolves the specific uniform-housing gap seen in38. All17fixtures now have local visual/physical evidence, so V31 is implemented. V32 remains in progress: clock consistency and ReducedMotion are proven, but crossing/attack readability through darkest phases requires encounter review. Local V31 acceptance does not close matchedLevel1, whole-route composition, accessibility or performance gates.

Ledger becomes25implemented/27in_progress/1pending; all53requirements/seven gates retained. No simulation, navigation, checkpoint, input, audio/banner or pursuit changes.

## Artifacts

Final evidence: output/under-green/visual-upgrade-local/pass39-final/{hardware,software},pass39-source,pass39-clearance,pass39-client,pass39-budget. Source hashes/snapshots cover one runtime module and three test tools. Server4187 and unrelated workspace changes retained.

## Isolated rendering samples

Native/software ran sequentially after other owned render jobs ended. Sixwarm frames then24alternatingGPU-fenced samples perview; CPU submission and polling overhead included. These are local comparisons, not a full performance acceptance.

| Renderer / view | Median before / after ms | P95 before / after ms |
|---|---|---|
| hardware / gallery-lamp | 7.5 / 9.1 | 11.3 / 12.3 |
| hardware / patched-lamp | 8.2 / 9.3 | 10.6 / 10.8 |
| software / gallery-lamp | 41.9 / 40.1 | 46.6 / 42.8 |
| software / patched-lamp | 43.2 / 44.9 | 49.4 / 49.1 |

Native medians increase1.1–1.6ms in this sample; software changes-1.8/+1.7ms. Draw/map/program counts stay equal and submitted geometry rises52/108triangles in the native views. The samples vary and include context/polling costs; do not claim zero rendering cost or general60fps. Full performance gate remains open. All owned pass39jobs terminal.
