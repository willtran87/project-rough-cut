# Rough Cut: action plan for an A-grade vertical slice

Created September 26, 2026 from the latest area-by-area review. Baseline: the local `codex/horizontal-free-look` build and the September 13 acceptance results. This is a proposed implementation backlog; unchecked items are not delivered work.

Implementation update: see [the item-by-item implementation and qualification report](a-grade-implementation-2026-09-26.md), [visual direction](../design/visual-direction-2026-09-26.md) and [human/device study protocol](playtest-protocol-2026-09-26.md). Unchecked items now include partially implemented work with open acceptance criteria; consult that report rather than interpreting every unchecked box as untouched.

Current execution backlog: [18 next actions across all 15 areas, September 27](a-grade-next-actions-2026-09-27.md), based on the latest closure evidence. The [30-action checklist](a-grade-remaining-actions-2026-09-26.md) retains intermediate scope and acceptance history. Use the September 27 plan for new work.

## Scope and acceptance rules

Preserve the game's nighttime course, workplace-horror identity, horizontal free look, and understandable core loop: three permanent checks, one exit access item, then filing. Preserve both accessible exits and the existing completion regressions. Improve the current vertical slice before adding another course or more progression systems.

An A requires a strong implementation and evidence that players understand and enjoy it. The numerical targets below are proposed project acceptance targets, not universal industry standards. Establish a baseline, test the changes, and record any target changes explicitly. A passing automated test alone cannot award an A for fun, pacing, comfort, or replayability.

Priority:

- **P0:** Completion, comprehension, or control problems. Fix before adding content.
- **P1:** Quality improvements needed for the A-grade slice.
- **P2:** Replay depth after the first-session experience meets its targets.

## 1. Art direction and identity — B+ → A

- [ ] **ART-01 · P1:** Create a short visual specification covering palette, light sources, material treatment, pixel density, object scale, and contrast. Annotate the approved opening, water, maintenance, and exit views.
- [ ] **ART-02 · P1:** Audit every runtime prop against that specification. Correct obvious scale/style mismatches, inconsistent outlines, transparency fringes, and ground anchors. Inspect objects from every supported viewing direction.
- [ ] **ART-03 · P1:** Give each course zone a recognizable silhouette and lighting landmark. Strengthen the arrival at the shed and drain while keeping their approach lanes clear.

**A evidence:** A screenshot review of all zones and cardinal headings finds no unresolved asset defects. At least 8 of 10 first-time testers recognize previously visited zones from unlabeled screenshots. The brighter readability treatment still preserves the intended nighttime mood.

## 2. Visual readability — B− → A

- [ ] **VIS-01 · P0:** Establish a clear visual hierarchy: immediate danger and usable objects first, traversable ground and cover second, decorative detail last. Separate these through value, edges, shape, and restrained lighting, not color alone.
- [ ] **VIS-02 · P0:** Reduce grass, fog, foreground clutter, and texture contrast specifically where they obscure routes, collision boundaries, Joe, or interaction targets. Keep cover visually consistent with its physical footprint.
- [ ] **VIS-03 · P1:** Define minimum rendered text sizes at each supported viewport. Increase or suppress tiny labels instead of shrinking essential information to fit. Verify grayscale and common color-vision simulations.

**A evidence:** At least 9 of 10 testers identify the next usable object and an available movement lane within five seconds in representative scenes. No essential label clips or becomes illegible at the supported smallest size; no required meaning relies on color alone.

## 3. HUD and interface — B → A

- [ ] **UI-01 · P0:** Audit every gameplay information state: quiet exploration, aiming, chase, check activation, cover hold, blocked exit, and filing. Assign one primary instruction to each and defer lower-priority messages.
- [ ] **UI-02 · P1:** Shorten themed terminology on first exposure. Pair it with a familiar action: for example, “Field check: ring bell.” Show detail on request rather than maintaining multiple explanatory panels.
- [ ] **UI-03 · P1:** Add screenshot/geometry cases for maximum text size, remapped bindings, long labels, controller prompts, and simultaneous touch controls. Make map open/close and pause visually consistent.

