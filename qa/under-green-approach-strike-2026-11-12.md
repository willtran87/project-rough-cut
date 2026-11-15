# Under the Green — credible attack during an approaching pass

Scope: review items 1, 18, 20, 21, 22 and 41. The user identified Joe's pursuit and tension as the weakest current experience. This pass strengthens a concrete pump/service-passage encounter; it does not declare the whole chapter frightening, balanced or complete.

## Reproduced behavior

The current-source seven-route pursuit audit records actual forward/rear visibility, audibility, separation and attack entries. On the ordinary dry walk, Joe comes within about one metre during the pump exit but never swings. He only begins considering preparation below 1.55 m, then turns while the player walks past. The full route completes in 75.97 s without a dodge. This is a stronger current finding than reusing the original review's obsolete 118 m separation.

The bunker still has a long visual separation: the sampled walking route spends 13.37 s there with no forward or hypothetical rear sighting. Most of that interval remains audible. That is a separate pacing/staging issue to revisit; an audible source flag does not establish that its sound is intimidating. The checkpoint-one audit without retained route knowledge is explicitly a legacy/unobserved restart, not the normal witnessed retry.

Baseline artifacts: `output/under-green/pursuit-review/report.json`. The earlier `anticipation/` subreport is a rejected narrow forecast that left the encounter unchanged, not final behavior.

## Implemented behavior

Joe may prepare before the player reaches the blade when two fresh actual sightings show an approach into his forthcoming sweep. Observed motion expires immediately on lost sight; observations older than 0.2 s and implausible fixture/teleport speeds do not qualify. Stationary or retreating players do not trigger this anticipation. No hidden input or unseen live position supplies the prediction.

The chapter-owned calculation considers the existing turn rate, difficulty-specific windup, and five samples of the actual authored sweep. It requires the projected player's central body region to meet that blade and a clear physical approach. Preparation is bounded to 8 m, but **damage reach is unchanged**. Joe still turns at the existing rate, plants for the full windup, keeps his position and heading throughout the committed swing, and receives his full recovery. There is no lunge, chase-speed increase, teleport or retargeting after commitment.

A visible, audible preparation within 8 m now gets the essential sideways-movement warning above pump-success text. Audio-only warnings retain their short 4 m range; a distant hidden attack does not disclose its state. This is local trimmer feedback, not a new capture rule for other chapters.

## Counterplay and outcome evidence

At the recorded live-route encounter, preparation starts at 6.49 m and 43.267 s. Ignoring it is captured at 44.617 s, at 1.86 m root separation, with verified active blade/body contact and unobstructed contact. The original 0.95 s standard windup and 0.45 s sweep remain unchanged.

Six ordinary-response cases pass: stopping or sidestepping after 0.25, 0.5 or 0.75 seconds. A 0.55-second right step followed by walking clears Joe during recovery. All retain zero water hits, and 84 sampled windup/sweep frames preserve committed position and heading. Stopping beats this swing but does not permanently disable the pursuer.

Seven continuous responsive routes complete: dry walk, wet walk, sprint, observation pauses, optional record, reactive range branches and checkpoint-one with witnessed route memory. The dry walk now uses one visible-warning evasion and still finishes in 75.97 s. Sprint retains its clean escape with no evasion. Additional Steady and Relentless dry routes also complete. These are scripted mechanical results, not unfamiliar-player tension ratings.

The QA pilot needed two corrections exposed by earlier preparation: it must respond to the actual visible/audible warning rather than an arbitrary sub-3 m distance; after passing Joe, it must not return to an already passed ordinary waypoint. It still visits mandatory mechanisms and crossings. The original late-response and return-to-waypoint captures are diagnostic failures, not proof that the encounter is unavoidable. The folded regression's old zero-hit assumption also predated the retained walking/retry keeper hit; it now checks the explicit per-route hit contracts and uses a responsive observation-pause policy.

## Verification

- `verify-under-green-approach-strike.mjs`: live-route capture contact, six delayed responses, commitment, hidden-warning privacy, retry knowledge and seven complete routes.
- `verify-under-green-approach-observation.mjs`: fresh observation permits anticipation; stale, teleport, stationary and retreat cases do not.
- `verify-under-green-approach-strike-browser.cjs`: 15 actual-input cases across 2560×1600, 1280×720, 844×390 and 390×844; keyboard stop/dodge/capture, pause/resume, Gamepad API and CDP touch. Seven rendered geometry inspections have no intersections, and no page errors occur. A newly connected controller is neutralized before movement, matching the existing input lifecycle. This is emulation, not physical-device qualification.
- Existing rules, trimmer-contact, threat-observation and folded-course regressions pass. The installed standard game client passes; its latest screenshot/state were inspected, with stopped released movement and normal vertical-look preference.
- High-resolution, ordinary desktop, landscape and actual touch-context warning captures were inspected. Joe and the warning are visible; portrait retains a free camera, so his extended tool can approach the screen edge. No automatic camera turn was added.

Final evidence: `output/under-green/approach-strike/verified.json`, `observation.json`, `browser.json`, four-size captures and `client/`. The initial browser failure was a test controller connected with a held stick; the existing neutral-on-connect guard correctly suppressed it. The first commitment assertion accidentally included a second attack; it now tracks only the initial strike. A short fixed sidestep initially left the player in Joe's body lane; the final ordinary-input sidestep clears it.

Remaining: broader pursuit sightlines and decision pacing, continuous actor/cover cases, unfamiliar-player recognition and fear, real controller/touch ergonomics and listening. Prior sustained renderer measurements belong to their recorded simulation build; no new sustained performance claim is made for this attack change. Preserve all 44 requirements and the other chapters' distinct controls and threats.
