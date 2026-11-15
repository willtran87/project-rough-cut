# Under the Green — steering during surge recovery

Scope: review 15 (readable, controllable recovery), with regression evidence for 20, 36, 41 and 44. Full 44-item implementation remains active.

## Reproduced defect

The recovery target stored the player's horizontal position when the surge hit. Normal movement accepted a sidestep, then the forced displacement moved diagonally back toward that original target. All 72 lateral cases in the 180-case baseline lost more than 10% of accepted lateral travel. In the walking lesson example, 0.6912 m of accepted steering resulted in **0 m** of lateral displacement on reaching the bank. This contradicted the player's recovery instruction.

The baseline uses ordinary movement from validated dry-bank fixtures into a closing window, six periodic outlets, both banks, three stances and five recovery actions. Joe remains live in the pump room; these are explicit mechanical fixtures, not continuous chapter play. Retained evidence: `output/under-green/recovery-control/baseline.json` and `baseline-examples.json`. Subsequent exploratory runs write `probe*.json` so the failing baseline is preserved.

## Implementation

`web/under-green-sim.js` now applies the current along the channel toward the entry bank, retaining the player's current lateral position. The shove remains bounded at 8 m/s and uses the existing swept collision against walls, gate and Joe. It stops rather than pulling the player back toward water after they have passed the catch target.

While recovering inside that outlet, normal input may steer laterally in either direction or retreat toward the entry bank. Forward movement through an active discharge remains blocked. Recovery does not grant access to a different active outlet. Existing walk/sprint/crouch speeds, camera look, pause, water cycle, protection durations and Joe's rules remain unchanged.

In the corrected walking lesson example, 0.6336 m of accepted steering produces 0.6336 m of lateral displacement. The shove finishes slightly sooner because it no longer follows a diagonal route back to the original lane.

## Verification

- `verify-under-green-recovery-control.mjs`: **378 cases pass** across both banks of all six periodic channels plus the event-controlled return. Cases include three stances; idle, left, right, backward and held-forward input; lateral reversal during recovery; lanes near each wall; and reduced motion. Every case incurs one hit, reaches the entry bank, remains clear after an ordinary retreat and respects the movement bound. No sampled body overlaps or protected captures. Lateral displacement matches accepted input; switching direction changes lateral motion.
- The pre-pump outflow is permanently blocked and cannot legitimately produce a late-entry recovery. Its barrier/progression behavior remains in the existing tests; it is not silently treated as a covered timed crossing.
- `verify-under-green-pressure-envelopes.mjs`: all **516** existing cases pass their stated invariants: 343 clears, 173 captures, 103 clears after a water hit, zero unfinished pilots, zero excluded fixtures and zero invariant failures. This preserves documented failure possibilities; it does not promise survival from every mistake.
- `verify-under-green-recovery-control-browser.cjs`: **24 full sequences and 96 views** pass. The inputs travel through real keyboard events at 2560×1600, emulated gamepad polling at 1280×720, and browser touch events with the actual touch UI at 844×390 and 390×844. Each sequence approaches from dry floor, takes a surge, steers or reverses steering, reaches its bank and retreats. Final position/time match the simulation tapes. Pause during recovery freezes the state. Zero page/console errors.
- The first browser harness attempt omitted the controller's required neutral poll after leaving the menu, so the existing input guard correctly suppressed movement. The harness now supplies neutral input before installing the starting fixture. The guard was preserved; this was not a runtime movement defect.
- Existing main simulation: 13 groups and seven complete routes pass. Existing gate/save rules, lesson retirement (72 cases), outcomes and crossing-advice checks also pass. Advice checks cover 4,698 scenarios and 1,158 advertised crossings, with 576 documented obstructed/multi-channel exclusions; those exclusions are not counted as passes.
- Installed gameplay client completed its opening traversal: ready, lesson crossed, zero hits, 11.23 seconds; final screenshot and state inspected, no error artifact. Visually inspected high-resolution recovery, portrait bank, landscape return and client captures.

Evidence: `output/under-green/recovery-control/verified.json`, `examples.json`, `browser.json`, screenshots and `client/`; current existing reports remain under their normal output directories.

## Limits and next work

These checks establish that steering is effective and the sampled physical rules hold. They do not establish human recovery recognition, fear/fun, physical-device comfort, or all-space actor clearance. The close-Joe matrix covers its documented forward approaches; broader reverse/lateral/occupied-bank enemy configurations still need coverage.

The original mixed-route and fixed all-wet/all-dry balance results remain historical evidence. The latter's failed criteria have not been declared solved. Continue adaptive stance/route choices and boundary arrivals through the full range sequence, remaining shared-consumer audits, structural/actor coverage and cold-start/device qualification. Do not narrow the full goal to this recovery fix.
