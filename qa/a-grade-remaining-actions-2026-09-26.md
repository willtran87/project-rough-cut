# Rough Cut: remaining actions to reach A

Current execution plan: [18 next actions after the closure pass, September 27](a-grade-next-actions-2026-09-27.md). Use that plan for new work; this document retains the original action IDs and acceptance history.

Updated September 26, 2026 after the implementation pass. This acceptance checklist tracks 30 actions across all 15 review areas, including completed engineering work. It refines the [original 45-item plan](a-grade-action-plan-2026-09-26.md), using the [implementation report](a-grade-implementation-2026-09-26.md) as its baseline. Existing features should be refined and validated, not rebuilt merely to check another box.

The checklist below preserves the acceptance requirements. Current implementation and evidence are recorded in [the closure report](a-grade-closure-2026-09-26.md); many engineering steps are now implemented, while human/device criteria remain pending. No new grades are assigned by this document. An area reaches A when its engineering work and its acceptance evidence pass. Numerical targets are proposed project criteria, not universal industry standards. Preserve the nighttime look, four-direction camera-relative movement, permanent checks, optional rewards and both reachable exits.

Priority: P0 = completion, clarity, controls or major performance barrier; P1 = polish and acceptance; P2 = replay refinement after first-session usability. Work types are implementation, automated/visual QA, physical-device QA and human study; these describe responsibilities, not people already assigned.

## 1. Completion reliability — P0

Original items: QA-01/02/03.

- [x] **A-QA-1 — Resolve the two unsuccessful scenarios.** Reproduce Eastern Exception → shed → Standard and Eastern Exception → drain → Relentless. Record the route, Joe's position, detection cause, warning time, available counterplay and each collision recovery. Classify failures as game defects, unfair encounters or test-player mistakes; correct the relevant cause. Do not lower difficulty just to pass the bot or discard failed recordings. Verified ordinary-input victories and preserved earlier failed tactics are documented in the closure report.
- [ ] **A-QA-2 — Qualify one frozen build.** Run all 18 variant/exit/pressure combinations on the same source hash, earning prerequisites through ordinary inputs. Preserve the 63 approach checks, 36 shed-completion cases and filing/retry/rehearsal/save regressions. After the other release gates pass, deploy that exact source and smoke-test both public exits, assets and save compatibility.

**A gate:** 18/18 scenarios have reproducible successful completion paths on one candidate; no unexplained browser errors, soft locks, duplicated rewards or rehearsal record leakage. Success across different revisions does not satisfy this gate. A stealth-game capture is not itself a defect, but the completion evidence must be repeatable and failures understood.

## 2. Art direction and identity — P1

Original items: ART-01/02/03.

- [ ] **A-ART-1 — Correct the remaining prop inconsistencies.** Fix oversized/heavy side-facing hedge billboards without exposing false openings or weakening physical cover. Review every runtime prop's scale, transparency, outline, material and ground anchor against the visual specification; capture all supported viewing directions.
- [ ] **A-ART-2 — Make landmarks memorable.** Review the opening, water, maintenance, old green, range and exits as distinct places. Strengthen weak silhouettes and localized lighting only where recognition fails. Keep the shed doorway and drain approach clear.

**A gate:** No unresolved asset defect in the prop/view checklist; at least 8/10 new testers recognize visited zones from unlabeled screenshots, while the nighttime mood is preserved.

## 3. Visual readability — P0

Original items: VIS-01/02/03.

- [ ] **A-VIS-1 — Finish the full-scene hierarchy audit.** Inspect Joe, routes, cover edges, required objects and optional rewards in bright/dark lighting, chase, fog and near-obstacle views. Reduce decorative interference where needed; keep immediate danger and usable objects strongest.
- [ ] **A-VIS-2 — Validate text and non-color cues everywhere.** Extend grayscale/protan/deutan checks beyond the opening to every critical gameplay/menu state. Check actual rendered text and clipping at 2560×1600, 1280×720, 800×600 and 844×390, including maximum UI scale. Replace or suppress tiny redundant labels; retain a readable essential instruction elsewhere.

