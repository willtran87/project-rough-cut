# Pause immediate-route action continuity — 2026-08-09

## Finding

- Pausing during opening grounds-cart recovery froze the correct local route in the world and course map, but the modal replaced it with the distant `FOLLOW LANTERNS // AUDIT BELL 125m` objective.
- The same mismatch could occur in paused Settings, forcing the player to remember a different instruction than the one they needed immediately after resuming.

## Refinement

- Added one shared immediate-action presentation for collision clearance and active slow-footing escape.
- Collision recovery now owns the live dossier, pause modal, paused Settings context, and text diagnostics with the exact clearance direction, landmark, and distance until the bounded route clears.
- Active slow footing uses the same consumers for its latched material-specific exit. The preserved long-horizon objective remains visible as the active file and resumes automatically on full-speed ground.
- Mandatory station breakaway keeps its existing higher-priority action state. Interaction rejection, filing, input, simulation freeze, navigation, collision, movement, Joe AI, scoring, and timing are unchanged.

## Verification

- Added `pause_immediate_route_action_continuity`, bringing readiness to 36/36. It verifies collision recovery, footing escape, preserved objectives, ordinary-state retirement, all four presentation consumers, and the local-to-long-horizon handoff rule.
- Added `web/test-actions/pause-immediate-route-continuity.json` for the deterministic collision-to-pause route.
- The official collision pause reported `CLEAR LEFT // GROUNDS CART CLEAR 7m`, `collision_recovery`, and preserved `AUDIT BELL`; the frozen course map showed the same local decision. It held 60 estimated FPS at 3.10 ms average render work, 5.3 ms p95, and 29.3 ms observed max with no browser errors.
- Pointer resume returned to `first_hole`, cleared the pause snapshot, retained the collision route, and recorded one explicit resume at 60 FPS, 2.56 ms average, 4.9 ms p95, and 29.8 ms observed max.
- The official Irrigation Mud pause reported `CLEAR LEFT // MUD EXIT 27m`, `footing_hazard_escape`, and preserved `FIELD LOG`; the modal and frozen map agreed. It held 60 FPS at 3.07 ms average and 6.2 ms p95 with no browser errors.
- Responsive inspection passed at 2560x1600, 1280x720, and 800x600. The modal remained contained, the immediate instruction stayed readable, and document and canvas dimensions stayed within every viewport.
- Paused Settings repeated `PAUSED FILE // FIELD CHECKS 0/3 // AUDIT BELL · NEXT // CLEAR LEFT // GROUNDS CART CLEAR 7m` without clipping or overlapping its controls.
- The responsive run ended at 60 FPS with 3.74 ms average render work, 6.9 ms p95, 39.3 ms observed max, one long frame, 48/48 settled assets, readiness 36/36, and no browser-error artifact.
- No new ImageGen asset was needed: this pass preserves the existing generated cart, terrain, and course art while making every frozen instruction agree with the visible short-horizon route.

## Evidence

- `output/pause-immediate-route-audit-before-2026-08-09/shot-0.png` (before)
- `output/pause-immediate-route-collision-after-2026-08-09/shot-0.png`
- `output/pause-immediate-route-collision-after-2026-08-09/state-0.json`
- `output/pause-immediate-route-resume-2026-08-09/shot-0.png`
- `output/pause-immediate-route-resume-2026-08-09/state-0.json`
- `output/pause-immediate-route-footing-after-2026-08-09/shot-0.png`
- `output/pause-immediate-route-footing-after-2026-08-09/state-0.json`
- `output/pause-immediate-route-responsive-2026-08-09/pause-2560x1600.png`
- `output/pause-immediate-route-responsive-2026-08-09/pause-1280x720.png`
- `output/pause-immediate-route-responsive-2026-08-09/pause-800x600.png`
- `output/pause-immediate-route-responsive-2026-08-09/paused-settings-1280x720.png`
- `output/pause-immediate-route-responsive-2026-08-09/layout.json`
- `output/pause-immediate-route-responsive-2026-08-09/state.json`

## Cleanup

- Temporary action files and the responsive browser harness were removed after verification.
- The isolated local server on port 4198 was stopped after verification.
