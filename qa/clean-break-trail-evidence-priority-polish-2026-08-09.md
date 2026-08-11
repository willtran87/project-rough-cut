# Clean Break trail-evidence priority polish — 2026-08-09

## Finding

The missed Audit Bell lifecycle was replayed beyond the previously sampled three-second window. False Retreat correctly paused the optional lesson, but the first post-tactic owner window showed the bottom Clean Break correction at the same time as `TRAIL CHAIN ×3 // CHANGE SURFACE` and the active cross-fairway/cut-turf instruction. The coaching did not cover the banner, but it competed with a more urgent route-changing survival decision.

The earned Clean Break reward policy already deferred for `trail_evidence`; the parallel missed-feedback policy omitted that focus.

## Resolution

- Added a named `fieldSignalBreakawayMissFocusDefers()` policy and included `trail_evidence` with the existing pursuit, interaction, hazard, predator, and scored-result owners.
- Missed Clean Break feedback now pauses without aging while Joe follows physical prints. The top trail-chain warning and its immediate counterplay retain decision priority.
- Once urgent trail ownership yields, the exact cause/rule/Field Log lesson resumes in the existing orange rail for its untouched remaining duration.
- Preserved trail discovery, chain timing, Joe search/pathing, scoring, collision, station objectives, map state, and the generated environment.

## Verification

- `node --check web/game.js`
- `node --check tools/verify-release.mjs`
- `node tools/verify-release.mjs`: 48 referenced assets, 87 deterministic action scenarios, no warnings or failures.
- Native full-lifecycle replay: the lesson remained at 2.63 seconds throughout active trail evidence; resumed at 2.62 seconds after 18.33 seconds; paused at 0.43 seconds for an Evidence Denied Delivery result; resumed at 0.35 seconds; and expired at 23.17 seconds. Field Log stayed active throughout and ordinary `TRAIL COLD` guidance returned afterward.
- Exact resume-frame inspection passed at 2560x1600, 1280x720, and 800x600 with contained geometry and no overlap with the objective dossier, Joe Attention, course map, route thread, generated hedge, lanterns, fog, or background layers.
- The lifecycle replay held 60 estimated FPS at 4.19 ms average render work, 6.6 ms p95, 29.6 ms observed max, one long frame, and no browser errors.
- Official client activation regression: 52/52 readiness, all 48 runtime assets settled, 60 estimated FPS, 3.4 ms average render work, 3.6 ms p95, 29.1 ms observed max, one long frame, and no browser-error artifact.

No ImageGen asset was needed because the verified defect was temporal HUD ownership, not missing or inconsistent artwork.
