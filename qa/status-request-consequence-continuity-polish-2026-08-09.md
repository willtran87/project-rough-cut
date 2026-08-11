# Status Request consequence-continuity polish — 2026-08-09

## Finding

- The Status Request decision card clearly explained acknowledgment versus escalation, but the consequence lost its identity as soon as Joe took over.
- During investigation the Joe Attention panel fell back to `VERIFYING DISTURBANCE`; during the follow-up sweep it fell back to `SEARCHING LAST SIGNAL`.
- This weakened the cause-and-effect loop: the player had made a meaningful choice, but could no longer tell whether Joe was checking a coarse shared grid or a precise escalated sector.

## Refinement

- Added one presentation-only Status Request signal model for the existing investigation timer.
- Acknowledgment now remains `VERIFYING ROUGH STATUS GRID`; escalation remains `VERIFYING ESCALATED SECTOR`.
- When the existing distraction timer hands Joe into search, the same evidence identity, color, target, and counterplay are carried into `SWEEPING ROUGH STATUS GRID` or `SWEEPING ESCALATED SECTOR`.
- Joe's grounded label follows the same source with `CHECKING/SWEEPING ROUGH GRID` or `CHECKING/SWEEPING YOUR SECTOR`.
- Joe speed, request duration, response duration, ping duration, search duration, detection, location precision, Delivery scoring, objective progress, input, and map rules are unchanged.

## Verification

- `status_request_consequence_continuity` raises release readiness to 33/33 and statically verifies both outcomes, both counterplans, and the investigation-to-search handoff.
- A 2,683-frame official keyboard route crossed The Tee, Audit Row, Water Hazard, and Clubhouse Crossing at an estimated 60 FPS. It averaged 2.61 ms render time, recorded 3.7 ms p95 and 28 ms maximum with one long render frame, and produced no browser error artifact.
- That native route also confirmed the scheduler correctly suppresses a Status Request during active Crosswind Cover rather than forcing the event.
- A temporary visual audit hook then invoked the production escalation resolver on an ordinary first-hole state and let the normal Joe update transition the signal into search. The hook was removed immediately after capture and is not release code.
- The resulting state exported `outcome: escalated`, `SWEEPING ESCALATED SECTOR // 5.5s`, matching danger color `#df6242`, the original sector target, and the explicit counterplay `break laterally beyond the precise sector`.
- Direct screenshot inspection passed at 2560×1600, 1280×720, and 800×600. The fitted text remained inside the existing Joe Attention panel, the map and objective hierarchy stayed intact, and the browser reported no page or console errors.

## Evidence

- `output/status-request-search-continuity-2560x1600-2026-08-09.png`
- `output/status-request-search-continuity-1280x720-2026-08-09.png`
- `output/status-request-search-continuity-800x600-2026-08-09.png`
- `output/status-request-handoff-final/shot-0.png`
- `output/status-request-handoff-final/state-0.json`

## Cleanup

- The temporary browser script, temporary state/layout files, temporary visual hook, rejected probe fixture, and temporary screenshots were removed.
- The isolated local server on port 4195 was stopped after verification.
