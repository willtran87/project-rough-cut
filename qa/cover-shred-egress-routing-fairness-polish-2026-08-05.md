# Cover Shred egress-routing fairness polish — 2026-08-05

## Goal

Make Cover Shred actionable in the first-person view without weakening Joe: the game should name a route that matches collision, and it should not launch the tactic when Joe can invalidate that route before a responsive crouched player can finish it.

## Implementation

- Samples axis-aligned fairway routes every 1.4 meters using `obstacleAtPosition` and the normal player collision radius.
- Rejects blocked routes and routes longer than 28 meters.
- Estimates crouched travel at the shipped 15-unit speed plus a 0.22-second response allowance.
- Projects Joe's closing distance through the 1.05-second telegraph at speed 9 and any remaining committed travel at speed 23.
- Uses the current light exposure, concealment, and moving-crouch rough visibility calculation as the safety boundary, with another 1.5 units of margin.
- Resolves accepted route legs through live keyboard bindings, controller stick, or touch pad.
- Records unsafe attempts as `no_collision_clear_time_safe_egress`, waits 0.8 seconds, and retries without showing Cover Shred UI.

## Official browser evidence

Client:

`C:\Users\Will\.codex\skills\develop-web-game\scripts\web_game_playwright_client.js`

Routes:

- `web/test-actions/cover-shred-commit-attention.json`
- `web/test-actions/cover-shred-rough-exit.json`
- `web/test-actions/cover-shred-egress-deferral.json`

### Route calculation

The original Audit Row pocket produced:

- Player: `(59, 117)` in `BENT ROUGH`
- Route: `FORWARD → LEFT`
- Distance: `13.85`
- Type: `rough_edge_then_fairway`
- Rail: `COVER SHRED // HOLD C; W FORWARD, THEN A LEFT TO FAIRWAY.`

The full crouched route reached `(49, 127)` on `FAIRWAY`. Joe reached actionable visibility first, so `contact_cancelled` correctly retained priority. This showed that a geometrically valid route alone was insufficient.

### Final time-safe deferral

At the old trigger point the final build reported:

- Mode: `first_hole`
- Player: `(59, 117)` in `BENT ROUGH`
- Joe: `search`, 27 meters, no line of sight
- Active predator tactic: `null`
- Cover Shreds started: `0`
- Cover Shred deferrals: `1`
- Last deferral: `no_collision_clear_time_safe_egress`
- Average render: `2.9 ms`
- Last render: `3.3 ms`
- Browser error artifact: absent

## Visual inspection

The final 1280×720 screenshot shows ordinary evidence-search presentation with no stale Cover Shred banner, rail, caption, or countdown. The top evidence banner, Joe Attention source, grounded `JOE: TRACKING TRAIL` label, trail bearing, Field Log route, map, fog, and obstacle art remain legible and correctly layered.

## Follow-up

Capture a naturally eligible Cover Shred with Joe beyond the computed minimum distance and validate the shortened live route on hardware with controller or touch. Preserve the safety gate even if the existing nearby Audit Row fixture no longer starts the tactic.
