# Under the Green: explicit water schedule contract

November 12, 2026. Advances review item 44 and protects the timing/navigation requirements in items 4 and 5. The previous goal turn refreshed current-build sustained performance evidence. This pass changes runtime organization and authoring validation while preserving existing water behavior.

## Change

`under-green-water-state.js` now owns the readable state evaluator, documented water definition, cycle constants, recurring safe window and load-time definition validation. Each `WATERS` entry explicitly declares `cycle`, `pump-return` or `pump-outflow`. Periodic outlets declare their low duration; the lesson flag no longer implicitly selects timing. Outlet IDs remain stable for authored fixtures, saves and reports, but no longer choose state-machine behavior.

The layout validates definitions after range compaction. Missing/unknown controls, duplicate identities, invalid geometry/axis/direction, ambiguous pump/cycle timing and low durations that leave no surge produce a named error instead of silently entering malformed gameplay.

The course module preserves its existing `waterState` export, so simulation, scene, audio and HUD use the same evaluator. Joe's planner now consumes its period and recurring safe-window helper rather than repeating `12` and `low + 1.5`. Event-specific coaching selects the explicit control type. The existing shared timed/event countdown helper is unchanged; no other chapter adopts these irrigation rules.

`design/under-green-water-authoring.md` explains fields, consumer ownership and the remaining geometry/encounter work required when adding a crossing. Validation does not establish reachable banks, physical fixture placement or enjoyable route choices.

## Evidence

- `tools/verify-under-green-water-contract.mjs`: 173,304 complete state-object comparisons against the frozen pre-change evaluator, including exact transition boundaries and negative time; 23,120 navigation-wait comparisons; 23 malformed definition cases rejected. Renamed outlet identities preserve state/planning/coaching. A deliberately changed low duration updates the simulation and Joe's safe window together. State remains JSON-safe and recession remains dangerous.
- `tools/verify-under-green-water-contract-browser.cjs`: 120 phase-interior cases across 2560×1600, 1280×720, 844×390 and 390×844. Reads actual signal mesh materials through QA-only routing, actual water mesh flow flags, audio phase targets, diagnostics and HUD name/title/action/danger/meter. All agree, no page/console errors or horizontal overflow. Four warning captures opened and inspected; no presentation change was intended. These viewport checks do not claim physical touch-device acceptance.
- Existing rule suite passes save migration, bypass retention, advice, gate safety and action bindings.
- Existing main suite passes seven live-Joe routes across pressure settings/checkpoints/evidence, plus movement, physical capture, evasion and water rules (session 25361, exit 0).
- Existing folded suite passes eight wet/dry/sprint/hesitation/evidence/checkpoint routes, expected water hits, connected drainage and committed-strike counterplay (session 61523, exit 0).
- Existing design suite passes after repairing one stale fixture described below.

Artifacts are in `output/under-green/water-contract/`; the pre-change evaluator and wait formula are retained in `tools/fixtures/under-green-water-before.js`.

## Retained diagnostic issues

The old design test placed the lesson at absolute time 6 and called it closed. Its current offset makes that cycle position 2, which is low. The frozen pre-change evaluator returns the same low state, so this failure was not caused by the refactor. The fixture now derives surge time from the lesson offset. It retains its bank-approach assertion: path endpoint y=20, Joe y=19.655 after three seconds, phase `water-wait`. No game rule was changed to satisfy the fixture.

The first installed-client payload used unsupported `w` button spelling. Its state showed zero movement despite elapsed time, so it was not accepted as movement evidence. The corrected run uses the client's documented `up` action; its result is recorded below after inspection. The initial artifacts remain under `client/` rather than being overwritten.

## Limits

This is contract and regression work, not a new pursuit/tension design or proof of unfamiliar-player comprehension. The broad item 44 scope also includes interaction, preference and encounter contracts, which this water pass does not complete. The earlier sustained-performance report belongs to its recorded build; no new frame-rate claim is made for this refactor. No geometry, water timing, player movement, attack tuning or save IDs were intentionally changed.

Final installed-client session 77919 exited 0. Its latest screenshot and state were inspected: ready/playing,6.567 seconds,player y28.04,lessonCrossed=true,zero water hits andspeed0 afterrelease. No error artifact was produced. Initial client46608 also exited0 but is retained only as the unsupported-action diagnostic. Both browser contract passes exited0; allownedhandles areterminal.
