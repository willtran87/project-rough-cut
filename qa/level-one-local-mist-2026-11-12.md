# Level 1 localized low mist — November 12, 2026

Partial V4/Z3/Z8/V8 delivery. Full Level1 goal and all original/later scope lists
remain active; this does not establish whole-level visual or emotional acceptance.

## Runtime

- New course-mist-field.js describes moisture near authored ponds and the drain,
  plus the woodland edge. Smooth region weights keep the central dry fairway clear.
- Existing pixel-effects mist pool remains bounded at24hardware/10software slots.
  Pond and drain wisps receive priority; the remaining grid candidates require
  suitable habitat and avoid authored solid footprints. No new draw batch, texture,
  mesh or pool capacity. One float per existing instance supplies opacity fade.
- Low banks face the camera position horizontally. Looking up/down no longer tilts
  those banks through the ground. Near-camera and outer-range fades avoid abrupt
  boundaries. Pond/drain banks sit around.18-.30m; woodland wisps follow terrain.
- Existing mower wake, cold breath, special scares, zone palette and opacity remain;
  their emitter defaults to full instance fade. Rendering does not modify AI,
  perception, collisions, objectives or navigation. Normal world depth testing stays.
- Scene passes the actual drain anchor. Scene/module cache versions updated.

## Verification

`node tools/test-course-mist-field.mjs` passes: wet centers/woodland weights, clear
fairway, bounds, smooth region continuity and near/far camera fades.

`node tools/verify-course-local-mist.cjs` hardware39261 terminal0, four groups.
Software60480 terminal0, four groups, with the initial portrait target warmed before
resource stability comparison. Both have zero browser errors. Legal viewpoints:
pond(-63,187), drain(-78,670), woodland(50,365). Screens2560x1600,1280x720,844x390,
390x844. Inspected actual high-resolution pond/drain/woodland, ordinary drain and
software portrait pond images, including mist-disabled comparisons.

| View | Hardware changed pixels | Software changed pixels |
|---|---:|---:|
| Pond | 18794 of921600 | 10312 of518400 |
| Drain | 14591 of921600 | 7594 of518400 |
| Woodland | 1727 of921600 | 963 of518400 |

These compare the actual framebuffer with only mist opacity disabled. They prove
visible contributions in these views, not subjective fear or a performance gain.
Pond instance transforms remain upright and identical when looking up. Pause and
Reduced Motion freeze drift; resuming normal time moves it. Zero decorative density
removes mist. Resource counts remain stable across warmed viewport changes.

`node tools/verify-pixel-effects.cjs --out=output/course-local-mist/effects-regression`
hardware63942 terminal0,17checks,noerrors. Existing turf/mower cues, rendering
purity, ghost motion/anchors, comfort, pause, decorative-density controls, saved
trail, floodlight haze, prepared shaders, responsive feedback, scene replacement,
actual ghost/wall occlusion and body deformation all pass.

Installed client85181 terminal0, two ordinary arrival bursts:
`node tools/verify-presented-client.mjs --level-one --url http://127.0.0.1:4187 --actions-file tools/fixtures/course-arrival-input.json --iterations 2 --pause-ms 250 --screenshot-dir output/course-local-mist/standard-client`
Latest screenshot/state inspected: first_hole,tee,Joe patrol,noerrorfiles.
Readiness56/57; only gameplay_frame_budget fails. Syntax checks passed.

## Investigated failures

- Initial woodland camera(50,340) sat in the clubhouse stone cover and produced no
  visible mist. Added collision validation and used the nearby legal365 viewpoint.
  No runtime opacity increase or depth-test bypass was used to force visibility.
- Initial software check expected106textures after first portrait rendering, but
  observed107. Source shows customTarget is a separate cloned render target on
  software, allocated on first portrait use. Instrumented its WebGL initialization,
  warmed it, and retained strict stability afterward. No mist texture was added.
- Older effects regression used ambiguous canvas selector and expected a ghost
  beside real Joe. Updated selector to #game. It now explicitly verifies the
  real_joe suppression policy, moves Joe far away, then tests the apparition.
  Runtime scheduling policy and original assertions remain intact.

All owned processes terminal; server4187 retained. No agents,commit or deployment.
Next priorities include measured full-route frame budgets, broader composition and
model parity, and human first-play/fear/listening/physical-device acceptance.
