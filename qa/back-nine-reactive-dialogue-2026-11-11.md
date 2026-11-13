# Reactive Joe dialogue

Added 20 lines: five each for hiding, shortcuts, damaging mower impacts and abandoning the cart. They use the existing persistent shuffle decks and combine Product Owner language with turf/mowing imagery. The Level 2 bank now has 52 lines across eight pools.

Triggers observe existing evidence without changing simulation state:

- Hiding: existing occlusion persists for at least 2.2 seconds. Reacquisition cancels both pending and active hiding remarks; Joe does not acquire new knowledge or change his target.
- Shortcuts: a player opens a shortcut gate, or Joe observes a cart-only fork and commits to its wider interception route.
- Damage: an existing contact event reports positive cart damage. Undamaged bumper contact does not trigger it.
- On foot: the actual abandon-cart event, prioritized over damage from the same hit.

One pending reaction, 12-second global cooldown, 22-second per-kind cooldown, 12-second pending expiry and 4.5-second display. Repeated occurrences receive fresh shuffle selections. Pause freezes simulation time; death, finale and retry clear/replace reaction state. Captions wait for an empty or ambient story/panic slot. Collision messages, ram wind-ups, close threats, ejection protection, shelter interactions, decoys, route prompts and finish controls take priority. Distance is restricted to 18–85 metres. These gates can intentionally discard a reaction during sustained danger.

No additional visibility/path queries, audio nodes, models, images or rendering passes. This is text dialogue, not synthesized speech.

## Verification

- `verify-back-nine-reactions.mjs`: four contexts, real shortcut/ejection events, observed forks, hiding threshold/reacquisition, priority, cooldowns, expiry, pause, death/retry cleanup and simulation immutability pass.
- `verify-back-nine-dialogue.mjs`: all 52 lines, exhaustive deck cycles, reload persistence, no per-frame writes, stable captions and storage fallback pass.
- `verify-back-nine-reactions-browser.cjs`: all four matching pools rendered; initial action instructions precede reactions; pause/resume and urgent warning preemption pass. Uses controlled scene/event fixtures, including a real obstructed sightline, gate opening and cart ejection; damage uses a fixture matching the simulation event contract.
- 2560x1600 and 390x844 screenshots inspected; no page errors, unchanged 17 programs / 36 textures. Evidence: `output/back-nine-reactions/`.
- Standard installed Playwright client: two on-foot iterations, screenshot/state inspected, no error artifacts.
- Existing story tests, syntax, whitespace and release verification pass (90 scenarios, 67 runtime images / 26 MiB).

Human tuning remains: assess how often safe caption windows occur during a full chase. No new FPS claim or completed human playtest is implied.