**A evidence:** No overlapping or contradictory critical messages in the state matrix. At least 9 of 10 testers can state the immediate next action without opening instructions. Pointer, keyboard, touch, and controller can reach and leave every menu.

## 4. Character animation — B− → A

- [ ] **ANIM-01 · P1:** Match Joe's stride, mower-wheel rotation, debris, and locomotion audio to actual travel speed. Keep feet and wheels grounded during starts, stops, and slow movement.
- [ ] **ANIM-02 · P1:** Add controlled turning transitions or intermediate poses and view-selection hysteresis so tiny bearing changes do not flicker between directions.
- [ ] **ANIM-03 · P1:** Make patrol, listening, investigating, searching, and charging distinguishable by posture and movement. Preserve danger readability when reduced motion is enabled.

**A evidence:** Recorded approach, orbit, turn, chase, and stop sequences show no obvious sliding, hovering, direction chatter, or clipped mower. At least 8 of 10 testers distinguish calm, suspicious, and chasing states without reading the HUD.

## 5. Movement and camera — B+ → A

- [ ] **CTRL-01 · P0:** Run physical mouse, keyboard, controller, and touch sessions. Tune default sensitivity, stick response, dead zone, and touch look independently from measured comfort feedback.
- [ ] **CTRL-02 · P0:** Test narrow passages, diagonal movement, collision sliding, quick turns, rear glance, aiming while turning, pointer-lock loss, focus loss, controller disconnect, and orientation changes.
- [ ] **CTRL-03 · P1:** Refine comfort presets and the paused look preview. Give players a clear route to fixed-view/reduced-motion controls and reliable category reset.

**A evidence:** No stuck-input or camera discontinuity defects in the device matrix. Camera-relative speed and aim remain correct at all headings. At least 8 of 10 testers rate control predictability and comfort 4/5 or higher on their tested device.

## 6. Core gameplay loop — B → A

- [ ] **LOOP-01 · P0:** Make the three-check/access/exit sequence immediately understandable. Keep optional bonuses visually subordinate and preserve saved-check feedback after a missed bonus.
- [ ] **LOOP-02 · P1:** Give each required station a distinct tactical decision using current mechanics: plan a retreat, prepare a quiet approach, or establish a remote diversion. Remove redundant actions and avoid adding new mandatory prerequisites.
- [ ] **LOOP-03 · P1:** Audit each route for empty travel, repeated backtracking, and compulsory waiting. Replace weak stretches with useful observation, a meaningful choice, or a shorter connection.

**A evidence:** At least 8 of 10 new players explain the win condition within 60 seconds. At least 7 of 10 finish a Standard run within three attempts without moderator instructions. Each station creates a recognizable decision beyond following its marker.

## 7. Onboarding — B− → A

- [ ] **LEARN-01 · P0:** Teach movement and look in a safe opening space, then one distraction, then one cover escape. Introduce each instruction at the moment its action is useful.
- [ ] **LEARN-02 · P0:** Detect successful actions and retire their prompts. Provide one specific recovery hint after a failed attempt; avoid repeating the entire tutorial. Preserve skip and replay options.
- [ ] **LEARN-03 · P1:** Use familiar language first and introduce workplace terminology gradually. Make the first optional reward visibly optional before the player approaches it.

**A evidence:** At least 8 of 10 first-time players move, turn, chip, and use cover without coaching in the first three minutes. Players who skip onboarding can still discover controls and complete the first check. Experienced players receive no repeated basic instructions after demonstrating mastery.

## 8. Level navigation — B → A

- [ ] **NAV-01 · P0:** Walk every mandatory approach in all variants and from plausible off-route positions. Correct misleading visual openings and ensure the displayed safe route follows traversable ground.
- [ ] **NAV-02 · P1:** Strengthen zone landmarks, physical signposting, and exit silhouettes so the world explains direction before the map does. Distinguish “toward the goal” from “move this way around the blocker.”
- [ ] **NAV-03 · P1:** Offer a recoverable reduced-guidance mode after players learn the course. Keep critical interaction and hazard feedback available, and let players restore the route immediately.

