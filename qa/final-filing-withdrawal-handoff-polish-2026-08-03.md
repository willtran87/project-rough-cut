# Final Filing withdrawal-handoff polish — 2026-08-03

## Goal

Make a movement-aborted Final Filing immediately understandable without stacking duplicate consequence cards over live survival information.

## Observed issue

The filing itself had one clear owner, but aborting it restored three presentation layers at once:

- a top `FILING WITHDRAWN // MOVEMENT DETECTED` state banner;
- the center contact-break / Risk Premium meter;
- a bottom route-recovery message.

The center meter becomes actionable as soon as pursuit resumes, while both withdrawal cards repeated the same event.

## Resolution

- Removed the generic top withdrawal banner and its lock timer.
- Rewrote the existing bottom message as one concise cause-and-recovery instruction:
  - `FILING WITHDRAWN // MOVEMENT DETECTED — RETURN TO DRAIN RELEASE`
  - `FILING WITHDRAWN // MOVEMENT DETECTED — RETURN TO SHED RELEASE`
- Preserved the contact-break meter during pursuit.
- Preserved the objective dossier, map, Joe dialogue, route state, cancellation count and reason, and the existing 2.5-second message lifetime.
- Let the rail retire naturally back to the ordinary exit interaction prompt.

No pursuit, collision, filing, movement, scoring, or route rule changed.

## Verification

`node --check web/game.js`

`node output/validate-final-filing-withdrawal.mjs`

- 9/9 focused assertions passed.
- Covered dangerous Drain withdrawal, safe Shed withdrawal, compact 844x390, Reduced Camera Motion, authoritative cancellation state, and message expiry.
- No browser console or page errors.

Required official client:

`node C:\Users\Will\.codex\skills\develop-web-game\scripts\web_game_playwright_client.js --url http://127.0.0.1:4173/ --actions-file web/test-actions/mature_chase.json --iterations 1 --pause-ms 300 --screenshot-dir output/final-filing-withdrawal-official-2026-08-03`

- No client error artifact.
- Ordinary opening presentation remained coherent.
- Canvas work averaged 2.52ms, with a 1.50ms final sample across 205 rendered frames.

## Visual evidence

- `output/final-filing-withdrawal-validation/01-high-resolution-drain-danger.png`
- `output/final-filing-withdrawal-validation/02-standard-shed-safe.png`
- `output/final-filing-withdrawal-validation/03-compact-drain-danger.png`
- `output/final-filing-withdrawal-validation/04-standard-drain-reduced-motion.png`
- `output/final-filing-withdrawal-validation/05-standard-message-expired.png`
- `output/final-filing-withdrawal-official-2026-08-03/shot-0.png`
