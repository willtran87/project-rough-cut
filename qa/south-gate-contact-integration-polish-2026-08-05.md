# South gate contact-integration polish — 2026-08-05

## Outcome

The generated south service gate now behaves like the physical boundary it depicts.

- South-edge collision identifies `locked south service gate` instead of the generic `clubhouse boundary`.
- Fresh contact starts one bounded 0.72-second gate response and increments a diagnostic impact count.
- Standard motion adds a rapidly settling iron-gate shake; Reduced Camera Motion keeps the object fixed.
- Both modes retain a chain-and-padlock flash with two restrained impact waves centered on the authored lock.
- A grounded `SOUTH SERVICE GATE // LOCKED` identity appears during an ordinary rear glance.
- During contact, that identity yields to the existing orange collision card, which owns the blocker name and exact `MOVE FORWARD ONTO COURSE` correction. The generated gate and lock response remain visible underneath without duplicated copy.

Collision position, playable course bounds, movement application, camera controls, map behavior, Joe AI, objective routes, scoring, and the generated gate asset are unchanged.

## Validation

- `node --check web/game.js` passed.
- `git diff --check` passed for source and documentation.
- The official Playwright client exercised a real backward input from `y = 0`. The visible collision card reported `BLOCKED BY // LOCKED SOUTH SERVICE GATE` and the correct forward recovery direction without browser errors.
- Exact-key rear validation held the existing remappable rear-view input while attempting the same backward movement. Direct inspection confirmed the authored gate remained grounded, the lock flash was centered, the orange footprint aligned with contact, and only one instruction card remained.
- Text state reported rear amount 1, gate visible, one active 0.62-second impact, one counted contact, the local identity label hidden, and `identityDeferredBy = collision_card`.
- The official impact capture completed 97 rendered frames with a 3.10 ms final canvas sample. The final rear-impact capture completed 142 frames with a 1.00 ms final sample.

## Suggested follow-up

Human-playtest repeated short taps and a sustained backward hold with ordinary audio. Preserve the one-card ownership rule and exact `y = 0` collision plane; tune only shake amplitude or lock-flash intensity if needed.