**A evidence:** All collision-driven approach tests pass. No first-time tester remains lost or trapped for more than 30 seconds without an understandable recovery cue. At least 8 of 10 returning testers navigate a familiar section using landmarks with the route overlay hidden.

## 9. Stealth and enemy clarity — B → A

- [ ] **AI-01 · P0:** Audit every detection transition with its actual cause: sight, proximity, sound, tracks, or a station signal. Remove any mismatch between the simulation, Joe's pose, and player feedback.
- [ ] **AI-02 · P1:** Give non-contact detection a readable escalation and feasible counterplay opportunity appropriate to the threat. Tune suspicious/search/chase transitions using encounter recordings rather than reducing difficulty globally.
- [ ] **AI-03 · P1:** Ensure defeat feedback names the decisive cause and one actionable correction. Rehearsal should reproduce enough of the encounter to practice that correction without affecting records.

**A evidence:** Automated cause/transition cases agree with the HUD. At least 8 of 10 testers correctly explain their capture and name a plausible counteraction. No reviewed encounter contains an unavoidable capture caused by an unannounced state change.

## 10. Encounter pacing — B → A

- [ ] **PACE-01 · P1:** Record complete runs and mark time spent exploring, learning, threatened, chased, hiding, and waiting. Identify repeated danger stacking and low-decision stretches.
- [ ] **PACE-02 · P1:** Tune signal duration, patrol positioning, encounter cooldowns, and earned relief so successful counterplay creates usable breathing room without making Joe irrelevant.
- [ ] **PACE-03 · P1:** Shape an intentional opening, middle escalation, and final approach for every variant. Prevent optional systems from repeatedly interrupting required station or exit interactions.

**A evidence:** Each route has observable tension and recovery phases. At least 8 of 10 testers rate pacing 4/5 or higher. Review any repeated forced idle stretch over ten seconds that offers no useful observation or decision; fix it or document its intentional purpose.

## 11. Rewards and progression — B → A

- [ ] **REWARD-01 · P1:** State an optional action's benefit and risk before commitment. After completion, show exactly what changed: ball gained, signal shortened, filing reduced, or record improved.
- [ ] **REWARD-02 · P1:** Give major achievements a short, distinct visual/audio payoff. Reserve the strongest feedback for first mastery and escape; keep movement and interaction responsive.
- [ ] **REWARD-03 · P1:** Test whether optional choices are worth their danger and travel cost. Rebalance rewards that testers consistently ignore or treat as mandatory; prevent repeat-trigger exploits.

**A evidence:** At least 8 of 10 testers can explain a reward they earned and an optional risk they declined. Rewards apply once and produce their advertised benefit. Players can finish without optional objectives and still receive a satisfying completion result.

## 12. Replayability — B− → A

- [ ] **REPLAY-01 · P2:** Make the three variants demand meaningfully different route or tactic choices. Explain those differences before a run; avoid variation that only moves a marker.
- [ ] **REPLAY-02 · P2:** Provide a small selection of optional mastery goals built from existing skills, such as a clean escape, an alternate exit, or a prepared station sequence. Avoid repetitive currency collection.
- [ ] **REPLAY-03 · P2:** Make the results screen offer one clear next challenge and a quick retry. Preserve equivalent-rule record comparisons and a complete-run option after rehearsal.

**A evidence:** Returning testers can describe a different plan for their next variant. At least 7 of 10 testers voluntarily choose another run when offered an equally easy option to stop, and can name their reason. Evaluate this after the first-run usability gates pass.

## 13. Completion reliability — A− → A

- [ ] **QA-01 · P0:** Automate the full matrix of three variants × two exits × three pressure settings, earning prerequisites through normal inputs. Preserve current collision-approach and filing-interruption tests.
- [ ] **QA-02 · P0:** Add state-lifecycle cases for repeated defeat/retry/rehearsal, pause at interaction boundaries, input disconnect, settings changes, and reload with valid/legacy/malformed saved data. Reload may restart the run, but must preserve valid career data.
- [ ] **QA-03 · P1:** Run repeated sessions and public-build smoke checks. Verify the deployed build identity, asset loading, both exits, and save compatibility against the reviewed source.

