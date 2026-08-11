# Status Request spatial-consequence polish — 2026-08-09

## Finding

- The previous consequence-continuity pass preserved whether Joe was verifying a rough shared grid or an escalated sector, but the location itself remained substantially map-dependent.
- Once the originating target passed behind the fixed forward camera, the first-person scene no longer showed the affected area or how far the player had moved beyond it.
- This made the consequence narratively clear but spatially weak: the player could not confidently react to the choice using only the course view.

## Refinement

- Added a shared presentation model for the existing Status Request investigation and follow-up search target.
- An acknowledged request projects a broad mint dashed grid with a 14-meter radius; escalation projects a tight danger-orange solid sector and crosshair with an 8-meter radius.
- World and map labels now report `VACATE ROUGH GRID`, `BREAK SECTOR`, or the corresponding `OUTSIDE` state with truthful distance to the area's edge.
- When the consequence point lies behind the fixed forward camera, a compact cue above the existing action rail identifies the rough grid or escalated sector, reports the same inside/outside edge distance, and points behind the player.
- The footprint renders beneath physical entities, so hedges, carts, station art, Joe, and other authored assets remain solid. Collision recovery, footing escape, objectives, interactions, and the bottom action rail retain their existing signal ownership.
- Request timing, response timing, Joe AI and pathing, search precision, detection, movement, scoring, objectives, collision, and input are unchanged.

## Verification

- `status_request_spatial_consequence_continuity` raises release readiness to 34/34. It verifies both radii, visual shapes, inside/outside edge math, the investigation-to-search target handoff, rear-cue hierarchy, Reduced Camera Motion behavior, and the presentation-only gameplay contract.
- A temporary visual fixture invoked the production acknowledged/escalated resolvers, used the normal Joe update to enter search, and then used real ArrowUp input to cross the rough-grid boundary. The fixture and its release-code hook were removed immediately after capture.
- The acknowledged state progressed from `VACATE ROUGH GRID // 9m` inside the area to `OUTSIDE ROUGH GRID // 24m`; the rear cue mirrored `ROUGH STATUS GRID BEHIND // 24m OUTSIDE` while Joe continued `SWEEPING ROUGH STATUS GRID` at the same target.
- The escalated search displayed the tighter `BREAK SECTOR // 8m` footprint and `SWEEPING ESCALATED SECTOR` identity without creating a competing rear cue while the target was visible.
- Direct screenshot inspection passed at 2560x1600, 1280x720, and 800x600. All documents exactly matched their viewports; the rear cue remained above the action rail; and no objective, map, Joe Attention, course art, or interaction lane was clipped or obscured.
- The official normal-input gameplay client reached live Hole 1 with all 48 assets settled, readiness 34/34, 60 estimated FPS, 2.48 ms average render work, 4.5 ms p95, 28.3 ms observed max, one long render frame, and no page or console errors.
- Final static release verification passed 48 runtime assets and all 81 deterministic action scenarios with zero warnings or failures.
- No new ImageGen asset was needed because this pass communicates dynamic search geometry over the existing generated environment rather than introducing a new physical game object.

## Evidence

- `output/status-request-spatial-ack-inside-1280x720-2026-08-09.png`
- `output/status-request-spatial-ack-outside-2560x1600-2026-08-09.png`
- `output/status-request-spatial-ack-outside-1280x720-2026-08-09.png`
- `output/status-request-spatial-ack-outside-800x600-2026-08-09.png`
- `output/status-request-spatial-escalation-1280x720-2026-08-09.png`
- `output/status-request-spatial-official-2026-08-09/shot-0.png`
- `output/status-request-spatial-official-2026-08-09/state-0.json`

## Cleanup

- The temporary resolver hook, browser fixture, state dump, and rejected screenshots were removed.
- The isolated local server on port 4196 was stopped after verification.
