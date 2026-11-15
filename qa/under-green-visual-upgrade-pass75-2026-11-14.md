# Pass 75 - reduce hidden bank geometry while preserving the art

Previous goal turn: no implementation progress. The review refreshed district captures and the checklist but made no runtime change. This pass resumes the pass74 software regression without shrinking the full53 requirements,48 refinements or seven pending gates.

## Retained implementation

- `web/under-green-bunker-bank-face.js` simplifies only the buried planar backs of the closed bank faces. Seam-following strips and end fans preserve every perimeter vertex. Positions, UVs and original normals remain byte-identical. The bank falls from17,464 to12,804triangles (4,660 fewer,26.7%);66parts/8,864vertices remain. Front contours, side caps and soil/sand art are unchanged.
- New `web/under-green-bank-backing.js` trims only corridor-facing original box planes proven strictly inside the new closed bank volumes. The plane must lie between the bank's back and minimum front depth with1mm safety margins; its complete triangle must fall within the corresponding retaining edge. Four disjoint outside strips preserve2cm overlap around the entire perimeter. Original back/end/cap surfaces remain. All original vertex attributes remain, preserving conservative lighting and culling bounds; clipped vertices are interpolated on the original plane.
- `web/under-green-scene.js` marks only original soil/sand/bankEarth boxes for this trimming and applies it after the bank faces exist, before the existing batching. There are no new meshes, materials, textures, lamps, colliders, shader branches or rendering passes. Gameplay rules and controls are unchanged.

## Diagnosis and rejected experiments

`tools/profile-under-green-bank-work.cjs` records the original flat bank and pass74 bank. The affected soil/sand batches retain4,5 or8 practical sources; the added contours did not increase their lamp counts. The profile confirms added geometry over existing backing, but does not establish overlap as the only performance cause.

An early bank depth pass preserved14native image pairs but increased software medians: corridor146.3 to148.2ms, close bank86.7 to88.4ms, main198.0 to199.3ms. Removed.

A software fragment-distance lighting guard preserved41 scene/actor/ghost/interaction comparisons with only isolated one-level color rounding, but worsened paired software timings:232.5 to255.4ms,137.1 to160.0ms,299.0 to340.4ms. Removed. The practical-lighting source is restored byte-for-byte; its experimental tools are archived under the output/source directory. Those experimental tests are not evidence for the final retained implementation.

The back-topology change alone was effectively neutral in a timing preview. Do not attribute a speedup merely to its lower triangle count.

An initial backing trim retained overlap only at the horizontal boundaries. It changed two native pixels (maximum RGB delta9) in the north-shoring view and three pixels in a software landscape view (maximum delta6). Those strict comparisons failed. Widening only the horizontal overlap did not fix the native seam; keeping overlap on all four sides restored all14native preview pairs exactly. This correction is retained.

## Verification

Artifacts: `output/under-green/visual-pass75/`.

- `verify-under-green-bank-topology.mjs`: all22edges/66parts pass finite-attribute, intrusion/height, ordered-seam, front-orientation, closed-manifold and consistent-winding checks. Every position, normal and UV equals the pass74 snapshot.
- `verify-under-green-bank-backing.mjs`:66box cases across22edges;34,056normal and oblique rays preserve the nearest visible surface and enclosure. Includes standing/crouched eye heights, close/distant approaches and nearly end-on views. Original vertex attributes and bounds are exact. Additional faces in front of or behind the closed bank volume remain untouched.
- Final native40084 and software32557 both terminate successfully with46views each (23matched pairs). Every raw framebuffer SHA-256 and screenshot is exact. Includes14bank/control fixtures,1280x720,390x844 and844x390 views, Q rear, crouch and reduced motion. Each renderer passes4,536legal camera poses with zero intersections and six exterior sentinel probes with zero leakage after a visible positive control. Camera return and pause remain valid. The non-bank geometry fingerprint matches exactly (286,566native/211,834software triangles; the exclusion encompasses the original bank boxes as well as their dressing). Existing shoring/coping/deposit/repair counts are unchanged. Zero recorded errors.
- Retained backing trim affects42original box parts:84large face triangles are replaced by400narrow perimeter triangles. Combined with the simpler backs, total full-scene geometry falls by4,344triangles. Draw, program and texture counts remain unchanged in all paired views. The purpose of the trim is to remove covered raster area while preserving the original perimeter, not to minimize the number of border triangles.
- Native actual resolutions:2560x1600,1280x720,390x844,844x390. Software:960x600,960x540,390x844,844x390. Large software screenshots are upscaled scenes, not native2560detail.
- Installed web-game client8943 terminates successfully after eight bursts. The initial disabled Preparing click times out, then later Enter bursts recover. Final state: ready/playing, checkpoint0, elapsed1.5333s, player(0,10.12), actual960x540. No error artifact. Final state/image inspected; controlled district tests provide coverage beyond this entrance input check.
- Final native north-shoring, software compact landscape and ordinary-input images were opened and inspected, alongside earlier corridor/portrait/close-bank evidence. The final comparisons preserve the exact art, not the failed preview seams. The practical-lighting source is byte-identical to its original snapshot.
- Earlier topology-only native92679/software62758 pass46views each (23matched pairs),4,536camera poses each and six opacity probes each, with exact framebuffer hashes and screenshots. Those establish the topology change; the final combined backing change still requires the final suite above.

## Cost and remaining work

The first backing-trim preview had mixed local software results: corridor220.3 to209.2ms, close bank130.2 to133.8ms, main268.2 to251.4ms. It predates the full perimeter overlap and is historical experiment evidence only.

All owned visual/client jobs were confirmed terminal before sequential final GPU-fenced timing. Native4637 and software77094 both terminate successfully. Each fixture has six warm pairs followed by24alternating samples per variant. The baseline routes the saved pass74 bank-face and scene sources; the candidate uses the final retained build.

| Fixture | Native baseline / final median | Software baseline / final median |
|---|---:|---:|
| Corridor |12.5 /12.3ms |146.9 /141.5ms |
| Close bank |9.4 /8.4ms |88.4 /88.9ms |
| Main route |15.4 /15.4ms |190.8 /181.4ms |

The software corridor/main-route reductions are5.4ms (3.7%) and9.4ms (4.9%); the close-bank result is effectively unchanged. This recovers some local cost, not the entire pass74 regression and not the whole-level performance target. These are controlled GPU-completed diagnostics, not five-minute ordinary-input pacing acceptance. Absolute software cost remains poor.

The initial final-timing inventory command returned no matching jobs and produced no file through its empty pipeline. A subsequent explicit-array inventory, `timing-processes-retained-software.json`, records only the owned software timing verifier. The post-run inventory contains two Level1 hedge visual jobs, so late shared-host contention cannot be excluded. Earlier experiments also ran alongside other chapter jobs; their times should not be compared directly across runs. Nine final runtime/tool snapshots are byte- and SHA-256-verified against current sources. All owned jobs are terminal. No requirement status or whole-level gate is promoted.

The complete visual overhaul remains active. Next requirements include full gallery composition, range framing, keeper counter/room integration, water and actor motion, current matched Level1 comparisons and all seven release gates. These optimizations do not complete an art category or qualify ordinary-frame performance.
