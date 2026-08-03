# World Context Cue Polish — 2026-08-02

## Scope

This pass audited ordinary first-person traversal around the opening grounds cart, practice bell, and spilled-range-ball hazard. The authored environment was already visually rich, but optional interaction, nearby-solid, and noise-hazard labels could occupy the same center-field area simultaneously.

## Changes

- Added a single ambient context-cue owner for the first-person view. Priority is imminent noise, a very close practice target, the nearest solid obstacle, a farther nearby noise hazard, then the optional practice target.
- Preserved all authoritative world art, collision footprints, interaction rings, route reflectors, path lanterns, and the persistent course map. Only competing text plaques are arbitrated.
- Reduced nearby solid callouts from as many as two simultaneous labels to the single closest supported obstacle.
- Bounded the solid callout to the left edge of the persistent course map so its complete name and distance cannot render underneath the map.
- Kept the practice bell's dedicated art and amber ground ring, but removed its redundant floating plaque. Inside the same 58-meter guidance range, the existing input-aware bottom prompt owns the instruction: `HOLD SPACE — CHIP AT AMBER BELL (OPTIONAL)` or the current controller/touch equivalent.
- Made all ambient context cues yield while the first noise-hazard consequence explanation owns the signal hierarchy. The bell prompt returns after the consequence clears.
- Deferred far shed and drain world plaques until the exit is unlocked, Listening Focus is active, or the player is within 150 meters. The map and route ribbon remain continuously authoritative.
- Added `navigationReadability.firstPersonGuidance.contextCue` to `render_game_to_text`, including cue type, entity id, distance, presentation lane, and arbitration contract.

## Validation

- `node --check web/game.js` passed.
- `git diff --check` passed with only the repository's existing line-ending notices.
- The official cart route reported `contextCue.kind: blocker`, `id: service-cart`, and a 3.23-meter clearance. Visual review confirmed only the complete `SOLID // GROUNDS CART` plaque remained and stayed clear of the map.
- The official hazard approach reported `contextCue.kind: noise`, `id: tee-spill`, and a 22.89-meter distance. The amber `SPILLED RANGE BALLS / WALK WIDE` plaque remained visible without a competing bell label.
- The official hazard activation reported `contextCue.kind: none` with `deferredBy: noise_hazard_consequence`; the consequence card, Joe response, and localized threat caption remained legible without an ambient plaque underneath.
- A bounded direct-browser quiet handoff advanced the existing course simulation after the consequence. It reported `contextCue.kind: practice`, a 28.54-meter distance, and the binding-aware bottom prompt while retaining the generated bell art and ground ring. The browser closed in a `finally` block.
- Official cart, hazard, and consequence routes produced no console or page error artifacts. Their sampled canvas averages remained between 1.77 and 2.94 ms.

## Evidence

- `output/polish-context-cue-cart-bounded-2026-08-02/shot-0.png`
- `output/polish-context-cue-hazard-2026-08-02/shot-0.png`
- `output/polish-context-cue-final-regression-2026-08-02/shot-0.png`
- `output/polish-context-cue-quiet-direct-2026-08-02.png`
