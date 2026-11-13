# Back Nine experience — implementation pass 1

Full active goal: implement all 38 items in `design/back-nine-experience-implementation.md`. This pass is concrete progress, not completion of that goal.

## Implemented

- `chase-encounter.js` owns optional-beat permission and encounter priority. Hunt selection, tension, pressure, panic reveals, atmosphere, score and dialogue consult it. Existing physical charge motion/warnings, collision and route planning remain authoritative. State is observable through `render_game_to_text().encounter`.
- Missed foot charges and evaded lane commitments can earn 4.8 / 4.5 seconds of relief, with a 14-second reward cooldown. Concealment requires relocation over 5 m, at least 2 seconds without fresh sensory evidence, and actual separation. Recent damage does not count as a successful evasion. Relief caps normal pursuit at 4.5 m/s on foot or 8.5 m/s in the cart; it never cancels an already committed charge. Music/optional effects/dialogue respect quiet windows.
- `chase-service.js` provides up to 25 optional repair over 3.5 seconds. Leaving early keeps whole earned health, supplies are finite, full health does not waste supply, pauses freeze progress and wrecks cannot be resurrected. A typical uninterrupted full charge applies five 5-health transfers instead of updating the detailed damage mesh every tick. Crew logs remain a separate 1.1-second hold. Joe continues moving.
- Added a five-segment charger meter on each shelter's forward post, facing the player during service. Shared materials, no textures/lights/voices added. Existing harmonic voice provides a quiet charging hum when it does not compete with an alarm or nearby attack.
- Fixed a visually confirmed shelter-camera obstruction: the follow eye previously entered the pitched roof. `chase-camera.js` lowers it smoothly before reaching either shelter, including rear view and ejection/death views. Horizontal following and steering controls remain unchanged.
- Prepared `qa/back-nine-human-playtest.md`, a blank observation CSV and `web/back-nine-playtest.html`. `?playtest` adds a pause/result-menu feedback link; normal play hides it. Saves/downloads are local and optional, snapshot attachment is optional, and tests label their records as automated fixtures. No human testing was conducted.

## Verification

Evidence root: `output/back-nine-experience/`. Original sources preserved in `baseline-source/`.

- `verify-chase-encounter.mjs`: conflict priorities, pause, recent-hit rejection, bounded rewards, sight-plus-sound concealment, and a real dodge. The existing locked charge traveled 35.53 m over 175 simulation frames. The subsequent 289-frame relief window let the test runner increase separation from 17.36 to 22.82 m while steering into a viable escape line. This establishes a playable opportunity, not human difficulty balance.
- `verify-chase-service.mjs`: both shelters, partial/full supply, pause/movement interruption, full-health conservation, retry/log persistence, no wreck resurrection. Live Joe travelled 28.23 m during a two-second stop, closing from 48 to 19.77 m while the cart gained 10 health.
- `verify-chase-service-browser.cjs`: actual health progression 50 → 53 → 61 → 75; world meter depletion; accurate HUD; log/pause behavior; forward/rear camera under eaves. Same 23 software shader programs and 36 textures. No runtime `bufferData` allocations; four observed damage-geometry updates across the sampled presentation steps. These bounded updates do not establish overall frame-time improvement.
- `verify-chase-camera.mjs`: both shelters, multiple approach angles, smooth constrained height, rear/ejection heights and unchanged open-course height.
- Existing `verify-back-nine.mjs` passes 12 route/checkpoint scenarios. `verify-cart-health.mjs` passes all three on-foot completion routes with live Joe. `verify-back-nine-choices.mjs` passes gaps, interceptions, real late fatal ram → ejection → foot passage → garage, and retry. Updated two old repair assertions to expect partial repair at 1.1 seconds and full repair only after holding longer; did not weaken completion/collision assertions.
- Existing tension, pressure-rhythm, panic, runner controls, chase-drama and offline chase-score tests pass. Charge warning/recovery and no-mouse steering remain. Offline score retains three persistent voices, pause/mute and no per-note allocations.
- `verify-chase-drama-browser.cjs` passes existing music, comfort, caption and initial-guide spoiler checks. `verify-cart-ejection.cjs --software` passes all phases, rotated-seat anchoring, pause/reduced motion and no new buffers.
- Installed standard gameplay client ran Back Nine on-foot input bursts after director/service changes. Screenshots inspected.
- `verify-back-nine-playtest.cjs` verifies optional menu link, paused game, local snapshot, required ratings, literal text handling, reload persistence, JSON download and normal-menu exclusion. Screenshots inspected at 2560×1600, 1280×720 and 390×844. Gameplay/service checked at 2560×1600, 1280×720 and 844×390.

## Remaining scope

Most of the 38-item plan is still open. No claim is made that raw software frame spikes have been solved, that all district encounters/routes/finale changes exist, or that human horror/fun/readability have been validated. Continue from the ledger; retain the full goal. New optional encounters should use the shared priority policy and preserve physical attack contracts.

Refresh `http://127.0.0.1:4187/back-nine.html` for the `20261112-experience-1` revisions. For the later test kit use `http://127.0.0.1:4187/back-nine.html?playtest`.