**A gate:** 9/10 testers identify the next usable object and an open movement lane within five seconds. No essential label clips, no required meaning depends only on color, and smallest-screen critical instructions meet the visual specification's rendered-size target.

## 4. HUD and interface — P0

Original items: UI-01/02/03.

- [ ] **A-UI-1 — Finish first-exposure language.** Pair workplace terms with familiar actions such as “Ring bell,” “Collect key” and “Escape.” Audit simultaneous lesson, threat, check, bonus, blocked-exit and filing messages; preserve one primary next action.
- [ ] **A-UI-2 — Stress-test every screen and input path.** Cover menu, settings, bindings, pause, results and rehearsal with long remapped labels, maximum text size, controller prompts and simultaneous touch controls. Fix unreachable actions, cramped targets, stale device prompts and incorrect focus/back behavior.

**A gate:** No clipping or conflicting critical instructions in the state matrix; every menu can be entered and exited with each supported device; 9/10 testers correctly state the immediate next action.

## 5. Character animation — P1

Original items: ANIM-01/02/03.

- [ ] **A-ANIM-1 — Finish locomotion synchronization.** Tie mower-wheel rotation to travel; verify stride, wheel contact, debris and locomotion audio at stops, slow movement, starts, turns and pursuit. Retain the existing distance-driven walk/bob and direction hysteresis. Add intermediate turn poses only where recordings show a visible snap.
- [ ] **A-ANIM-2 — Author readable state poses in every direction.** Make patrol, listening, investigation, searching and charging distinct in side/rear as well as front views. Check reduced-motion presentation and near-camera cropping.

**A gate:** Recorded approach/orbit/turn/stop sequences show no obvious sliding, floating, direction chatter or mower clipping; 8/10 testers distinguish calm, suspicious and chasing without HUD text.

## 6. Movement and camera — P0

Original items: CTRL-01/02/03.

- [ ] **A-CTRL-1 — Tune on physical devices.** Select and record actual mouse/keyboard, controller and touch hardware. Measure comfort and response independently; tune default sensitivity, stick dead zone/curve and touch look while retaining Standard, Calm and Fixed View presets.
- [ ] **A-CTRL-2 — Complete the interruption matrix.** Physically test narrow turns, diagonal sliding, quick turns, rear glance, aim/turn/release, pointer-lock loss, focus loss, controller disconnect, phone rotation and suspend/resume. Verify category reset and preview do not move the live player or leave held input behind.

**A gate:** No stuck-input or camera-jump defect; correct movement and aim at every heading; at least 8/10 testers rate predictability and comfort 4/5 or higher on their tested device. Synthetic input alone cannot close this gate.

## 7. Core gameplay loop — P0

Original items: LOOP-01/02/03.

- [ ] **A-LOOP-1 — Validate the win condition without coaching.** Test whether players understand “three checks → one exit access item → escape.” Fix the specific misunderstood step through world/HUD feedback; make it clear that missed optional bonuses do not erase saved checks.
- [ ] **A-LOOP-2 — Remove low-value travel and redundant decisions.** Review complete routes for unnecessary backtracking, compulsory idle periods and repeated actions. Preserve the three distinct station tactics: planned retreat, quiet stamp and remote diversion. Shorten weak connections or give them a useful observation/choice without adding mandatory prerequisites.

**A gate:** 8/10 new players explain the win condition within 60 seconds; 7/10 finish Standard within three attempts without instructions; each station produces a recognizable tactical decision.

## 8. Onboarding — P0

Original items: LEARN-01/02/03.

