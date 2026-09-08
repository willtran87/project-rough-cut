# Rough Cut gameplay experience review

Date: 2026-09-08. Scope: identify problems and worthwhile enhancements in the current browser game. No gameplay rules were changed.

## Evidence and limits

- Reviewed current gameplay code, onboarding, pursuit, station actions, optional reviews, retry behavior, and existing acceptance records.
- Ran the installed develop-web-game Playwright client with `web/test-actions/release-hardening-deep-route.json`. Ordinary input reached Audit Bell, completed check 1, and continued into Irrigation Mud at course progress 223/720. This was not a complete escape playtest.
- The standard replay passed 57/57 readiness checks, loaded all 48 images, and generated no browser error file. Reported canvas render work was 4.05 ms average and 5.4 ms p95. Manual stepping does not establish real device frame pacing.
- Replayed the same inputs for visual inspection at 2560x1600, then inspected the resulting state at 1280x720 and 800x600. No teleportation or internal gameplay-state injection was used; the game's existing time-stepping hook advanced the simulation.
- An initial high-resolution sample failed the frame-budget check with too few rendered gameplay frames for a strong conclusion. A separate 181-frame Tee sample also failed it: 10.02 ms average zone render work, 25.1 ms p95, 17 long frames. This is a profiling lead from headless automation on a shared machine, not proof of a universal performance regression.
- Screenshots and JSON evidence are in `output/gameplay-review-2026-09-08/` (ignored local artifacts). The file named `briefing-2560.png` actually captured the loading menu; do not cite it as visual evidence of the briefing.
- Human controller, touch, full-run, and hardware-soak acceptance remain unverified in this review. Fun and frustration ratings require human sessions.

## Prioritized opportunities

### 1. Make Joe's detection match the counterplay the game teaches

**Confirmed code mismatch.** `web/game.js:26594` defines visible contact using an unblocked line and distance. There is no facing-angle condition in that sight predicate. Yet `web/game.js:26869` tells the player to move when the mower turns away. Turning may eventually increase distance or expose cover, but turning alone does not remove sight detection.

**Player impact:** a player attempting to sneak behind Joe can reasonably feel that he has eyes in the back of his head. This weakens the satisfaction of reading and outmaneuvering him.

**Improvement:** first make the instruction truthful about distance and cover. Then prototype a readable forward sight cone, weaker rear awareness, and existing sound/trail detection behind him. Preserve close-contact danger. Evaluate the mechanical prototype against current difficulty before adopting it.

**Acceptance:** at the same distance, surface, and noise level, the demonstrated safe action must actually lower exposure. Players should correctly explain why Joe noticed them after an encounter.

### 2. Reduce reading pressure and preserve legibility on small displays

**Visually observed.** The menu exposes orders, changes, stamps, shot-book symbols, Echo records, and Overtime before play. In gameplay, the objective panel, composure, Risk Premium, Delivery timer, projected grade, map, captions, and action rail compete for attention. At 800x600, many labels become extremely small; the critical bottom instruction also loses clarity under the scanline treatment. Geometry fitting inside the screen is not sufficient evidence of readability.

The desktop briefing's source (`web/game.js:50482`) similarly combines story, objectives, exits, evidence/appeals, shot recovery, stealth, and scoring. An optional practical golf lesson already exists, but the reviewed route passed y=80 and recorded it as `skipped_optional`, so the walkthrough can bypass that lesson entirely.

**Improvement:** teach move -> divert -> break contact through short contextual beats. Keep objective, threat, and immediate action prominent; defer mastery statistics until earned or requested. Establish a minimum displayed text size after canvas scaling, and keep scanlines away from critical text. Reuse the existing practice lesson rather than add another tutorial system.

**Acceptance:** first-time players can identify their next action without consulting the dossier. At 800x600 they can read the action, threat, and escape direction at normal viewing distance.

### 3. Give the three mandatory checks different decisions

