# Level 1 hedge growth — 2026-11-14

Local V04/V06 progress within the full 35-item/V01–V21 upgrade. Fresh close views identified oversized round decorative lumps on the 23 cover hedges. These were especially crude beside the existing detailed pixel-leaf texture. They have been replaced with attached terminal shoots and smaller pointed leaves. No whole-level artistic acceptance is implied.

## Construction and iteration

`course-hedge-growth.js` constructs closed stems and folded six-outline leaves in eight angular sectors per hedge, merged by the existing static batching path. Two irregular height bands and crown shoots use deterministic seed variation. All23hedges contain1,080shoots/6,480leaves;58,320sourcevertices/86,400triangles. The former32spherical decorations per hedge used47,104triangles, so total source geometry increases39,296triangles.

The original opaque lathe body, its material, shared collision/ball-flight profile and conservative software occluder are untouched. New foliage fits within99.7% of the existing horizontal ellipse. Crown roots follow the sloping profile. Existing leaf artwork, source lighting, habitat colours and nearest pixel sampling are reused. No texture, light, emissive layer or collider was added. Sky changes from the prior pass remain.

Initial broad diamond leaves looked too large; final leaves are narrower, pointed six-outline forms. Geometry checks then caught crown roots above the sloping core, reversed stem faces, and thin leaves folded by per-vertex footprint clamping. Final construction follows the actual crown and applies one affine fit to each connected shoot, preserving attachment and outward faces. Invalid candidates are not accepted by the final evidence.

Inspected final native range side, normal approaches, audit west, phone and both installed-client page1captures. Silhouettes lose the large spherical bumps and retain a clipped hedge mass with sparse shoots. Unlit fronts remain very dark; broad dark-scene separation and richer hedge material variation remain open. These shoots are static, as the replaced decorations were; this pass does not accept environmental-motion requirements.

## Verification

- `node tools/verify-course-hedge-growth.mjs`: all23actual sizes/seeds, deterministic arrays, finite unit normals, horizontal footprint/height limits, closed surfaces, opposite edge winding and positive signed volume of every leaf/stem. All1,080stem roots are inside the actual32-sided core, not merely inside its bounding ellipse.
- `node tools/test-course-cover-flight.mjs`: low/high clearance, nearest cover, misses, narrow cover, shared profiles, rebound and reachable endpoint;5,025clearance samples pass.
- `node tools/verify-course-hedge-growth.cjs`, with `--before`/`--software`:45views each, including all23hedges, close/normal side approaches, route controls,2560×1600/1280×720/390×844, walking/pause/12warmturns/rebuild. Finalnative9273/software1939 and baseline89498/50260 exit0, no browser errors.
- All90matched pairs preserve recorded objects/hulls, obstacles, lights,28symmetric lanterns, software occluders, camera/resolution and exact position/normal/index arrays of23opaque hedge cores. All45baseline and45final software views match the full geometry reference byte-for-byte and restore exactly.
- Installed develop-web-game client via `verify-presented-client.mjs --level-one --hedge-growth`: finalnative46302/software77295 exit0, two forward/lateral input bursts at the actual range hedge. Both stay in first_hole: x7/progress554→x12/progress557; clearance5.9→4.4. Actualnative2492×1402/software800×450. Page captures and state files inspected; no error artifacts. An earlier water-area smoke test also passed, but the hedge fixture is the relevant final client evidence.

## Rendering cost and scope

Matched native submissions change by−1to0draws and0to33,408triangles; software by−1to+1draws and0to12,528triangles. Warm native geometry resources1017→1018, software782→782; textures114 and programs109native/120software unchanged. Warm resources remain stable during checked turns. Added geometric detail is not a free performance improvement.

Artifacts: `output/level-one-hedge-growth/`, including baseline source, initial survey, before/final images/reports, geometry.json and comparison.json. Full pixel-density, vegetation hierarchy, whole-route composition, actor/motion and software-performance acceptance remain open.

## Sequential timing

Process32216 exited0 after all owned functional/client browsers finished. Three positions,12warmframes and three groups of12samples, including presentation and a one-pixel GPU readback. Median of group medians, milliseconds:

| Renderer | View | Before | After |
|---|---|---:|---:|
| native | hedge | 6.6 | 6.5 |
| native | opening | 9.0 | 8.0 |
| native | approach | 6.9 | 7.4 |
| software | hedge | 99.6 | 119.5 |
| software | opening | 88.3 | 97.1 |
| software | approach | 111.7 | 87.7 |

Native results are similar with a0.5ms approach increase; software increases19.9ms at the hedge and8.8ms at opening while the approach decreases24ms. Mixed results are not evidence of a speedup or performance neutrality. The software frame-rate requirement remains unmet and added geometric cost is an open limitation. Nine source files and SHA256 hashes are saved under verified-source.
