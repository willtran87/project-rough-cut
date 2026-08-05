# Cover Shred rough-exit resolution polish — 2026-08-05

## Scope

- Resolve a committed Cover Shred as soon as the player quietly clears effective rough.
- Keep ordinary sight, sound, and point-blank pursuit authoritative.
- Make the outcome inspectable and give a successful player a brief, non-stacking handoff.

## Implementation contract

- `evaded_rough` counts as a resolved predator tactic and enters the normal shared cooldown.
- Success requires `cover_shred / shred`, no effective rough, no line of sight, no audible movement, and more than 12 world units of separation.
- Success reuses the state banner, threat-caption slot, and bottom action rail; it does not add another HUD card.
- Sight, sound, or point-blank separation is evaluated first and records `contact_cancelled`.
- Text state exports the latest tactic, latest outcome, completion and cancellation counts, and the precedence rule.

## Automated browser evidence

Official client:

`C:\Users\Will\.codex\skills\develop-web-game\scripts\web_game_playwright_client.js`

Action route:

`web/test-actions/cover-shred-rough-exit.json`

The route used the shipped Settings → Key Bindings screen to bind crouch to `B`, entered Audit Row, triggered Cover Shred, crouched, and followed the solid hedge's advertised right-hand escape lane. Joe retained a real sightline and reached 8 meters before the player could clear the obstacle, so the run ended in defeat with:

- `lastTactic: cover_shred`
- `lastOutcome: contact_cancelled`
- `completions: 0`
- `cancellations: 1`
- `hasLineOfSight: true`
- `surface: BENT ROUGH`
- `crouched: true`
- `averageRenderMs: 0.33`
- `lastRenderMs: 0.3`

This validates the higher-priority failure path and confirms crouching does not suppress genuine sight/contact. Static control-flow inspection confirms the success path can only execute after those guards and immediately publishes the authored fairway-clear handoff.

## Visual review

- Inspected the 1280×720 final screenshot directly.
- The defeat still, Joe portrait, dialogue, incident evidence, recovery instruction, and three result actions remained within the frame and visually separated.
- No browser error artifact was produced.

## Follow-up

- Human-playtest a quieter Cover Shred in a broad, unobstructed rough patch and tune route geometry only if the 2.8-second escape remains impractical there. Do not relax sight, sound, or point-blank precedence to make a trapped hedge route pass.