**Confirmed shared structure; repetition is a design hypothesis.** `web/game.js:1705` authors the same three stations across orders. Their art, sound, position, and signal duration differ, but each uses a loud activation followed by a named cover breakaway. Variant definitions mainly change supporting objective locations, reviews, and Joe's opening patrol.

**Improvement:** retain the clear route and existing assets while giving each station one distinct challenge. For example: the bell teaches diversion and retreat; the log offers a quiet timed interaction versus a fast loud action; the final review asks the player to choose between two escape lanes based on Joe's location. Prototype one station first to avoid expanding the rule burden.

**Acceptance:** players describe three different tactics rather than one repeated procedure. Compare second- and third-run enjoyment before adding more course length.

### 4. Make optional Sprint Reviews a deliberate, worthwhile risk

**Confirmed mechanics.** `web/game.js:23755` activates a review automatically when the player enters its radius. `web/game.js:23666` redirects Joe, awards Delivery credit, restores one ball only if there is capacity, and shortens Final Filing. The filing reduction is just 0.18 seconds per review (`web/game.js:1788`); all three save 0.54 seconds.

**Player impact hypothesis:** a survival-focused player with full pockets may receive little immediately useful benefit while accidentally triggering a noisy event. The score incentive is more compelling to established mastery players.

**Improvement:** make commitment unmistakable through an explicit interaction or a clearly separated route threshold with a visible consequence preview. Trial a choice between a ball refill and a useful temporary course advantage. Preserve score rewards for mastery.

**Acceptance:** players can predict the consequence before crossing and explain why they chose the risk. Record full-inventory review uptake and accidental activations.

### 5. Let players practice the mistake that ended their run

**Confirmed reset behavior; frustration needs human validation.** Quick retry already skips the briefing and supplies specific capture coaching, which is valuable. However, `web/game.js:63199` still calls `resetFirstHole`, and `web/game.js:13489` resets the player to the Tee and clears checks and collected items.

**Improvement:** add an optional, unranked rehearsal of the failed encounter with an authored safe setup. Keep full-run rematches and their scoring intact. This targets learning without automatically weakening the main game's stakes or treating permanent checkpoints as an established need.

**Acceptance:** measure time from late capture to practicing the failed decision again, subsequent improvement, and whether players choose another ranked run. Do not claim late-run difficulty is unfair without completing representative full runs.

### 6. Verify high-resolution frame consistency before adding effects

**Observed automated failure, limited scope.** The standard replay passed its frame budget; the separate high-resolution Tee sample did not. The evidence does not isolate renderer cost, browser configuration, startup caching, or host contention.

**Improvement:** profile a normal-speed, warmed-up 2560x1600 session on representative hardware. If reproduced, reduce expensive compositing and cache static work before adding visual effects. Preserve readable danger cues when reducing atmosphere.

**Acceptance:** record p95/p99 frame times during walking, pursuit, and station effects, plus the existing 10-15 minute soak. Do not report simulated 60 FPS as physical-device proof.

## Additional small inconsistency

`web/game.js:26750` multiplies the entire signed detection gain by Joe Pressure, including negative decay. Consequently STEADY also makes detection clear more slowly and RELENTLESS makes it clear faster under otherwise identical conditions. Consider applying difficulty scaling only to positive accumulation, or explicitly documenting and testing the intended recovery behavior. This is a source-level finding, not a demonstrated cause of player frustration.

## Recommended implementation sequence

1. Correct misleading stealth advice and improve critical text legibility.
2. Simplify first-run information and make review commitment intentional.
3. Human-test the existing loop, including full escapes and late failures.
4. Prototype one differentiated station and one optional failed-encounter rehearsal.
5. Broaden only the changes that improve comprehension, perceived fairness, and voluntary replay.

Preserve the original horror-comedy identity, readable station warnings, explicit failure coaching, and recoverable pursuit. These are useful foundations for the changes above.
