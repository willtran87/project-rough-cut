# Encounter and interaction contract pass — November 12

Progress on review items 44, 43 and 8. The previous turn made progress by correcting QA far-bank navigation and preserving current pursuit/balance evidence. This pass implements a remaining code-contract requirement; it does not retune Joe or the layout.

## Source gap and implementation

The old encounter observer selected aggregate range channels using `id === 'range'` and a `range-` prefix, applied approach restrictions using named IDs, and used y/x coordinates even though each crossing declared an axis. Definitions had no reference/shape validation and only shallow freezing. Interaction activation and requested distance feedback separately hard-coded 1.8m.

- Added readable, JSDoc-typed load-time contracts for arrival, search/inspection data, crossing references and interaction definitions.
- Crossings explicitly declare channel membership, travel axis, approach bounds, pump prerequisite and parent aggregation. Validation catches missing/duplicate references, inconsistent parent spans, reversed travel, invalid timings/coordinates and invalid action metadata. Nested authored values are frozen.
- Extracted the crossing observer into a readable module using those declared fields. Names no longer select reporting behavior; horizontal crossings use the declared axis. Existing report schema and event order are preserved.
- Interaction eligibility and requested feedback consume one validated definition per action, including the same activation distance. Actual input, camera, state transitions and shared action bindings are unchanged.
- Removed the unused legacy `SEARCH_OFFSETS` export after searching all local consumers. Live seeking uses the existing observed-trail and authored inspection logic.

## Verification

`output/under-green/encounter-contract/verified.json`:

- 34 invalid authored configurations rejected, including unknown actions, missing channels, invalid durations, conflicting parent spans and reserved report keys.
- Renamed aggregate/outlet identities retain membership; a complete mixed crossing rotated to the x axis produces the same phases, timing and wet/dry/mixed outcomes.
- 1,728 interaction cases exactly match the frozen original eligibility/feedback across positions, distances, view directions, rear glance, pitch and durable state.
- 6,846 observed live simulation frames exactly match the original accumulated telemetry. Four current ordinary-input CP2 routes retain their complete outcomes, zero water hits and exact times: 31.633s, 19.917s, 22.700s and 42.650s. The final verifier generates its own routes; it does not rely on previously generated tapes. An earlier tape-based check also matched 7,014 frames, but the final count above is authoritative for the checked-in verifier.
- Existing interaction rules and seven main simulation routes pass, including all difficulty settings, checkpoints, optional record, pause, water recovery, committed attacks, gate occupancy and saves.

Actual browser interaction checks pass with remapped T Use: inactive E, out-of-range feedback, ordinary approach and activation, repeated-use explanation, hidden-control refusal, pause/expiry and imminent-threat priority. Pump/record/gate views cover 2560×1600, 1280×720, 844×390 and 390×844 with compact touch controls. No page errors. The high-resolution pump view and portrait gate view were opened and inspected.

Installed gameplay client passed (session 57959, exit 0): ordinary forward input crosses the lesson with zero hits, reaches y35.72, Joe enters physically, and release produces zero speed. Screenshot and concise state inspected. The first client invocation referenced an action file that did not exist and exited 1 before the gameplay check; the corrected invocation used the retained `actions.json` and completed. Main simulation session 24922 also finished exit 0; no test process remains pending.

## Limits and next work

These changes validate data and preserve existing behavior. They do not prove every future authored route is reachable, or close human tension, listening, route comprehension or physical-device acceptance. Shared preference/input contracts were not changed, and their broader current-consumer audit remains separate. The historical failed fixed-policy range benchmark remains failed; this refactor is not a balance fix.

The prior performance soak remains evidence for its recorded runtime revision. This pass adds load-time validation and refactors opt-in crossing reporting; no fresh sustained-performance claim is made. Full 44-item scope remains active. See `design/under-green-encounter-authoring.md` for the authoring boundary and reproduction commands.
