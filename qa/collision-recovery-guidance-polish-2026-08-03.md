# Collision-recovery guidance polish — 2026-08-03

## Goal

Make an obstacle impact tell the player how to recover without contradicting their blocked input or recommending another occupied lane.

## Observed issue

A sustained forward bump into the grounds cart correctly produced the orange collision footprint and `BLOCKED BY` card, but the ordinary movement layer rendered afterward. Its forward chevron and `RUNNING` label remained visible even though forward travel was blocked and the card instructed the player to move sideways.

## Resolution

- Active collision recovery temporarily owns the center movement cue.
- Hides the ordinary locomotion label during contact feedback.
- Replaces the attempted-input chevron with an orange chevron matching the escape instruction.
- Preserves attempted input separately in the text-state contract for diagnosis.
- Probes five meters left and right against the authoritative padded collision geometry.
- Rejects a lateral option blocked by a different obstacle.
- Treats continued motion away from the struck obstacle as viable even before one probe fully clears a broad footprint.
- Uses the current objective-route bearing to choose between two viable sides.
- Uses forward/back clearance fallbacks only when lateral recovery is unavailable.
- Retains the existing course-boundary-specific wording.

No collision response, player sliding, movement speed, obstacle footprint, camera motion, objective path, Joe behavior, sound, or scoring rule changed.

## Verification

`node --check web/game.js`

`node output/audit-collision-contact-layer.mjs`

- 10/10 focused assertions passed.
- Covered centered and off-center cart contacts, left- and right-biased routes, held blocked input, 2560x1600, 1280x720, 844x390, Reduced Camera Motion, text-state parity, and browser errors.

`node output/validate-movement-feedback-release.mjs`

- 10/10 established live movement, release afterglow, sprint, crouch, open-sand, compact, Reduced Motion, state-contract, and browser-error assertions passed.
- Corrected the ignored validator's sand seed from the exact physical bunker-rake center to open sand in the same west-tee bunker; no production geometry changed.

`node output/audit-blocker-callout-layer.mjs`

- 9/9 existing approach-label assertions passed.

`node output/validate-score-handoff-context.mjs`

- 8/8 existing signal-handoff assertions passed.

Required official client:

`node C:\Users\Will\.codex\skills\develop-web-game\scripts\web_game_playwright_client.js --url http://127.0.0.1:4173/ --actions-file web/test-actions/footprint_collision.json --iterations 1 --pause-ms 80 --screenshot-dir output/collision-recovery-guidance-official-2026-08-03`

- Reproduced the natural off-center grounds-cart impact with `MOVE LEFT TO CLEAR` and one orange left chevron.
- Reported the earlier forward attempt separately while the visible forward direction and locomotion label remained suppressed.
- No client error artifact.
- Canvas work averaged 1.68ms, with a 1.40ms final sample across 226 rendered frames.

## Visual evidence

- `output/collision-contact-layer-audit/01-high-resolution-centered-cart.png`
- `output/collision-contact-layer-audit/03-compact-centered-cart.png`
- `output/collision-contact-layer-audit/04-standard-centered-cart-reduced-motion.png`
- `output/collision-contact-layer-audit/06-standard-centered-cart-held-forward.png`
- `output/collision-contact-layer-audit/07-standard-centered-cart-right-route.png`
- `output/collision-recovery-guidance-official-2026-08-03/shot-0.png`
