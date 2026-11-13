# Under the Green encounter and interaction contracts

The chapter validates authored encounter and interaction data during module loading. A bad reference, impossible duration, reversed span or unsupported action raises a named error before gameplay. `web/under-green-authoring.js` contains JSDoc types and validators; it does not own player controls or AI behavior.

## Crossings and local reports

Author report encounters in `web/under-green-encounters.js`, after the layout's range-coordinate compaction. Each crossing declares:

- `id`: stable report identity. Names have no behavioral meaning.
- `water`: the channel whose phase describes arrival.
- `channels`: every channel whose phases and wet visits belong to this encounter. Include `water`; use existing water IDs and no duplicates.
- `axis`, `direction`, `entry`, `exit`: the longitudinal travel span. For `axis: 'y'`, lateral position is x; for `axis: 'x'`, lateral position is y. The exit must lie forward of the entry.
- `center`, `lateralReach`: the lateral observation envelope. Optional `minLateral` and `maxLateral` are exclusive approach bounds.
- `drySide`, `dryX`: which lateral side and distance establish a dry-branch visit. The dry branch must lie inside the observation envelope.
- `requiresBypass`: whether a report can begin before the pump is operated.
- Optional `parent`: a top-level aggregate with the same axis, direction and corridor center. Its span and channel list must contain the child. Children begin before their exit; aggregate reports can begin exactly at the exit, preserving existing checkpoint-report semantics.

`web/under-green-crossing-observer.js` builds explicit channel references once. It tracks arrival phases, wet/dry visits, waiting, water hits and exit timing using this data. It does not infer range membership from a name or prefix, or infer the travel axis from today's layout. Aggregate and per-outlet records remain separate.

Adding a water outlet still starts in `under-green-layout.js` and follows `under-green-water-authoring.md`. A report definition does not create floor, water, signals or a safe route. The real geometry, recovery landings and continuous approach must be verified separately. Authoring validation establishes consistency, not reachability or good pacing.

## Arrival, search and controls

Arrival spawn/landing points, trigger position and positive door/walk durations are validated together with finite search destinations and valid inspection bounds/delays. Nested encounter values are frozen after construction. Runtime search memory belongs to a run and must copy those values before changing them.

`INTERACTIONS` in `web/under-green-interactions.js` declares the three supported actions: bypass, note and gate. Each includes its shared layout target, visible height, activation reach, request-only feedback reach, facing angle and text. Both eligibility and refusal coaching use that same reach. The chapter's state transitions still belong to the simulation; declaring a new ID alone does not implement an action and is rejected.

Existing on-foot bindings, rear-view facing, pitch, housing obstruction and save behavior remain governed by their existing shared/local consumers. No chapter controls changed in this contract pass.

## Verification

Run `node tools/verify-under-green-encounter-contract.mjs`. It checks invalid definitions, nested mutation, renamed and rotated report encounters, interaction equivalence, and four live-Joe ordinary-input routes against the frozen observer/interaction baseline in `tools/fixtures/`. No pre-generated route artifact is required.

Run the existing interaction and main simulation suites, plus `tools/verify-under-green-interactions-browser.cjs` for actual remapped controls and four viewport sizes. Use the installed gameplay client after meaningful runtime changes and inspect its screenshot/state. See `qa/under-green-encounter-contract-2026-11-12.md` for this pass's evidence and limits.
