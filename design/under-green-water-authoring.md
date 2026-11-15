# Under the Green water authoring

The chapter owns its irrigation schedules. Shared `hazard-timing.js` owns only truthful timed/event countdown semantics. Other chapters do not inherit these water effects or Joe's crossing policy.

Define geometry and schedule intent together in `web/under-green-layout.js` (`WATERS`). Use a unique stable `id`, a player-facing `name`, finite metre coordinates and positive `width`/`depth`. Optional `axis: 'x'` rotates the channel across the east/west route. `forward` describes route direction, not timing.

Every outlet declares one `control`:

| Control | Required timing fields | Meaning |
| --- | --- | --- |
| `cycle` | `offset`, `lowSeconds` | Repeating low, warning, surge, recession. |
| `pump-return` | None | Safe until the bypass opens, then a two-second warning and persistent discharge. |
| `pump-outflow` | None | Blocked until the bypass opens, then drained. |

The two pump controls describe this chapter's existing latched bypass. Their fixed physical pipes, gauges and recovery directions still belong to the authored pump encounter; adding a second mechanism requires explicit encounter work. Renaming an outlet no longer changes its water-state, navigation or coaching behavior, but IDs still identify saves, reports and authored fixtures and should remain stable.

`web/under-green-water-state.js` owns cycle duration, warning duration, safe-window calculation and the state evaluator. Layout validation runs once after range compaction. It rejects missing controls, duplicate IDs, invalid dimensions/axes/directions, ambiguous pump/cycle fields and low durations that leave no surge. The lesson flag selects teaching behavior; its duration is explicit. Do not restore timing defaults inferred from names or the lesson flag.

Simulation, render signals/effects, audio and HUD read `waterState` through the course module. Joe's planner reads the same `recurringSafeWindow` and period. Preserve `safeFor: null` for safety until an event and `remaining: null` for event-controlled transitions. Recession remains dangerous. Do not invent countdowns for latched mechanisms.

For a new crossing, also author connected floor/banks, believable fixtures, a real detour if named, and any intended checkpoint/reporting encounter. A valid schedule does not establish geometry clearance, reachable banks or fun. Update the relevant `CROSSINGS` observation entry when the crossing represents a new route decision.

Run the water-contract verifier for schedule changes, then the rule and folded-route suites. The browser contract verifier inspects actual signal materials, flowing meshes, audio targets, diagnostics and HUD across four viewport sizes. Inspect the resulting views. The frozen pre-refactor oracle protects current behavior; intentional design changes need explicit new expectations and comparison evidence, not a blind oracle update.