- [ ] **A-LEARN-1 — Test the opening three minutes.** Observe movement, looking, a distraction and cover use without coaching. Fix the moment of failure with one contextual cue or clearer practice setup; verify that lessons retire only after the intended action is demonstrated.
- [ ] **A-LEARN-2 — Verify skip, recovery and return visits.** Check skipped lessons, a missed chip, replayed lessons, fixed-view controls, changed input device and returning players. Prevent stale mastery from hiding an essential unfamiliar device instruction; keep optional practice visibly optional.

**A gate:** 8/10 first-time players demonstrate the four skills within three minutes without coaching. Skipping does not block the first check; returning players avoid repeated mastered instructions and can replay help deliberately.

## 9. Level navigation — P0

Original items: NAV-01/02/03.

- [ ] **A-NAV-1 — Review plausible off-route approaches.** Walk every station, access item and exit from both sides, after detours and during pursuit. Correct false visual gaps, stale waypoints and cues that point into geometry; confirm collision recovery temporarily outranks the distant destination.
- [ ] **A-NAV-2 — Validate navigation without the overlay.** Ask familiar players to navigate by landmarks with Route Thread hidden. Strengthen unclear signposting, and test immediate recovery through Listen/map on every input device.

**A gate:** Mandatory collision approaches pass; nobody remains lost or trapped over 30 seconds without an understandable recovery cue; 8/10 returning testers navigate a familiar section using landmarks.

## 10. Stealth and enemy clarity — P0

Original items: AI-01/02/03.

- [ ] **A-AI-1 — Build a causal encounter review.** Exercise sight, proximity, sound, tracks, movement wake and station signals. Compare the simulation's cause/timing with Joe's pose, audio and HUD. Separate true acquisition, investigation and remembered position; fix misleading feedback.
- [ ] **A-AI-2 — Make captures explainable and recoverable.** Review each suspicious/chase/capture transition for a perceptible warning and feasible response, except deliberate contact with Joe. Tune the specific encounter when counterplay is absent. Confirm defeat names the decisive cause and rehearsal recreates the situation well enough to practice.

**A gate:** Cause/transition assertions match feedback; no reviewed unavoidable capture from an unannounced transition; 8/10 testers explain their capture and a plausible counteraction.

## 11. Encounter pacing — P1

Original items: PACE-01/02/03.

- [ ] **A-PACE-1 — Annotate complete human and automated runs.** Use local phase logs plus recordings to locate repeated danger stacking, empty travel and idle stretches over ten seconds. Distinguish purposeful observation/hiding from confusion or inactivity; the log alone cannot measure boredom.
- [ ] **A-PACE-2 — Tune an opening, escalation and finish for each variant.** Adjust patrol timing, signals, cooldowns and earned relief only from identified problems. Give successful counterplay usable breathing room and prevent optional events from repeatedly interrupting required interactions.

**A gate:** Every route has observable tension and recovery; no unexplained forced idle stretch over ten seconds without a useful decision; 8/10 testers rate pacing at least 4/5.

## 12. Rewards and progression — P1

Original items: REWARD-01/02/03.

- [ ] **A-REWARD-1 — Make benefits and payoffs unmistakable.** Audit the before/after message for every optional action. Show its cost/risk before commitment and exact benefit afterward. Refine short, distinct visual/audio feedback for first mastery and escape without locking out movement or interaction.
- [ ] **A-REWARD-2 — Rebalance from observed choices.** Record which rewards players ignore, misunderstand or feel forced to take. Adjust benefit, travel cost or danger where justified; rerun once-only, full-inventory, cancellation and retry exploit checks.

**A gate:** 8/10 testers explain an earned reward and an optional risk they declined. Rewards apply exactly once as advertised, and a no-bonus completion still feels satisfying in the study.

## 13. Replayability — P2

Original items: REPLAY-01/02/03.

- [ ] **A-REPLAY-1 — Ensure variants change the plan.** Compare successful tactics across all three variants. Improve briefings, patrol/access placement or route choices where players repeat the same plan without thinking. Retain a small set of existing-skill mastery goals rather than introducing repetitive currency collection.
- [ ] **A-REPLAY-2 — Make the next attempt purposeful.** Test whether the results screen presents one understandable next challenge, quick retry and a full-run option after rehearsal. Preserve equivalent-rule records. Revisit after several days to test remembered controls and tactical motivation.

