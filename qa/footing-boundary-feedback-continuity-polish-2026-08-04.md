# Footing-boundary feedback-continuity polish — 2026-08-04

## Intent

Keep one continuous correction visually coherent when it crosses between marked slow footing and clear turf.

## Change

- Directional-feedback duration is now sampled when a movement gesture begins.
- A gesture originating in marked footing retains its 0.26-second release echo after reaching clear turf.
- A gesture originating on ordinary ground retains its 0.42-second echo if it reaches marked footing before release.
- Releasing all movement ends the gesture; the next input samples the new starting terrain.
- Direction changes made without a complete release remain one gesture and cannot switch timing mid-fade.
- Collision escape feedback keeps its independent authoritative timing.
- Movement speed, camera translation, collision, recovery, routes, and input mapping are unchanged.

## Validation

- `node --check web/game.js` — pass.
- `node output/validate-route-pressure.mjs` — 18/18 pass.
- `node output/validate-route-pressure-visual.mjs` — 124/124 pass across 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- A deterministic right correction began inside irrigation mud, reached fairway at full movement speed, released with `quick_footing_correction` still latched at 0.26 seconds, retained a partial right-only echo at 120ms, and retired fully by 280ms.
- Visual inspection confirmed a continuous mint recovery arrow with no jump, duplicate, reticle collision, or layout drift at every tested size.
- The official uninstrumented browser smoke confirmed an ordinary fairway gesture still reports `standard_direction_echo` at 0.42 seconds, reached `first_hole` at eleven meters with the `tactical_handoff` owner, and produced no error artifact. Canvas work averaged 7.88ms and ended at 4.20ms across 110 rendered frames.

## Guardrails

- Do not resample feedback timing while any movement input remains continuously active.
- Preserve live held-input direction even when timing is latched.
- Preserve the ordinary and footing durations, recovery semantics, and collision override.
- If human testing prefers different cross-boundary behavior, change only the resampling rule after a complete release; do not add timers or alter movement physics.
