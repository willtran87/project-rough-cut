# Current requested work — Back Nine, November 13

User clarified that these changes apply to **Level 2: Back Nine**, not Level 1:

- Remove Level 2 bells, including visible bell/pad apparatus and their interaction/audio prompts.
- Raise the mower's center cutting deck at idle; lower it during active cutting/attacks so the intake reads as a mouth.
- Joe alone can destroy course props. His mower can smash through appropriate scenery; player collisions cannot destroy it.
- Joe can further crush and shove the player's abandoned wreck out of his path.
- Make Joe faster and more aggressive, while retaining visible attack timing and collision correctness.
- Death retries and page reloads begin at the course start, not a saved shelter. Relays may remain objectives but must not imply checkpoint saves.
- Add a more dramatic, responsive musical arrangement with existing music-volume, pause and comfort support.
- Test physical destruction, wreck motion, reset, actual retry inputs, music, deck animation, pursuit/escape, and desktop/mobile rendering.

Earlier request to remove Level 1's Audit Bell was explicitly reversed by the user. It is restored, including its three-check objective, signs, sound/reply, receipts and weather. Exact pre-removal game source was reconstructed and compared against all removal edits before restoration; there were no concurrent differences. Previous Level 1 pursuit tuning is preserved. Audit response browser, weather/exit tests and installed client pass; ordinary readiness remains 56/57 with the existing frame-budget failure. The aborted removal output remains diagnostic only. No Level 1 checkpoint changes were made.

Organic Level 2 additions should use course maintenance objects: timber barriers, equipment crates, hose reels or groundskeeping carts. They should supply landmarks and temporary cover; Joe destroying those objects should create a readable physical route change.

Implementation status: Level 1 restoration and the scoped Back Nine pass are complete and verified. See `qa/back-nine-terror-2026-11-13.md`. No broad goal created or completed, no subagents, no commit/deploy. Preserve concurrent chapter work and local server 4187.
