# Back Nine defeat: Product Owner framing

Level 2 now shares Level 1's SPRINT TERMINATED title, blocked-delivery framing, dark red dialogue box and PRODUCT OWNER: JOE // STATUS: BLOCKED label. The existing chase illustration remains. Joe's two-line review depends on the saved relay checkpoint:

- 0: “Your escape wasn’t on the roadmap. I brought delivery back on track.”
- 1: “One relay delivered. The sprint goal was escape. Partial completion is not Done.”
- 2: “Working relays. Failed acceptance criteria. You don’t ship until I sign off.”

Practical escape advice, checkpoint progress and retry instructions remain separate from character dialogue. The reading area can scroll on small screens while retry buttons remain visible. No new assets, shaders, simulation work or pathfinding changes.

## Verification

- `tools/verify-back-nine-defeat.cjs`: real run-over/death/caught transition; all three checkpoint dialogue variants and retained checkpoint on retry; keyboard/mouse retry; fresh restart and introduction; failed image fallback; reduced motion; four layouts (2560x1600, 1280x720, 844x390, 390x844). Passed, zero page errors, unchanged 17 programs / 36 textures. Desktop, short landscape and portrait images inspected under `output/back-nine-defeat/`.
- `tools/verify-chase-runover-browser.cjs`: animation, pause, input lock and retry passed; zero errors, unchanged rendering/audio resource counts.
- Installed standard Playwright client via `verify-presented-client.mjs`: two on-foot iterations; screenshot/state inspected in `output/back-nine-product-review/standard-client/`; no error artifacts.
- Release verification passed 90 action scenarios, 67 runtime images / 26 MiB, no warnings. JavaScript syntax and tracked whitespace checks passed.

Automated checks cover flow and presentation. Human assessment of Joe's tone remains subjective; this change makes no new performance or chase-balance claim.
