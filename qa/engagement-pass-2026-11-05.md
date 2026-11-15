# Engagement implementation — November 5, 2026

Implemented the highest-priority changes from the game-grades review in the local browser build. This is an implemented and tested design pass, not a new subjective grade or a public deployment.

## Player-visible changes

- **Quieter focused HUD:** upper panels are 108 rather than 144 canvas units tall (25% shorter). One contextual/navigation line replaces the former pair, and duplicate saved-check notices are removed. The map button moves with the composition and uses shared drawing/hit-test geometry. The existing expanded HUD remains available by disabling Focused HUD.
- **Field Log choice:** standing + Use stamps immediately and broadcasts the existing 5.6-second signal. Crouching unseen + Use starts a 1.6-second quiet filing. Remaining still and crouched completes it without creating a signal, redirecting Joe, or requiring a cover retreat. Movement, standing, exposure, chase, leaving range, or a chip cancels. Pause freezes progress. Quiet completion earns the Field Log's clean credit and Delivery reward once; existing evidence and unrelated investigations remain intact.
- **Useful optional reward choice:** standing + Use at a Sprint Review grants a ball or reserve ball. Crouching + Use instead shuts off floodlights for 18 seconds, restoring them smoothly during the final 1.5 seconds. Both choices retain the review bell, Delivery reward, filing discount, and pressure cost. The light effect changes authoritative exposure as well as rendered lighting. Timers pause, rewards cannot duplicate, and retries reset them.
- **Tactical success feedback:** a valid ball investigation confirms “JOE TOOK THE BAIT”; clean cover breaks and quiet filing receive distinct confirmations. The existing threat card carries them, with a short two-note cue. Immediate danger and interactions take priority; expired ball advice retires rather than advising movement after the diversion has ended.
- **Threat proportion:** distant trail/wake evidence remains visible, but uses a calmer message instead of the same emphasis as immediate exposure. Actual chase, sight, sound, tracking, and movement rules remain authoritative.
- **Visual separation:** eight subtly different backdrop light palettes blend across zone boundaries. Physical props draw over the lighting, with subdued background detail around active interactions. Completion effects use fewer rings, and quiet filing uses one. Existing art and collision geometry are preserved.
- **Records:** a new run-rules identifier prevents scores under the new choices from competing with historical rules. Prior history remains stored.

Use the existing crouch binding on every device: C / controller LB / touch Crouch, together with Enter / A / Use. Simultaneous crouch + Use reads current input rather than a stale previous-frame crouch state.

## Verification

- `node --check web/game.js`, `git diff --check`, and `tools/verify-release.mjs` pass. Release verification finds 53 referenced runtime images, 14.49 MB, no missing/unreferenced images, and 90 parseable action fixtures; it does not execute all 90 fixtures.
- `tools/verify-engagement.cjs` covers quiet completion, pause, movement/standing/exposure cancellation, loud fallback, once-only credit, both optional rewards, power expiry, actual exposure reduction, payoff priority, stale-advice retirement, retry/reset, and simultaneous controller/touch choices.
- `tools/verify-core-loop.cjs` passes both exit filing/cancellation flows, completion progress, and synthetic controller/touch filing.
- `tools/verify-experience.cjs` passes updated station tactics, movement/look behavior, detection-facing rules, 63 collision-driven approaches, and settings persistence.
- `tools/verify-gameplay-polish.cjs` passes ordinary first-check play, review inventory/reserves, optional-action priority, synthetic inputs, attention recovery, both exits, and retries.
- The installed develop-web-game client reaches gameplay without a browser-error artifact; the normal onboarding capture passes **57/57 readiness checks**. Quiet-state commitment checks additionally validate the no-signal branch. A cold 2560x1600 fixture initially failed the generic frame-budget sample; this pass does not certify sustained device performance.
- Full ordinary-input Standard-pressure runs earn every prerequisite and complete both exits with the new quiet filing: `output/engagement-2026-11-05/final-drain/route.json` and `output/engagement-2026-11-05/shed-late-access/route.json`. The runner uses read-only planning knowledge and is not a human playtest. Earlier shed strategies failed near the final encounter; those traces remain under `final-shed/` and `shed-direct/`. Joe was not weakened to make those strategies pass.
- Actual screenshots were inspected at **2560x1600, 1280x720, 800x600, and 844x390**, including quiet choice/progress, touch controls, optional review choice, tactical payoff, ordinary travel, and regional lighting. The duplicated quiet-progress display found during review was removed.

Evidence and capture scripts use the ignored `output/engagement-2026-11-05/` directory. The final small follow-up edits updated preview wording and audit assumptions; they do not change the successful route mechanics.

## Remaining evaluation

Human playtests should compare the quiet/loud log choice, ball-versus-light reward uptake, recognition of successful tactics, final-encounter difficulty, and voluntary replay. Actual audio mix, physical-device comfort, low-memory behavior, and sustained frame pacing are not certified here. Zone lighting improves visual distinction without claiming a full landmark/art redesign. Public publishing and recruitment of external testers were not performed.

## Later follow-up

The [follow-up implementation](engagement-followup-2026-11-05.md) supersedes the immediate-blackout behavior above: the charge now waits for a lit crossing. It also adds final-station retreat choices, physical inspections, lighting variants, discoveries, pennants, and the in-game journal/study tools. At the user's request, human sessions are [prepared for later](engagement-playtest-guide.md).
