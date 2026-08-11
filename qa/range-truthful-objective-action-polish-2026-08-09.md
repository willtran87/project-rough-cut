# Range-truthful objective action polish — 2026-08-09

## Finding

The expanded field dossier accurately identified the next objective but always prefixed it with the Interact binding. After completing Audit Bell, for example, the HUD could say `ENTER STAMP FIELD LOG` while Field Log was more than 300 meters away. That contradicted world-space range rings and made the dossier read like an immediately available action instead of navigation guidance.

## Resolution

- `objectiveActionRangePresentation()` now derives copy from the exact target, player distance, and authoritative interaction radius.
- Distant targets use `FOLLOW LANTERNS // TARGET nm` with no binding.
- The existing 2.25-radius approach band uses `CLOSE IN // TARGET nm` with no binding.
- The configured keyboard, gamepad, or touch binding appears only when `distance < radius`, matching interaction handling exactly. A target at the exact radius is still approaching.
- Active shed/drain rejections use a binding-free `BLOCKED` state until the existing retreat rule releases them.
- Filing, release authorization, and mandatory station breakaways remain distinct active states and never imply a fresh Interact press.
- Station completion resolves its `THEN` preview with the tactical override disabled, so the handoff names the true next objective while the live route temporarily owns `BREAK SIGNAL`.
- Live HUD, pause, Settings return context, and `render_game_to_text()` all consume the same presentation object. Diagnostics report availability, binding visibility, distance, radius, approach readiness, target identity, action verb, and range rule.

## Automated acceptance

- `node --check web/game.js` passed.
- `node tools/verify-release.mjs` passed with 48 referenced runtime images, 60.75 MB total, zero source masters shipped, zero unreferenced images, 79 valid action scenarios, no warnings, and no failures.
- `objective_action_range_truth` brings the live audit to 25/25 and verifies distant, approaching, exact-boundary, and ready states.
- The official fixture-free `web_game_playwright_client.js` replay completed in `first_hole` with all 46 gameplay assets settled, 60 estimated FPS, 4.2 ms render p95, 29.2 ms observed max, and no browser-error artifact.

## Native transition evidence

The authored Audit Bell route was played without state injection:

| State | Measured distance | Dossier copy | Binding |
| --- | ---: | --- | --- |
| Distant | 124.64 m | `FOLLOW LANTERNS // AUDIT BELL 125m` | hidden |
| Approaching | 12.11 m | `CLOSE IN // AUDIT BELL 13m` | hidden |
| Ready | 9.46 m | `ENTER RING AUDIT BELL` | visible |
| Station consequence | 58.96 m to cover | `BREAK SIGNAL // HEDGE TUNNEL 59m` | hidden |

The world marker and existing bottom action rail remained authoritative for nearby optional props throughout the route.

## Visual acceptance

Expanded-dossier screenshots were inspected at 2560×1600, 1280×720, and 800×600. The new copy stayed inside the existing action row, the primary field-check instruction retained priority, the world/map/threat hierarchy remained intact, and document geometry exactly matched every viewport without overflow. Focused approaching, ready, and tactical screenshots at 1280×720 showed clean state transitions and no browser errors.

Temporary browser scripts, screenshots, and the isolated port-4189 server were removed after inspection. The unrelated pre-existing process on port 4173 was not modified.
