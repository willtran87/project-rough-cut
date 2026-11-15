# Under the Green — interaction feedback and visible controls

Pressing Use just outside the pump's reach previously did nothing. Valid actions also supplied useful details that the HUD never displayed. `output/under-green/interactions/before.json` records the silent out-of-range and facing-away cases.

Local selection and explanation now live in `web/under-green-interactions.js`, using the existing shared visibility/reach calculation. The simulation still exports `nearbyAction` for compatibility. Valid pump, record and gate actions display their consequence or commitment. A failed Use briefly explains a visible nearby control's distance, already-completed state or prerequisite. An unseen/distant control produces generic facing/reach advice, without revealing its identity through scenery or behind the camera.

The wider 3.2-metre feedback query never enables an action; physical Use retains its 1.8-metre reach. Guidance is recalculated from the current view and state, so approaching a usable control immediately replaces “move closer.” It expires on simulation time, pauses with gameplay, and is not serialized. Mechanism events and imminent danger outrank interaction coaching. Closing the sluice now explicitly says to stay inside until it seals.

## Visual corrections

Close-up inspection found the record edge-on from the corridor and the existing red sluice control hidden by its housing from a valid side approach. The record now faces the corridor, has a simple document/clip silhouette, and rests on a matching raised stand. The sluice has a raised red top actuator within its existing footprint, visible from the room's side approaches. Interaction elevation uses each prop's authored target height. Floor plans, body collision, reach, enemy rules and gate completion invariants remain unchanged.

These are authored chapter objects. The shared interaction calculation and message arbitration remain reusable; other chapters retain their own physical actions and unavailable-state wording.

## Evidence

- `tools/verify-under-green-interactions.mjs` passes ordinary approach, request-only feedback, failed facing/pitch/distance, rear-visible selection, duplicate pump/record prevention, durable progress, gate prerequisite/commitment, pause, expiry and non-persistence checks. The initial record fixture was outside the floor on the back of the recess; it was corrected to the accessible corridor side without loosening eligibility.
- `tools/verify-under-green-interactions-browser.cjs` passes actual remapped T versus inactive E, movement into reach, immediate updated guidance, pump activation, repeated Use and unseen-control wording. It also verifies real closure guidance and danger priority. Pump/record/gate screenshots were inspected at **2560×1600, 1280×720, 844×390 and 390×844**, including touch-mode controls. Caption and Use-button bounds remain valid.
- Existing remapped Level 1/Under the Green rear-view interaction tests pass, including Level 1's actual B chip and I/J/K/L coaching. Existing Under the Green rules and audio/aftermath regressions pass after the prop changes: gate cancellation, occupancy, safe closure, movable aftermath, pause and completion persistence remain intact.
- Camera clearance passes **23,424 static poses and 696 dynamic poses**, with zero hits, plus 16 viewport captures and actual wall/door movement. Its old nozzle-bank fixture started at time zero, now a surge after the prior lesson timing adjustment. Reproduction shows that fixture is shoved to y=19.9 and x=-2.59; starting during the actual low interval reaches x=-2.7 with no hit. The wall test now derives its safe phase from the outlet offset. Water behavior was not weakened; dedicated phase/crossing tests remain separate. Evidence: `camera-fixture.json`, `output/under-green/camera/probe.json` and `browser.json`.
- Standard web-game client completed after the final visual changes. Latest screenshot/state inspected: ready/playing, 5.80 seconds, first crossing complete, zero water hits and no console-error artifact. Full-page interaction captures supply HUD evidence separately from the client's canvas screenshot. Syntax and scoped whitespace checks pass.

## Remaining work

Unfamiliar-player discovery and interpretation of these controls remain unverified. Broader encounter presentation, cross-chapter message/prompt audits, sustained performance, human listening and physical-device acceptance remain part of the active 44-item objective.
