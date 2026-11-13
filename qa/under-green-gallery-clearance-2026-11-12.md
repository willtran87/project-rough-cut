# Under the Green — moving actor and camera clearance

This pass advances review items 19, 23, 30 and 41. The prior service-grate pass made implementation progress. The full 44-item objective remains active.

## Reproduced defect and change

The standard dry/wet routes and checkpoint-three route initially passed the existing actor/scenery inspection. Expanding to other pressures and pacing found a decorative golf ball intersecting Joe's boot at the spillway: three mesh-point contacts at 28.3 seconds on Steady, and 41 at 35.3667 seconds on the hesitation route. These failures are retained in `output/under-green/moving-clearance-extended/moving-clearance.json`.

The 18 gallery balls previously used a constant ±2.3 m lateral placement. They now sit 0.18 m inward from the actual connected floor boundary at their location. If machinery occupies that edge, placement tries the opposite edge; if neither is clear it omits the decoration. The current map retains all 18. This also avoids placing a relocated ball inside the pump machine, caught by the first placement check. No collision, navigation, water schedule or player/enemy movement changed.

The actor inspector now includes visible signs, pipe valves, the record display and the entry barrier in addition to existing scenery and mechanisms. Hidden descendants are excluded using visible traversal. Near-floor foot clearance remains a separate sole-height check; the mesh/scenery test excludes points below 3.5 cm to avoid treating ordinary floor contact as penetration.

## Faster checker with the same narrow-phase test

The exhaustive sphere/triangle checker was spending substantial time scanning large material batches. A conservative spatial grid now selects candidate triangle AABBs. The original exact triangle closest-point test and ordering remain unchanged. Oversized or nonfinite queries/triangle bounds fall back to exhaustive candidates rather than dropping geometry. Grid data is local to a call, so transforms and geometry changes cannot leave stale cached triangles.

The frozen pre-change exhaustive function is retained in `tools/fixtures/geometry-clearance-exhaustive.js`. Exact hit-array parity passes 15,096 probes across indexed and nonindexed geometry, transformed parents, geometry/visibility changes, cell boundaries and very large/nonfinite query radii. The synthetic samples take roughly 42–65 ms with the grid versus 201–410 ms with the exhaustive scan. This is a QA speed improvement, not an in-game FPS claim. The existing 11 camera/geometry unit checks also pass.

The first long exhaustive route job was confirmed live, then explicitly cancelled and replaced after parity verification. It was not assumed dead because an observation yielded no output.

## Verification scope

The final verification covers nine completed simulation routes: ordinary dry, wet, checkpoint three, sprint, Steady, Relentless, optional record, checkpoint one with witnessed bunker-route memory, and observation pauses. Actor hand/foot placement is examined at 20 Hz. Mesh/scenery clearance is sampled once a second and at phase changes. Close passes and partial gate closure additionally test near-camera volumes at standing/crouched heights, forward/rear orientations, FOV 45/85 and desktop/portrait aspects.

The two original defect poses are replayed with preceding animation frames and inspected at 2560×1600, 1280×720, 844×390 and 390×844. All eight views pass mesh/scenery and below-floor checks. Their screenshots were inspected. These are deliberately repositioned QA views of the original actor motion, not evidence of normal-route framing or player comprehension.

The installed game client passes after final runtime changes; latest screenshot/state inspected, with released movement stopped and normal vertical look preserved. All current gallery-ball bounds pass walkable-space and obstacle checks.

Final route totals and terminal results are recorded in `output/under-green/gallery-clearance/summary.json` after both complete-route jobs finish. Pre-final route passes are retained separately and do not substitute for those final-source results.

## Limits

Sampled clearance is not a proof for every possible player/enemy configuration or for between-sample intersections. The user-facing pursuit, perception and route behavior are unchanged by this decorative placement fix. Broad dynamic clearance, human tension/comprehension/listening, physical devices and final-build sustained performance remain open. No full-chapter completion or new performance qualification is claimed.
