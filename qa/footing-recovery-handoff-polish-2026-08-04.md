# Footing recovery-handoff polish - 2026-08-04

## Scope

This pass makes the end of an established slow-footing crossing agree with the player's restored movement. It preserves hazard geometry, penalties, noise, material contact effects, local bypasses, Joe behavior, controls, scoring, and both escape routes.

## Observed issue

Crossing the final terrain edge restored the authoritative movement multiplier to 1.0, but the locked percentage banner and `SLOW FOOTING` explanation could remain visible. The player therefore moved at full pace while the interface still claimed they were slowed.

The first implementation capture also exposed excessive recovery copy in three locations. That iteration was rejected in favor of one textual owner.

## Implemented

- Added a bounded 1.45-second recovery state carrying the cleared zone and material.
- Replaces only the exact active footing banner with `FOOTING CLEAR // FULL PACE`.
- Retires the stale bottom slowdown explanation instead of replacing it with another duplicate sentence.
- Preserves the ordinary `RUNNING` movement label and briefly tints its existing chevrons mint. This makes the pace change perceptible without adding a new panel or meter.
- Leaves any newer danger, collision, scoring, objective, or Joe update untouched.
- `render_game_to_text` exposes recovery activity, remaining seconds, cleared zone, material, restored multiplier, presentation rule, and the movement tint.

## Validation

- Focused gameplay validation passed 17/17 checks, including an exact transition from Audit Thatch's 0.66 multiplier to 1.0, retirement of stale drag copy, one recovery banner, movement tint, all material responses, collision-clear routing, Vertical Pass pressure, hard-cover waiting, all seven traversable centers, all seven bypasses, and zero browser errors.
- Responsive presentation validation passed 40/40 at 2560x1600, 1280x720, 844x390, and 1280x720 with Reduced Camera Motion.
- Original-resolution inspection confirmed the recovery banner remains in its protected course lane and does not overlap the reticle, map, objective dossier, Joe panel, route ribbon, or foreground cover.
- The required official uninstrumented route exercised the live slow-footing approach and produced no browser error artifact. Extending that deliberately straight route kept Joe dangerous and ended in the expected Sightline Held capture rather than bypassing the established pursuit rules.

## Evidence

- `output/route-pressure-validation/07-full-pace-recovery.png`
- `output/route-pressure-visual-validation/01-high-resolution-footing-recovery.png`
- `output/route-pressure-visual-validation/03-compact-footing-recovery.png`
- `output/route-pressure-visual-validation/04-reduced-motion-footing-recovery.png`
- `output/footing-recovery-official-final-2026-08-04/shot-0.png`

## Suggested playtest tuning

Clear slow footing during an active chase and judge whether the 1.45-second banner is readable without stealing attention from Joe. If necessary, tune only that duration. Preserve the single textual owner, mint movement tint, exact 1.0 recovery multiplier, and higher-priority event protection.
