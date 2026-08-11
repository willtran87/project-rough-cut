# Collision-route handoff release polish — 2026-08-08

## Finding

The collision card and movement chevron correctly told the player how to clear a blocker, but the objective ribbon and its ground reflectors continued to own the pre-impact path. At the opening grounds cart and stone boundary this could make a player who trusted the world route repeatedly press into the same solid object. A staged-load-aware positive escape regression was also missing; the older short fixture stopped at the opening tutorial after asset loading was phased.

## Resolution

- Active collision contact now temporarily owns the navigation route.
- The authoritative escape instruction is converted into a clear 9–17 meter recovery waypoint using the same collision geometry as player movement.
- The world thread, reflectors, bearing panel, and text-state waypoint bend into that recovery lane together.
- Once contact clears, the temporary node remains authoritative through a bounded clear-lane follow-through. It retires only after the player reaches the recovery waypoint, the waypoint becomes invalid, or a 2.4-second safety timeout expires; the objective planner then resumes from the corrected position.
- Recovery completion now requires the player to come within 0.75 meters of the waypoint. Course-edge recovery nodes retain a 0.5-meter gutter, allowing the player to clear a blocker beside the boundary without prematurely turning back into its player-inflated footprint.
- Recovery ownership, obstacle, direction, count, and replan contract are exposed through `render_game_to_text`.
- Added `collision_guidance_handoff` to live readiness and guarded the feature in the static release verifier.
- Added `web/test-actions/release-hardening-collision-route-handoff.json`, including the staged course-load wait that the superseded short fixture lacked.

Player speed, collision footprints, objective positions, Joe awareness, pathing, detection, suspense cadence, and scoring are unchanged.

## Real traversal evidence

A live browser route using only ordinary keyboard input encountered both authored opening blockers:

- Grounds cart: route changed to a left recovery node, cleared contact, then replanned.
- Stone boundary: route changed to a left recovery node, cleared contact, then replanned.
- Audit Bell: reached and filed successfully; the guide advanced to Field Log.
- Browser/page errors: none.

The latest official staged-load fixture completed the opening contact and follow-through, then captured `current_is_nearest`, no active correction, the next clear Audit Bell waypoint, one retained recovery count, 19/19 readiness, an estimated 60 FPS, and no error artifact. Its measured gameplay render p95 was 6.0 ms with bounded transient pools.

## Visual verification

- 2560×1600 high resolution: grounded route remained below physical course art and clear of the HUD/map.
- 1280×720 desktop: collision release and objective route retained the same hierarchy.
- 390×844 coarse-pointer portrait: full 16:9 canvas remained centered with no clipped game content and the rotate-device prompt remained readable above it.
- Full-page PNG dimensions exactly matched all three viewports, confirming no vertical page expansion.

## Automated verification

- `node --check web/game.js`
- `node tools/verify-release.mjs`
- 48 referenced runtime images, 60.75 MB.
- Zero missing/unreferenced runtime images and zero shipped source masters.
- 78 valid action scenarios.
- 19/19 live readiness checks.
- Static coverage requires the collision recovery edge gutter and `clearance_followthrough` phase.

Physical keyboard/mouse, controller, touch-device, and sustained mid-tier hardware sessions remain release gates.
