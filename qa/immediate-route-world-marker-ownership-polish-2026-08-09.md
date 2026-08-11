# Immediate-route world-marker ownership polish — 2026-08-09

## Finding

- The complete Audit Bell-to-Water Hazard replay reached Irrigation Mud with the correct `CLEAR LEFT` instruction, amber bypass, and grounded `MUD EXIT`.
- The unrelated optional `SHED KEY // 57m` plaque remained in the same left-hand scene lane. It visually appeared to reinforce the urgent escape direction even though it was a different long-horizon destination.
- The objective route itself already yielded correctly; the remaining conflict was the independently rendered family of key, valve, exit, and mandatory-objective plaques.

## Refinement

- Added one shared presentation owner for active collision recovery, slow-footing escape, and mandatory station breakaway.
- While that short-horizon owner exists, distant navigation plaques for the shed key, drain valve, exits, and mandatory objectives use `long_horizon_marker_deferred` with zero marker alpha.
- Generated physical props and their exact interaction footprints remain rendered. This preserves spatial grounding and discoverability without presenting the prop as a competing destination.
- An interactable inside its authoritative use radius always overrides suppression, preserving the existing prompt owner and binding behavior.
- Clearing the local route removes suppression atomically; the selected objective returns at full emphasis and optional alternatives return at their ordinary restrained emphasis.
- Navigation targets, route planning, collision, AI, Joe pressure, movement cost, objectives, scoring, timing, interaction radii, and input are unchanged.

## Verification

- `immediate_route_world_marker_ownership` raises readiness to 35/35. It checks a distant optional marker, the distant selected objective, an in-reach interaction override, physical-art/use-footprint retention, and ordinary restoration after the local owner clears.
- The original 1,298-frame route ended at `(22, 223)` in Irrigation Mud. The active owner was `footing_hazard_escape`; Shed Key and Field Log both exported `long_horizon_marker_deferred`, marker alpha `0`, and `footing_hazard_escape:footing-exit:pond-mud` as the deferral owner. The generated key art and use footprint remained retained.
- Direct screenshot comparison removed `SHED KEY // 57m` while preserving the amber player-origin path, `MUD EXIT`, Joe's physical silhouette, Joe Attention, course map, objective dossier, generated course art, and bottom escape lesson.
- `web/test-actions/immediate-route-marker-handoff.json` extends the same native route with a real 180-frame left escape. It reached `(-24, 223)` on fairway at full pace, retired the immediate owner, restored Field Log as `selected_route` at alpha `1`, and restored Shed Key as `alternate_route` at alpha `0.72`.
- The opening collision-recovery regression retained `GROUNDS CART CLEAR` as the sole near-field route and exported both Shed Key and Audit Bell as deferred by `collision_recovery:collision-clear:service-cart`. It passed 35/35 at 60 FPS, 2.30 ms average render work, 4.1 ms p95, and 29.7 ms observed max.
- The Audit Bell field-signal regression retained `BREAK SIGNAL`, the station signal footprint, and the authored hedge route while Shed Key and Field Log yielded to `mandatory_noise_breakaway:field-signal-break-audit-bell`. It passed 35/35 at 60 FPS, 3.54 ms average, 4.7 ms p95, and 30.4 ms observed max.
- The active run held 60 estimated FPS at 2.71 ms average render work, 4.7 ms p95, and 30.4 ms observed max with one long frame. The restored run held 60 FPS at 2.49 ms average, 3.5 ms p95, and 30.7 ms observed max. Neither produced a browser-error artifact.
- Visual inspection passed at 2560x1600, 1280x720, and 800x600. Canvas, stage, and document stayed exactly within each viewport; no marker, route, HUD panel, action rail, or map element clipped or overlapped.
- Final release verification passed 48 runtime assets and all 82 deterministic action scenarios with zero warnings or failures.
- No new ImageGen asset was needed because this pass preserves the existing generated objects and clarifies their presentation priority rather than introducing another physical object.

## Evidence

- `output/goal-refinement-deep-audit-live-2026-08-09/shot-0.png` (before)
- `output/immediate-route-marker-ownership-official-2026-08-09/shot-0.png` (active after)
- `output/immediate-route-marker-ownership-official-2026-08-09/state-0.json`
- `output/immediate-route-marker-handoff-official-2026-08-09/shot-0.png` (restored after clearance)
- `output/immediate-route-marker-handoff-official-2026-08-09/state-0.json`
- `output/immediate-route-marker-responsive-2026-08-09/active-2560x1600.png`
- `output/immediate-route-marker-responsive-2026-08-09/active-1280x720.png`
- `output/immediate-route-marker-responsive-2026-08-09/active-800x600.png`
- `output/immediate-route-marker-responsive-2026-08-09/layout.json`
- `output/immediate-route-marker-collision-regression-2026-08-09/shot-0.png`
- `output/immediate-route-marker-collision-regression-2026-08-09/state-0.json`
- `output/immediate-route-marker-breakaway-regression-2026-08-09/shot-0.png`
- `output/immediate-route-marker-breakaway-regression-2026-08-09/state-0.json`

## Cleanup

- The responsive browser harness, invalid directory-index capture, and temporary diagnostics were removed after verification.
- The isolated local server on port 4197 was stopped after verification.
