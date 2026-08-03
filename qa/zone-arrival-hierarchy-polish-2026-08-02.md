# Zone Arrival Hierarchy Polish — 2026-08-02

## Scope

- Audited the first Audit Row arrival using the current full-course build and ordinary keyboard input.
- Reduced duplicated copy during zone arrivals without changing zone timing, Delivery scoring, navigation, collision, set pieces, or tactical information.

## Change

- While the large zone card owns the center signal lane, the bottom rail now presents only that zone's tactical sentence instead of repeating the zone name.
- The rule is data-driven across all eight existing course zones.
- Higher-priority messages remain untouched because shortening occurs only when the active message is exactly the current zone's authored cue and the zone-arrival presentation owns the HUD.
- `render_game_to_text` now reports the exact presented message and retains the authored full cue in `messageSource` when contextual shortening is active.

## Validation

- `node --check web/game.js` passed.
- `git diff --check` passed.
- The required official browser client reached Audit Row at 94 meters through ordinary input.
- The settled frame displayed `AUDIT ROW / HEDGE CORRIDOR` once in the arrival card and `Clipped hedges create hard sight breaks.` in the tactical rail.
- Text state reported `focus: zone_arrival`, `zoneBannerVisible: true`, the same shortened visible message, and the complete authored source cue.
- The final sample averaged 1.71ms canvas render work and produced no browser error artifact.
- Evidence: `output/zone-arrival-hierarchy-final-2026-08-02/shot-0.png`.

## Process hygiene

- Both official-client runs closed their browser contexts.
- The user-requested local server on port 4173 remained active.
