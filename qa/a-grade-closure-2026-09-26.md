# A-grade improvement pass: implementation and evidence

September 26, 2026. Candidate game SHA-256: `c190c56c38f9c202b8f5e69461da34b123ac922d8f53d1e688730cd0a20f83b8`.

This report follows the 30-item remaining-action backlog. It separates completed engineering work from human and physical-device acceptance. No fabricated participant results or blanket A grades are assigned. The improved candidate is available locally; physical-device and player qualification remains open.

## Changes made

- Replaced the browser's PNG payload with high-quality WebP, preserving every image's dimensions and exact alpha. PNG masters remain in `art-source/runtime-png/`. The runtime art is 13.03 MB in decimal units, versus 68.73 MB before this pass; the new total includes an additional state-pose sheet. The social preview remains a published PNG but is not a gameplay download.
- Fixed hedge arches that turned their openings toward the viewer. Front faces and end caps now retain their course orientation. Wide hedge covers no longer grow taller simply to fill a collision footprint. Collision geometry and exit clearance are unchanged.
- Added aligned side/rear listening, investigation, searching and charge poses. Actual stops use the authored poses; movement retains the distance-driven gait, with pursuit lean and distance-driven wheel hubs. Four-view hysteresis, grounded feet and reduced-motion handling remain.
- Added a 0.65-second fresh sight/sound acquisition interval, so existing track awareness cannot cause an instant distant chase. Breaking contact drains acquisition; deliberate proximity and ongoing pursuit remain dangerous. Close capture now rechecks solid cover. Updated the record ruleset so older and newer pursuit rules are not compared as equivalent runs.
- Simplified the next required action to familiar verbs and objects: find the bell, ring it, stamp the log, sign the release, collect the key, open the drain and escape. Saved checks remain distinct from optional bonuses.
- Remembered movement/look/chip/cover lessons separately for keyboard, controller and touch. Switching input devices cannot hide an unfamiliar device's lessons; returning to a learned device restores its mastery. Beside a usable object, its immediate action takes priority over basic movement lessons even after a device switch.
- Rebuilt compact menu, pause, key-binding and result presentation with larger text and action targets. Capture advice and the next challenge are readable instead of miniaturized. Shared pause geometry fixes the mismatch between the visible button and its clickable bottom edge. Long binding names, reset and Back are exercised through real pointer/key events.
- Replaced the unhelpful “beat the exact tie by 0.01 seconds” result suggestion with the next available mastery target. Existing equivalent-rule records, quick retry, rehearsal isolation and optional rewards are retained.

## Every remaining action

“Engineering verified” does not close a separate human criterion. The complete area-level A gates remain those in `a-grade-remaining-actions-2026-09-26.md`.

| Actions | Engineering outcome | Qualification still required |
| --- | --- | --- |
| A-QA-1 | Verified. Both previously unsuccessful Eastern Exception scenarios have ordinary-input victories. The failed shed strategy detoured toward Joe; skipping the optional bonus and scouting/luring preserves a viable path. Relentless drain succeeds with a route that accounts for Joe's position. Failed logs remain available. | None for this engineering action; human completion is a separate gate. |
| A-QA-2 | Frozen-source runner validates each child's hash; 18/18 final routes pass. Collision approaches, both filing paths, retry/rehearsal and records have regression coverage. | Physical-device/player release gates and public deployment; do not publish an “all A” claim before external gates. |
| A-ART-1/2 | Corrected arch orientation/side thickness, hedge scaling and state art; eight zones × four headings reviewed. Existing water, floodlight, maintenance, range and exit landmarks retain distinct silhouettes and lighting. | Human landmark recognition and art approval. |
| A-VIS-1/2 | Reviewed threats, cover, guidance, interactions, filing, pause and results at four sizes; expanded grayscale/protan/deutan diagnostics to eight critical states. Required meaning has text/shape cues. | Timed object/lane recognition and direct accessibility feedback. |
| A-UI-1/2 | Plain first-exposure verbs; compact menus/results/bindings; long-key and actual pointer hit checks; gameplay ownership and touch filing regressions. | Physical device navigation and uncoached next-action comprehension. |
| A-ANIM-1/2 | Travel-driven gait/bob/hubs; stopped state poses in side/rear views; moving lean, ground anchors and hysteresis. The existing front animation remains. | Human state recognition and physical-device motion comfort; four discrete directions remain part of the 2.5D design. |
| A-CTRL-1/2 | Existing camera-relative inputs, presets, paused previews and interruption cleanup retained and regression-tested. Pause hit geometry corrected. | Physical mouse/controller/touch comfort, disconnect, rotation and suspension on the target devices. |
| A-LOOP-1/2 | Clear check/access/escape instructions, permanent checks and optional bonuses; all three station tactics retained. No-bonus routes provide completion evidence without optional backtracking. | Uncoached explanation/completion and whether travel feels worthwhile. |
| A-LEARN-1/2 | Progressive demonstrated mastery now tracks each device separately; skip, replay and first-miss recovery remain covered. | Observe the first three minutes with new players and later return visits. |
| A-NAV-1/2 | Physical approach regressions plus oriented arches correct misleading side-view openings; optional Route Thread and Listen/map recovery retained. | Familiar-player navigation with the overlay hidden. |
| A-AI-1/2 | Controlled sight/sound acquisition, contact loss, proximity and solid-cover capture tests; source-aware HUD, capture review and rehearsal retained. | Human explanation of captures and feasible counterplay in observed sessions. |
| A-PACE-1/2 | Bounded local phase logs and successful route traces retained; earned clean-break relief and purposeful station signals remain. Fresh acquisition now gives a consistent warning interval. | Annotated human runs; logs alone do not measure boredom, tension or comfort. |
| A-REWARD-1/2 | Once-only and inventory/filing/retry regressions; plain check feedback; completion paths with bonuses deliberately declined. No unsupported numerical rebalance. | Observe understood benefits, declined risks and reward satisfaction. |
| A-REPLAY-1/2 | Compact variant briefings give concrete plans; route strategies differ by variant/exit. Tied-record results suggest a mastery goal instead of a trivial hundredth-second target. | Returning-player strategy and voluntary retry measurements. |
| A-PERF-1 | Verified compression, lossless-alpha checks, cold-load budget and bounded retry/fallback. Final isolated cold readiness is 12.825 seconds at simulated 10 Mbps/150 ms. | Real-network variation remains part of physical-device qualification. |
| A-PERF-2 | 60-session regression plus 200-session resource soak and heap comparison. Asset caches, DOM nodes and listeners remain constant. | Physical modest laptop/phone frame pacing and comfort. |
| A-FUN-1/2 | The game and local diagnostics are prepared for the existing anonymous study protocol; technical friction found in this audit was fixed. | Actual ten-player baseline, fresh-cohort retest, and returning-player study. No outreach or participant results are invented. |

