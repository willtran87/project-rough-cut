# Under the Green — pump staging and low-cover perception

This pass advances review items 7, 12, 21, 23, 24, 35 and 44. It does not finish the 44-item goal. The previous goal turn refined the implementation brief; this turn recovered the earlier pump work and its saved evidence, verified it, and corrected low-console perception and portrait sign placement.

## Player-visible changes

- The pump control is at (-24, 40), facing west. The marked operating bay is (-25.7, 40), looking east toward the actual onward outlet. The pump machine moves to (-26, 43), clearing a freely chosen view toward the return channel.
- A low pedestal supports a red lever, grip, stop and latch. RETURN and RANGE gauge needles use the actual water states. The lever, diverter, valves and physical outflow change together; pausing freezes the mechanism and reload restores its operated state without replaying the pressure sequence.
- Pipework follows the authored control and machine positions. The overhead sign hangs farther along the onward pipe, with supports reaching a physical crossbar. This clears the portrait objective panel from the marked operating bay.
- The water HUD considers the actual horizontal field of view. An offscreen return channel no longer owns the water card while looking east. Being inside a channel still retains its warning. Optional pursuit/sound descriptions yield to an available interaction; urgent danger retains priority.
- The pump console no longer hides a standing player as if it were an infinitely tall wall. Perception samples the eye-to-eye segment against a conservative 1.48 m console silhouette. A crouched player behind the instruments remains hidden in the verified fixture; standing up restores sight. Existing movement, navigation and blade collision retain the full physical footprint.

The visibility correction is deliberately scoped: other cover retains its current policy. It does not establish exact per-triangle perception for every decorative prop or make every gap in the console transparent. The gate uses its actual descending clearance for the sight segment.

## Evidence

- `tools/verify-under-green-pump-staging.cjs`: real Use input at 2560×1600, 1280×720, 844×390 and 390×844. Checks rendered structural sightlines, current water/gauge state, intermediate and latched motion, unchanged camera orientation, pause and durable reload. Artifacts: `output/under-green/pump-staging/browser.json` and before/draining/after/return screenshots.
- `tools/verify-under-green-sight.mjs`: standing acquisition, crouched occlusion, no evidence updates from hidden movement, reacquisition on standing, masonry/room/gate occlusion, physical console collision and unchanged facing cone. Artifacts: `output/under-green/sight/rules.json`.
- `tools/verify-under-green-sight-browser.cjs`: actual C press/release and smooth eye-height change at the same four sizes. Simulation visibility agrees with rendered eye-ray obstruction for the tested standing/crouched/rising views. Artifacts: `output/under-green/sight/browser.json` and screenshots.
- Folded route, navigation, core simulation and clearance suites pass after the perception correction. Coverage includes 48 channel/phase navigation cases, 1,296 floor/heading placements and 11,569 observed live-Joe frames. These are bounded samples, not a proof of clearance in every possible pose.
- Rendered clearance includes 12 poses, adding west/east/north console approaches to the prior wall, bunker, pump and gate cases. See `output/under-green/clearance/rendered-geometry.json` for final results.
- Required standard-client runs produced ordinary-input gameplay states/screenshots in `output/under-green/sight/standard-client`; the inspected state retains 3.84 m/s walking, normal look and no water hit. This smoke test supplements the targeted pump/stance tests.

Earlier browser fixture maintenance replaced old hardcoded lever/gate coordinates with current layout data. The gamepad fixture connects neutrally before applying movement, honoring the shared rearming policy, and measures displacement independently of camera yaw. The sprint failure comparison uses the same route with and without deliberate sidesteps; it does not require a successful walking route to fail.

## Current route measurements

Phase-aware scripted pilots use ordinary simulation movement and explicit evasion inputs. They are not human completion times or evidence of enjoyment.

| Route | Time | Final Joe separation | Time within 10 m |
| --- | ---: | ---: | ---: |
| Full dry walk | 75.23 s | 14.78 m | 7.87 s |
| Full wet walk | 87.25 s | 12.88 m | 23.20 s |
| Sprint with evasions | 50.75 s | 22.86 m | 4.30 s |
| Optional record | 75.23 s | 12.83 m | 9.03 s |
| Checkpoint 1 | 51.23 s | 26.08 m | 0.00 s |
| Checkpoint 2 | 25.23 s | 22.73 m | 1.63 s |
| Checkpoint 3 | 20.23 s | 12.89 m | 4.28 s |

The full walking route's final gap increased from the earlier compact-range candidate after repositioning the control. This pass proves pump readability and functional routes; it does not claim improved pursuit pacing. Checkpoint 1 still needs substantial pacing work.

## Limits and remaining work

The onward outlet is approximately 31.8 m from the operating bay. The gauges reinforce its state, but first-time recognition of the distant effect and use of the marked bay need unfamiliar-player observation. The return outlet requires a voluntary turn. In the staged pump fixture Joe follows a legitimate alternate route; he is not teleported into a theatrical barrier reaction. No claim is made that every activation produces a visible Joe reaction.

Continue checkpoint-1 pacing, district/background/material composition, broader dynamic camera clearance, Level 1 canvas/controller and profile integration, representative-device performance, headphone listening and unfamiliar-player sessions. Preserve the shared movement profile, earned escapes and the remaining 44-item ledger scope.

Final visual pass: moving the sign initially exposed an occlusion by its vertical spindle. Shifted the sign and attached crossbar sideways; inspected the resulting high-resolution and compact views. Final rendered clearance passes all12 poses (14,697 sampled mesh vertices per pose), with no hits or browser errors. Final pump and required standard-client runs are terminal and passing; latest screenshot/state inspected.

Checkpoint-1 experiment: `tools/probe-under-green-checkpoint-one.mjs` compares five Joe restart positions across dry walk, wet walk and sprint (15 runs). The shipped checkpoint remains unchanged. Current dry retry never obtains visual contact; Joe follows the old approach across the spillway. Starting him at (0,71) acquires the player immediately but leaves him on the bunker route when return flow opens: final dry gap worsens from26.08m to52.72m. Other nearby starts have the same problem. Inspect the recorded arrival/route states in `output/under-green/checkpoint-one/spawn-experiment.json` before further pacing changes. This is experiment evidence, not an accepted redesign or proof that all restart configurations were explored.
