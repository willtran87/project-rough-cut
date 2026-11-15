# Back Nine experience — pass 5

Scope: route readability, optional guidance and usable course distractions. The full 38-item implementation goal remains active; this is not an overall completion claim.

## Behavior and presentation

- Five actual cart apertures have worn wheel bands and scraped jamb sleeves. Three foot-only passages have inset, slightly varied paving using existing opaque materials. The clues join existing spatial batches; they add no obstacles, textures, lights or per-frame animation.
- Optional “Help with route choices” defaults off and persists locally. Five junctions describe their real tradeoffs, with separate running context only after breakdown. Hints yield to objective/interaction messages and disappear during committed threats and close contact. Nearby following junctions can become eligible after passing a previous one.
- Three bell treadles have paired five-segment physical charge lamps in their existing lamp draw. The meter advances while holding, clears on release, fills while ringing and extinguishes after use. Only draw ranges change; no runtime geometry uploads.
- Pre-use messages distinguish exposed, audible, too distant and committed-attack situations. Valid activation still needs a deliberate 0.7-second stop/hold, concealed player, nearby Joe and no active ram. One use, fixed sound target, seven-second expiry and immediate fresh-evidence reacquisition remain. Invalid activation is warned but still spends the bell if deliberately held.
- Unaware patrol had inherited roughly chase-speed movement, often racing past a concealed treadle before its charge completed. Patrol now caps at 12 m/s with the cart and 7 m/s on foot. Visible pursuit, charges and existing recovery limits are unchanged.

## Verification

- `verify-chase-route-guidance.mjs`: all five contexts, default off, no advance running spoiler, warning priority, passed junctions, bell availability and hold/release.
- `verify-back-nine-decoys.mjs`: all three physical investigations in cart and on foot; expiry, one use, pause, visual/audio reacquisition, failed exposed use, quiet coasting, clean retry and useful escape benefit.
- The comparison driver now follows the current pump-yard road around the grounds store. Its old shortcut drove through the building. The bell comparison measures a sustained usable escape window rather than assuming permanent separation after Joe legitimately reacquires sight. With diversion: 71.73 m progress, no hits; control: 49.78 m, two hits. At least three one-second samples have more than 30 m additional separation. At ten seconds Joe has closed in again; the bell is not immunity.
- `verify-chase-route-guidance-browser.cjs`: actual keyboard hold/release, charging/ringing/spent lamps, pause, reduced motion, settings reload, hint display, three viewport sizes and no new runtime buffer uploads/programs/textures.
- `verify-chase-route-art.cjs`: six course views. Inspected current paving and bell renders at 2560×1600, ordinary 1280×720 and compact 844×390.
- Full `verify-back-nine`, `verify-back-nine-choices`, `verify-cart-health`, `verify-chase-districts`, `verify-chase-senses`, `verify-chase-drama`, `verify-heavy-impact`, `verify-runner-controls`, `verify-quiet-messages` suites pass. Includes all narrow branches, physical mower detours, late fatal impact → running gap → garage, all three on-foot starts and intact-cart outcomes.
- `verify-chase-search-browser.cjs`: physical cover, listening search, fresh-sight reacquisition and quiet music remain functional.
- Installed standard gameplay client via `verify-presented-client.mjs --back-nine --runner`: actual running/turning bursts, latest screenshot and state inspected. No client errors reported.

## Cost and remaining work

Same 23 software programs and 36 textures. Six sampled scene draw counts: pump 91, range 91, reservoir 87, service 94, dry range 97, bell 91. Service view adds two visible existing-material batches compared with the before capture; others retain their previous draw counts. Small static geometry addition; this is bounded resource evidence, not proof of better frame time. Software-rendering spikes remain open.

Natural clue readability and route balance still need later human assessment. Whole-course landmarks, breakable/solid barrier visual consistency, and the remaining animation/environment/performance requirements are not completed by this pass. Evidence: `output/back-nine-experience/routes/`, `output/night-machinery/simulation.json`, and the existing suite reports. Local entry versions updated to `20261112-route-clues-3`.

Final visual follow-up: raised bell controls 0.35 m after screenshots showed the banner obscuring their lower segments. Re-ran art/UI browser checks and the installed client; inspected latest 2560 and 844 captures with all charge segments above the prompt. No geometry-count change.
