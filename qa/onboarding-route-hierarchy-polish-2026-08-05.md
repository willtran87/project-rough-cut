# Onboarding route-hierarchy polish — 2026-08-05

## Outcome

The first playable frame now teaches one route without removing the course's route choices.

- While `FIRST STEPS` owns movement instruction, the selected mandatory field-check route retains full marker emphasis.
- Non-selected key and valve markers remain visible at a subdued 24% peripheral emphasis instead of competing with the mint route and onboarding card.
- Alternate markers restore their established 72% secondary emphasis automatically when the ten-meter movement lesson retires.
- An alternate that is actually in interaction range still receives full presentation priority.
- The persistent course map, world props, interaction radii, navigation selection, objective order, and gameplay rules are unchanged.
- Text state exposes `alternate_route_deferred`, the applied alpha, and `deferredBy = first_steps_route` so the visual hierarchy is auditable.

## Validation

- `node --check web/game.js` passed.
- `git diff --check` passed for the changed source and documentation.
- The official Playwright client captured the first live gameplay frame. Direct inspection confirmed `AUDIT BELL // FOLLOW LANTERNS` and the `FIRST STEPS` card remain dominant while the nearer Drain Valve plaque reads as peripheral context.
- At 28 meters of accepted travel, state confirmed First Steps had retired, the Audit Bell remained the selected route at full strength, and key/valve alternatives had automatically returned to 72% with no deferral owner.
- The existing obstacle-aware station scenario completed the Audit Bell end to end. The field-check ledger advanced to 1/3, Joe investigated the signal, Field Log became the full-strength selected route, and alternate route markers retained their normal secondary role.
- No browser-error artifact was produced. The final interaction capture completed 618 rendered frames at 4.32 ms average canvas render and 5.80 ms final canvas render.

## Suggested follow-up

Human-playtest the first ten meters without looking at the map. Preserve the single-route lesson and automatic ten-meter handoff; tune only the 24% peripheral alpha if a display makes the valve either distracting or undiscoverable.
