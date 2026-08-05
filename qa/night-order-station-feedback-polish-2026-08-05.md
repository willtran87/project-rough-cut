# Night Order station feedback polish — 2026-08-05

## Outcome

The three mandatory Night Order stations now communicate their individual identity and completed state instead of sharing one generic bell response.

- Audit Bell uses the existing layered brass-bell ring.
- Field Log uses a mechanical stamp impact, lever clack, and short paper snap.
- Release Review uses a low review-gong fundamental with restrained metallic harmonics.
- Every completed station retains a mint ground seal and compact check marker.
- The just-filed station receives a 1.45-second scale response and ground-wave activation. Reduced Camera Motion keeps one static restrained halo and removes the animated scale pulse.

All cues remain synthesized through the existing effects bus, so master/effects volume, browser audio unlocking, pause behavior, and user settings continue to apply.

## Gameplay preservation

- Interaction radii, objective order, world positions, navigation, collision, Joe alert, investigation duration, noise magnitude, scoring, and exit rules are unchanged.
- The generated station atlas remains the physical visual source. The new completion seal, state light, and transient waves are runtime-owned feedback layers.
- The filed-state marker remains visible after the transient activation ends, preventing completed stations from looking accidentally inactive or broken when revisited.

## Validation

- `node --check web/game.js` passed.
- `git diff --check` passed for the changed source and documentation.
- The official Playwright client followed the actual obstacle-aware route around stone cover and entered the Audit Bell's authoritative interaction radius.
- End-to-end state confirmed Audit Bell completion, immediate Field Log navigation ownership, Joe entering `investigate`, the `brass_bell` cue identity, and an active 1.45-second station response.
- The inspected activation frame kept the authored bell readable beneath the feedback, retained the persistent map, and displayed the next-objective route without browser errors.
- The successful live capture completed 615 rendered frames at 3.90 ms average and 3.90 ms final canvas render.

## Suggested follow-up

Human-playtest the stamp and gong at normal listening volume. Preserve their different frequency profiles and adjust only effect-bus gain if either cue feels too dominant beside Joe's mower.
