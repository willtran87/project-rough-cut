# Quiet messages and defeat variety — 2026-11-11

## Implemented

- Both Level 1 HUD paths suppress routine engine, patrol, wind, zone-omen, ghost-sound and movement narration by default. Event state, audio, animation and pursuit timers still run normally. Objective updates, nearby interactions and tactical warnings retain their existing gameplay purpose.
- Back Nine messages now use an explicit priority order: death, cart-failure controls, finale/garage interaction, impact escape guidance, charge/close-pass warnings, objective/checkpoint updates and nearby interactions. Timber-gate instructions, missed-charge escape windows and failed distractions remain readable.
- Descriptive sound captions default off and are separate from dialogue. Level 1 exposes them in Readability and Controls & comfort; Level 2 exposes them in Controls & comfort. They share the campaign preference and survive reload. Level 1 descriptions also work with tactical threat captions disabled.
- Joe waits at least 12 simulation seconds initially, then at least 35 seconds between dialogue selections. Back Nine also waits 55 seconds before repeating a reaction category, expires pending reactions after 8 seconds, and displays a line for at most 3.5 seconds. Important messages and pause cancel a displayed Back Nine line instead of resurrecting it. Level 1 keeps its existing contextual pools and avoids immediate repeats when a small pool is exhausted.
- Added 38 complete, authored Back Nine defeat quotes: 8 general and 6 each for objective progress, near-exit defeat, shortcuts, damage and leaving the cart. A relevant pool mixes with general lines; selection uses shuffled decks, avoids consecutive repeats across contexts, caches per run and persists across retries/reloads. Near exit takes precedence, then on foot, shortcuts, damage and objectives. Corrupt or unavailable storage falls back safely.
- Level 1 retains its much larger existing defeat library and now persists its most recent 18 selections across reloads. Death cause and retry controls remain independent of Joe’s commentary.
- No new artwork, shaders, textures, lights or simulation/pathfinding changes. Existing audio and physical escape windows are unchanged. This is not a fix for the remaining software-rendering frame spikes.

## Verification

- `node tools/verify-quiet-messages.mjs`: pass. Quiet defaults, optional audio descriptions, warning/objective/death priority, cooldown/expiry/interruption, 38 unique quotes, complete eligible decks, 240 selections with reloads, stable redraw and malformed/unavailable storage.
- `node tools/verify-back-nine-reactions.mjs`: pass. Real gate/ejection events, hiding and reacquisition, context priority, 35-second spacing, stale event expiry and no simulation mutation.
- `node tools/verify-back-nine-dialogue.mjs`: pass. Existing 92 dialogue lines, pool cycles, reload continuity and navigation preservation.
- `node tools/verify-campaign-preferences.mjs`: pass.
- `node tools/verify-quiet-messages-browser.cjs`: pass. Seven distinct consecutive Back Nine deaths with checkpoint retries and a reload; Level 1 selection history; actual DOM HUD filtering and independent accessibility captions; dialogue interruption; settings controls and persistence. No page errors. Back Nine stayed at 17 hardware shader programs and 36 textures in the fixture.
- `node tools/verify-back-nine-reactions-browser.cjs`: pass for hiding, shortcut, damage and on-foot dialogue. Pause interruption and urgent impact priority verified.
- `node tools/verify-back-nine-defeat.cjs`: pass. Actual run-over animation → defeat → keyboard/button checkpoint retry, reduced motion, full restart, story replay and unavailable defeat artwork. No page errors or added textures/programs.
- `node tools/verify-release.mjs`: pass, 90 action scenarios, no warnings/failures.
- Installed standard gameplay client exercised both levels under SwiftShader. Level 1 starts through its normal menu/guide and walks/turns in two input bursts; Back Nine runs/turns on foot with the cart-failure instruction. State and presented screenshots inspected; no error artifacts.
- Visual inspection: 2560×1600 first, then 1280×720 and 844×390; Back Nine additionally 390×844. Sound and instruction rails do not overlap each other or the dashboard. Both Level 1 settings surfaces and its rendered sound-caption HUD were inspected.

Evidence: `output/quiet-messages/`, `output/back-nine-defeat/`, `output/back-nine-reactions/`.

## Later human playtest

Check whether 35 seconds leaves enough of Joe’s personality during a normal chase, and whether the brief charge warnings remain easy to notice with sound captions off. This timing is intentionally conservative. Human feedback is still deferred; automated runs do not establish suspense or humor quality.
