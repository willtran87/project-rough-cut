# Back Nine experience pass36 — manual shortcut gates

The full38-item goal remains active. User-confirmed death policy is a whole-level restart from the shed, with fresh cart/objectives/reserves and the same course seed. No relay checkpoint restoration. Human tests remain prepared for later.

## Changes

Three existing timber shortcut gates now support a deliberate hold-to-unlatch choice. Stop near either face and hold the normal Use/brake input for1.1s; releasing early cancels progress. Once unlatched, the gate swings away over0.8s. Joe keeps moving throughout. Open gates persist until the attempt resets. Existing timber pieces provide the animation; small opaque metal handles reuse existing materials/batches. No new lights or textures.

Collision follows the actual swinging leaf. The swing waits when it would overlap either actor, rather than pushing them. An already overlapping actor may move out instead of being trapped. Only Joe destroys the timber. Player collision cannot break it. Landing selection rejects occupied gate footprints, while airborne trajectories may clear low rails. One loose hurdle beside the range approach moved2.5m onto the shoulder to clear the approach.

The nearby interaction prompt gives hold progress and obstruction guidance. An optional sound description accompanies a quiet latch/hinge cue using an existing noise voice. The cue yields to a simultaneous ram warning/release. No ordinary engine-event chatter or bells were added. Physical gate motion remains identical under comfort settings.

## Verification

Artifacts: `output/back-nine-experience/manual-gates/`.

- Pure gate suite:24 crossings covering three gates, both player forms, both directions and15/60Hz;126 geometry poses;30 landing cases; cancellation, blocked swing/resume, Joe contact and overlap recovery.72 existing timber pieces retained; settled updates upload no matrices, resetting three changed gates uploads18.
- Hardware and software browser suites: eight views each at2560x1600,1280x720,844x390,390x844. Real E/Space/W, pause/input clearing, quiet cue, simultaneous ram priority, optional descriptions, comfort and reset pass with no browser errors. Final screenshots inspected, including high-resolution swing, live range encounter and portrait prompt. Portrait remains a small letterboxed playfield; this pass does not improve that composition.
- Final browser resources remain constant within each run:1930 uploads,45 textures,14 voices and72 timber pieces;23 hardware/29 software programs. These totals include concurrent course/terrain/ghost work and are not a gate-only before/after comparison.
- Actual gamepad-driven range encounter earns a real windup, charge and miss. Gate choice reaches the reconnection at9.87s; the tested outer bend is caught at9.42s. Both renderers pass without injecting an attack state or granting invulnerability. This demonstrates one situational benefit, not that every gate is always safer or faster.
- Full ordinary driving route completes with21 cart health after ten hits, both relays and optional repair. No forced damage or immunity. This capture predates the latest unrelated course-detail additions; it is not a fresh complete-route audit of those additions.
- Installed standard client uses supported Space/up inputs, opens and traverses the gate, then Joe physically breaks it. Final screenshot/state inspected. An earlier diagnostic mistakenly used unsupported literal `e`; it was corrected and the final client rerun passed.
- Existing ejection regression passes6720 arrangements/13440 path segments with no missing placements or crossings. Updated its stale historical navigation hash assertion to verify that the current baked signature stays unchanged during the test.
- Twelve real warm retries across keyboard/menu controls pass: fresh shed start, health/objectives/reserves and all gates reset, no repeated intro or asset/scene/audio recreation. Hardware samples21–65ms; software57–147ms. Different shared-build revisions mean these are individual observations, not a paired speed comparison.
- Current eight-contract terror/destruction regression passes. Its owner corrected the older flat-ground debris assertion for current terrain; no broad runtime rollback was made. Syntax checks pass for all nine gate-related runtime modules.

## Limits and remaining scope

Early pursuit probes show that stopping too soon can cost health or be fatal; a fast bypass can be better. Diagnostic injected-miss and invalid line-of-sight fixtures are not acceptance evidence for all districts. Human recognition, timing and route preference remain to be tested later.

No software frame-time improvement is claimed. This pass proves bounded gate-state allocations and warm-retry reuse, not resolution of foliage/mower spikes or cold startup stalls. Concurrent terrain, irrigation, ghosts and detail additions were preserved; their resource changes are not attributed to the gates.

Item13 is now technically accepted. Ledger:22 implemented/technically verified,15 in progress,1 prepared human-playtest package. All38 remain in scope; the goal is not complete. All owned verification jobs exited successfully; existing local server4187 remains running.
