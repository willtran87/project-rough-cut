# Current pursuit: continuous route balance

This pass follows the user's request for less clunky pathing, better seeking, and more aggressive Joe. The runtime changes are described in `under-green-pursuit-motion-2026-11-12.md` and `under-green-obstacle-pursuit-2026-11-12.md`. This follow-up changes QA navigation and reporting only; it does not adjust Joe, player speed, water cadence, or the level layout.

## Original current-build measurement

`output/under-green/current-range-balance/balance.json` retains all 144 continuous CP2-to-exit attempts: 24 half-second offsets over the complete irrigation cycle, three sustained stances, and both fixed range routes. Joe remains live throughout; the pilot follows keeper crossing advice and can evade an observed attack.

- All 96 walking/sprinting attempts completed with zero water hits.
- Overall: 130 completions, 14 captures, no unfinished attempts or recorded final solid overlaps.
- Both sustained-crouch branches were caught at offsets 7 and 8.5. A loss under a fixed pace is not evidence that every response from that state must lose.
- Among completed pairs, walking had 11 wet-faster and 11 dry-faster results exceeding 0.5s. Sprinting had seven wet-faster results exceeding 0.5s; dry finished ahead at 16 offsets, but its largest advantage was only 0.383s. Crouching had four wet-faster and five dry-faster results exceeding 0.5s.
- The historical strict benchmark therefore remains **failed**. Its requirements have not been lowered or relabelled as passing.

An optional dry-corner smoothing probe ran ten sprint attempts at offsets 0, 1, 3, 6, and 9. Every attempt completed without water contact. Cutting legal dry grid bends shifts arrival phases but does not produce a greater-than-0.5s dry sprint advantage in these samples. The optional pilot preserves authored waypoints and excludes water beds along shortcut segments. It is not used by the established matrix or runtime movement. Results remain in `smoothed-sprint-probe.json`.

## Corrected test-player landing behavior

The first four cue-responsive follow-ups exposed a QA defect. After clearing a channel completely, the pilot could ask the bidirectional crossing helper for advice again before finishing its far-bank waypoint. Advice from that side concerns crossing back. Following it invented a wait of almost another cycle, altered the next branch choice, and eventually left one walking pilot repeatedly evading Joe inside the keeper room. That attempt remains recorded as unfinished, with 57 attack/evasion cycles, in `response/full-observed.json`.

`probe-under-green-folded.mjs` now finishes the authored landing when the player's complete body is beyond the destination bank. It still checks the original approach advice, respects water and collision, and uses ordinary movement. It no longer offers a new walking/running crossing choice for the reverse direction while finishing that landing. Runtime crossing guidance was already bidirectional correctly and is unchanged.

Corrected continuous responses:

| Initial offset | Starting policy | Branch choices | Result | Time | Water hits |
| --- | --- | --- | --- | ---: | ---: |
| 7 | Walk | Dry / dry | Escaped | 31.633s | 0 |
| 8.5 | Walk | Wet / wet | Escaped | 19.917s | 0 |
| 7 | Cautious, reacts to observed cues | Wet / wet | Escaped | 22.700s | 0 |
| 8.5 | Cautious, reacts to observed cues | Dry / dry | Escaped | 42.650s | 0 |

The cautious policy actually turns its rear camera while Joe is audible, and changes pace after a visible close approach or audible attack preparation. It also stands for an available walking crossing. It does not read hidden Joe distance to decide when to run. Both previously losing fixed-crouch starting states therefore have demonstrated complete, zero-hit responses. These are map-aware scripted inputs, not unfamiliar-player comprehension evidence.

## Browser and source checks

- Sixteen browser replays matched all four complete outcomes at 2560×1600, 1280×720, 844×390, and 390×844. Forty-eight captures, no console/page errors. The desktop wet approach and portrait dry middle-junction views were opened and inspected; compact controls and the observable threat caption are visible.
- All 79 local Under the Green runtime dependencies still match the completed hardware/software soak snapshot. The QA pilot changed after that measurement. The existing soak describes its recorded inputs and unchanged runtime; its historical harness snapshot is preserved. No new performance claim or redundant soak is needed for this QA correction.
- The reactive diagnostic now accepts explicit output, pressure, and offset arguments. The browser replay accepts an explicit tape source/output directory. Defaults preserve the previous broad studies, and new results do not overwrite them.
- The corrected full 144-case fixed-policy matrix finished (session 69017, exit 1). All 144 detailed rows match the original current-build matrix exactly. These older route policies already reached their wider landing waypoint before encountering the reverse-advice defect; the tighter reactive landing exposed it. The strict benchmark remains failed for the same two sustained-crouch pairs and sprint threshold, with 130 completions / 14 captures / no unfinished attempts. No failure was erased by the QA fix. Both matrices are retained separately.

Reproduction:

```powershell
node tools/verify-under-green-range-balance.mjs --output=output/under-green/current-range-balance/landing-corrected
node tools/probe-under-green-reactive-routes.mjs --observe --pressure=standard --offsets=7,8.5 --output=output/under-green/current-range-balance/landing-response
node tools/verify-under-green-reactive-browser.cjs --source=output/under-green/current-range-balance/landing-response/full-observed-tapes.json --output=output/under-green/current-range-balance/landing-browser
```

The design brief calls for comparing time and exposure together and preserving earned leads. It does not require every fixed stance to finish both routes or each branch to win by an arbitrary time margin at every pace. Retain the stricter benchmark as diagnostic evidence; do not manufacture pressure by slowing familiar movement, weakening a successful crossing, or accelerating Joe. Human route comprehension, preference, and perceived tension remain unverified. This pass does not close the entire 44-item implementation goal.