## Resource investigation

The 200-session investigation held 110 atlas entries, 2 horror-overlay entries, 236 DOM nodes and 87 event listeners throughout sampled sessions. Heap snapshots at sessions 40 and 200 attribute approximately 884,692 additional bytes to compiled code, while ordinary object size changes by only 56 bytes, arrays shrink by 568 bytes, and closure/string sizes stay unchanged. This supports browser compilation warmup rather than retained game-session objects in this workload. It is not proof against every possible leak or a substitute for a full physical-device run.

Evidence: `output/a-grade-closure/soak/verification.json` and `soak-investigation/comparison.json`. The snapshot investigation precedes the final compact-menu changes; those changes are rechecked by the final lifecycle regression.

## Final verification record

Completion automation earns checks, access items and exits through ordinary keyboard/mouse input. A read-only test planner knows collision geometry and Joe's position; it does not teleport actors, grant prerequisites or alter the simulation. These runs establish reproducible completion paths, not novice comprehension or enjoyment. Controlled feature fixtures and screenshots are labeled separately.

- Final frozen matrix: **18/18 passed**, all three variants × two exits × three pressures on the hash above. Evidence: `output/a-grade-closure/release-matrix/verification.json`, with route events, local phase exports and victory captures in each scenario directory. All prerequisites were earned by input. Earlier failed or incomplete runs remain available; `final-matrix/` also passed 18/18 immediately before the final interaction-lesson priority fix.
- Final focused regression: **11 acceptance groups**, including 60 lifecycle sessions; **6 causal/input-priority groups**; **6 core-loop groups**; and **42 UI captures with actual pointer/remapping checks** passed. Evidence: `acceptance/verification.json`, `causal/verification.json`, `ui/verification.json` under `output/a-grade-closure/`, plus the core-loop report.
- Preserved regression coverage passed: experience 11 groups (including 63 collision approaches), gameplay polish 12, exit preparation 7, shed clearance 36 victories and next-experience 5. The final one-line lesson-priority change was subsequently checked by the causal, core-loop, UI, lifecycle and full route suites.
- Visual review: eight zones × four headings; 2560×1600, 1280×720, 800×600 and 844×390; maximum UI scale/long bindings; and eight critical states in original, grayscale and approximate protan/deutan views. The final station diagnostic confirms the interaction prompt owns the immediate action. These transforms supplement direct accessibility testing.
- Static release validation passes: 53 referenced images, no missing/unreferenced assets or source masters shipped, and 90 parsed action fixtures. `git diff --check` passes.

- Isolated loading: **12.825 seconds** cold course readiness at simulated 10 Mbps/150 ms, within the unchanged 15-second target (previous baseline approximately 58 seconds). Transient failure recovered on attempt 2 in 13.565 seconds; permanent failure reached the usable fallback on attempt 3 in 13.865 seconds. No page errors. Evidence: `output/a-grade-closure/loading/verification.json`.
- Official skill client replay: completed, screenshot inspected, **57/57 readiness checks passed**, no reported browser errors. Its gameplay sample averaged 3.39 ms render time with 3.9 ms p95. Evidence: `output/a-grade-closure/official/`. These are headless render costs, not physical-device presented frames.

- Free-look controls: all seven functional groups reached their assertions successfully (camera-relative movement/aim, mouse lock/pause, synthetic controller disconnect, simultaneous touch cancellation, both exits). The combined full-suite run then **failed** its short render gate at 18.3 ms p95. That failure is preserved in `output/a-grade-closure/turn-investigation/initial-full-suite-failure.json`; it is not relabeled as a pass.
- Isolated performance investigation: the unchanged 60-frame sample subsequently passed at 11.6 ms p95. A new **600-frame** continuous-turn sample passed the unchanged whole-sample budgets at **5.73 ms average / 12.5 ms p95**, with **73.3 ms maximum**. All 600 samples are retained in `turn-investigation/extended/all-frame-timing.json`. This confirms a passing longer render sample, but the variability and isolated long frames remain limitations. Neither this nor the official replay qualifies real-device frame pacing.

The game remains running at `http://127.0.0.1:4187/`. Changes are local and uncommitted; this pass has not replaced the GitHub Pages deployment. No identified completion blocker remains in the automated routes, but the pending human/device acceptance rows above are not marked complete.

The human/device protocol is `qa/playtest-protocol-2026-09-26.md`. This is the remaining path to measured A grades; automated successes cannot establish enjoyment or voluntary replay.
