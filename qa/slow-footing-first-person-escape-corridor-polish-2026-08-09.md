# Slow-footing first-person escape corridor polish — 2026-08-09

## Finding

The immediate-route owner correctly resolved map and bearing contradictions, but the settled Irrigation Mud screenshot still made the player depend on those overlays. The authored bypass began at a pre-entry point behind the camera. Because the renderer retained only route points already inside the canvas, the wide near segment and its connection to the player were discarded; the first-person course showed no usable local path.

The first corrected render exposed the complete handoff issue: after a real lateral clearance, the same nearby patch could immediately return as non-active approach guidance alongside the resumed Field Log route. Making the local path visible made that latent competition obvious.

## Resolution

- Active footing routes now begin at a lower-center first-person player origin.
- Every route segment is clipped against the safe course view. A segment that intersects the canvas is drawn even when one endpoint is offscreen.
- Wide bypasses receive a restrained course-edge bridge between their outgoing and returning segments, preserving the true route shape without pretending the offscreen turf is visible.
- Directional chevrons communicate travel order, and each active route terminates at a grounded `MUD EXIT`, `ROOTS EXIT`, or `THATCH EXIT` ring and diamond.
- A cleared patch suppresses its nearby approach route while it remains behind or alongside the player. Re-entry always restores active guidance, and moving back toward the entry restores approach guidance.
- `render_game_to_text()` exposes route visibility, player-origin ingress, segment count, offscreen continuation, edge-bridge visibility, and exit-marker visibility.
- Readiness adds `footing_escape_world_route_continuity` and `footing_escape_post_clear_handoff`; the static verifier guards both implementation contracts.

## Official route evidence

The final official `release-hardening-deep-route.json` replay reached:

- player: `(22, 223)`
- surface: `IRRIGATION MUD`
- movement multiplier: `0.54`
- immediate owner: `footing_hazard_escape`
- preserved objective: `field-log`
- local world segments: `3`
- player-origin ingress: visible
- offscreen continuation: visible
- course-edge bridge: visible
- exit marker: visible
- conflicting objective reflectors: `0`
- readiness: `30/30`
- estimated FPS: `60`
- render average / p95 / observed max: `2.78ms / 4.0ms / 31.3ms`
- browser errors: none
- asset failures: none

## Real movement handoff

From the same active mud state, the validation client held ArrowLeft for 180 native game frames. The player reached `(-24, 223)` on fairway at full pace. The immediate owner became null, the local footing world route became null, and the Field Log remained active at `204.08m` with 11 reflectors and ten route segments restored. This proves cause → lateral escape → full-speed ground → clean objective resumption without state injection.

## Responsive visual inspection

- 2560×1600: exact document containment; centered 2508×1403.75 canvas
- 1280×720: exact document containment; centered 1209.375×673.265625 canvas
- 800×600: exact document containment; centered 769.625×428.015625 canvas

At every active viewport, the near ingress, left-edge turn, returning corridor, material exit marker, map header, and bottom instruction remained legible without panel overlap. The cleared desktop capture removed all amber mud-route geometry while preserving the ordinary course, Field Log objective, and map. The responsive harness produced no browser errors.

This pass uses the existing generated course, footing, obstacle, and landmark assets. It changes route presentation and handoff eligibility only; hazard geometry and cost, objective progress, player movement, and Joe's awareness or pathing are unchanged.