**A gate:** Returning players describe a genuinely different plan for another variant; at least 7/10 voluntarily choose another run when stopping is equally easy and can name a mastery/tactical reason. Do not use forced streaks or penalties to manufacture retry counts.

## 14. Performance and loading — P0

Original items: PERF-01/02/03.

- [x] **A-PERF-1 — Reduce the measured cold-start cost.** Profile the current 65.54 MB runtime payload and approximately 58-second course readiness at simulated 10 Mbps/150 ms. Reduce bytes required before play through appropriate compression, sizing and safe staged loading; ensure required gameplay art is ready before it is needed. Retain bounded retry/fallback behavior. Proposed target: first playable course within 15 seconds at that profile, with no missing threats/cover or disruptive mid-run stalls. Record any justified target revision explicitly.
- [ ] **A-PERF-2 — Qualify sustained real-device performance.** Profile startup, a complete run and the heaviest chase/turn on the agreed desktop, modest laptop and phones. Measure presented frames, update/render time, GC and retained resources. Extend the soak beyond the current rising 20-session heap sample; fix retained objects/caches/listeners where growth is demonstrated.

**A gate:** Supported 60 FPS devices meet approximately 16.7 ms p95 presented-frame intervals with separately documented transition exceptions; lower tiers have explicit stable targets. After warmup, retained resources plateau across repeated sessions, without unexplained monotonic growth. Headless render timing is supplementary evidence.

## 15. Fun and voluntary replay — P0 baseline, P1/P2 follow-up

Original items: FUN-01/02/03.

- [ ] **A-FUN-1 — Run the uncoached ten-player baseline.** Use the existing anonymous study protocol. Record time to first skills/check, confusion, assistance, captures, completion, enjoyment, pacing and voluntary retry. Preserve negative feedback; record actual device and source revision.
- [ ] **A-FUN-2 — Fix observed friction and retest.** Rank issues by severity and frequency, fix the top three and repeat with a fresh ten-player cohort. Run returning-player sessions after a few days to separate lasting mastery/tactical appeal from novelty.

**A gate:** After fixes, at least 8/10 new testers rate enjoyment 4/5 or higher; at least 7/10 choose a voluntary retry. Returning players identify a reason to continue beyond novelty. Small cohorts guide design; they do not prove broad retention or that a game is universally fun.

## Execution order and dependencies

1. **Remove blockers and establish evidence:** A-QA-1, A-AI-1/2 and A-NAV-1; start A-PERF-1/2 and recruit/schedule the human/device studies through the project owner. No outreach has been sent by this document.
2. **Make the first session clear:** A-VIS-1/2, A-UI-1/2, A-CTRL-1/2, A-LOOP-1 and A-LEARN-1/2. Run A-FUN-1 on the identified baseline; record defects instead of hiding them through moderator coaching.
3. **Finish visual and gameplay polish:** A-ART-1/2, A-ANIM-1/2, A-LOOP-2, A-NAV-2, A-PACE-1/2 and A-REWARD-1/2, guided by the observed friction.
4. **Validate replay and improvement:** A-REPLAY-1/2 and A-FUN-2 after first-session gates pass.
5. **Qualify and release:** A-QA-2 on one frozen candidate after all relevant area gates pass. A later game-code change invalidates affected evidence and requires proportionate rechecking.

## Ticket completion record

For each action record: status (open/in progress/implemented/verified), source hash, changed files, acceptance results, screenshots or recordings, participant/device identifiers where applicable, remaining defects and verifier/date. Mark the checkbox only when the action's work and required evidence are complete. Do not substitute synthetic play, an existing 57-check readiness pass or a favorable screenshot for the separate human and physical-device gates.
