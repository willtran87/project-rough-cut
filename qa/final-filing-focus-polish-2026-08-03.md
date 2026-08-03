# Final Filing focus polish — 2026-08-03

## Goal

Give the final hold-and-release sequence one clear visual owner without removing Joe's character or weakening urgent safety information.

## Observed issue

The authored Final Filing bar was already clear, but close pursuit also rendered the ordinary contact-break / Risk Premium meter immediately above it. That second meter could not be meaningfully acted on while filing and repeated Joe-distance pressure already present in the filing panel. During the short acceptance seal, Joe's earlier taunt could remain under the large release stamp and compete with the success beat.

## Resolution

- Final Filing explicitly defers generic Joe-state banners and non-imminent ambient world plaques.
- The ordinary chase contact-break panel yields for both active filing and sealing.
- Joe remains allowed to taunt during the vulnerable hold.
- Joe's subtitle yields during the acceptance seal so `RELEASE AUTHORIZED` is uncontested.
- Moving to abort immediately restores the ordinary pursuit presentation.
- Noise hazards inside eight meters retain the established safety override.
- `render_game_to_text` now reports contact-break visibility and the `final_filing` context deferral used by the renderer.

Gameplay rules are unchanged: Joe continues during the active hold, movement aborts it, the player and score clock lock only during sealing, and route, scoring, collision, and timing remain authoritative.

## Verification

`node --check web/game.js`

`node output/validate-final-filing-focus.mjs`

- 9/9 focused assertions passed.
- Covered active safe filing, close pursuit, acceptance seal, compact 844x390, Reduced Camera Motion, and movement-abort recovery.
- No browser console or page errors.

Required official client:

`node C:\Users\Will\.codex\skills\develop-web-game\scripts\web_game_playwright_client.js --url http://127.0.0.1:4173/ --actions-file web/test-actions/mature_chase.json --iterations 1 --pause-ms 300`

- No client error artifact.
- The ordinary opening grounds-cart cover state remained coherent.
- Canvas work averaged 1.74ms, with a 1.20ms final sample across 195 rendered frames.

## Visual evidence

- `output/final-filing-focus-validation/01-high-resolution-active.png`
- `output/final-filing-focus-validation/02-standard-danger.png`
- `output/final-filing-focus-validation/03-high-resolution-sealing.png`
- `output/final-filing-focus-validation/04-compact-active.png`
- `output/final-filing-focus-validation/05-standard-sealing-reduced-motion.png`
- `output/final-filing-focus-validation/06-standard-cancelled.png`
- `output/web-game/shot-0.png`