**A evidence:** The 18-scenario normal-input completion matrix passes, alongside lifecycle regressions, with no blocking defect or unexplained browser error. No career leakage from rehearsal, incompatible record comparison, duplicated reward, or exit soft lock. Retain evidence for the exact release candidate.

## 14. Performance — B+ → A

- [ ] **PERF-01 · P0:** Establish a named supported-device matrix including a modest laptop, a representative phone, and the main desktop/browser combinations. Record startup, a full run, and the heaviest chase/turn scene.
- [ ] **PERF-02 · P1:** Profile frame presentation, update/render time, texture/cache memory, and garbage-collection stalls. Fix measured bottlenecks; preserve sharp UI and essential threat visibility in adaptive quality modes.
- [ ] **PERF-03 · P1:** Test cold loading on a throttled connection and a 20-run retry/rehearsal soak. Correct failed-load recovery and sustained resource growth; do not infer device FPS from headless render timing.

**A evidence:** On each agreed 60 FPS target device, steady gameplay meets a p95 presented-frame interval of approximately 16.7 ms, with separately documented loading/transition exceptions and no repeated visible gameplay stalls. Any lower device tier must have an explicit stable frame-rate target. After warmup, repeated sessions show no sustained growth in retained game resources. Asset failure recovery is usable.

## 15. Fun and “one more run” appeal — unverified → A

- [ ] **FUN-01 · P0:** Run an uncoached baseline study with ten first-time players. Capture time to first successful action/check, confusion, captures, assistance requests, enjoyment, and voluntary retry. Use optional/local diagnostics without uploading personal data.
- [ ] **FUN-02 · P1:** Rank friction by frequency and severity. Fix the top three observed problems, then repeat the same study with a fresh cohort rather than grading the changes through developer familiarity.
- [ ] **FUN-03 · P2:** Conduct a returning-player session after a few days. Check whether players remember the controls, formulate a new tactic, and still want another attempt once novelty has faded.

**A evidence:** After usability fixes, at least 8 of 10 new testers rate enjoyment 4/5 or higher; at least 7 of 10 choose a voluntary retry; returning players report identifiable mastery or tactical reasons to continue. Document negative feedback as well as successes. Small cohorts provide direction, not population-level certainty or proof of long-term retention.

## Delivery order

1. **Baseline and triage:** FUN-01, CTRL-01, AI-01, PACE-01, PERF-01. Preserve recordings and current completion tests before tuning.
2. **First-session clarity:** VIS-01/02, UI-01, LOOP-01, LEARN-01/02, NAV-01, CTRL-02. Gate: players understand the next action, control the character comfortably, and can make recoverable mistakes.
3. **Visual and tactical polish:** Finish ART, ANIM, VIS, UI, CTRL, NAV, AI, PACE and REWARD work. Gate: visual/device review and representative uncoached sessions pass.
4. **Replay depth:** LOOP-02/03, REPLAY-01/02/03 and FUN-03. Build on the evidence from the first-session gates; do not add content to compensate for confusing fundamentals.
5. **Release qualification:** Finish QA and PERF matrices; run FUN-02 with a fresh cohort; review every area's evidence against its A criteria. Publish only the qualified source revision through the normal release process.

Work that depends on external playtesters or physical hardware stays explicitly pending until that evidence exists. Do not replace it with synthetic input or mark it complete because the implementation is finished.

## Definition of done for each action

- The intended player-visible change is implemented and reviewed in context.
- Relevant automated regressions pass; additional tests address behavior rather than mirror implementation.
- UI/art changes have inspected screenshots at 2560×1600, 1280×720, 800×600 and 844×390, plus applicable physical-device checks.
- Any required human acceptance result is recorded with cohort/device and source revision.
- Documentation states the outcome and remaining limits; no item is awarded an A solely because code was added.
