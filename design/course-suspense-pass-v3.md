# Course Suspense Pass v3

## Goal

Make distance and shelter use create tension without giving Joe hidden knowledge, teleporting him, or stacking unrelated scares over the shared Tension Director.

## Course acoustics

Joe's synthesized mower now passes through a material-aware acoustic model derived from the same authored obstacles used by collision and sight blocking.

- Open air preserves the full mower spectrum.
- Hedges, trees, reeds, and rough soften high frequencies while preserving directional information.
- Earth and bunker structures produce a heavier low-pass treatment.
- Carts, gates, and mower wreckage retain a sharper reflected tail.
- Multiple blockers compound transmission loss within a bounded range.
- Relative closing or receding speed produces a restrained Doppler shift.
- Stereo direction follows the active forward or rear-view projection, so turning the player's head reverses the correct left/right field.

This presentation never changes Joe's hearing, detection, sight, navigation, collision, or speed. Critical danger remains available through captions, the attention panel, world disturbance, and the map.

## Shelter memory

Each physical cover object and coarse deep-rough sector has a run-local identity. A visit counts only after the player settles for 0.55 seconds. The system remembers entry count and uninterrupted stationary time but does not sample a live player position after an audit begins.

Cover Audit can begin when either condition is met:

- the same shelter has been entered three times and occupied for at least 2.2 seconds on the latest visit; or
- the player remains stationary in one shelter for 9.5 seconds.

The opening must be at least 12 seconds old. Joe must still be patrolling, attention must be low, and direct pursuit, relief, Silent Stalk, environmental omens, objective filing, distractions, Status Requests, and predator tactics all retain priority.

## Cover Audit fairness contract

1. The shelter receives an amber mower-tooth ground mark.
2. A 2.6-second banner, subtitle, spatial sound, and directional caption explicitly say Joe has learned the shelter.
3. The player can leave using normal movement; no input or route is locked.
4. Joe physically changes to search and routes toward the snapshotted shelter position for up to 10.5 seconds.
5. Leaving early causes Joe to check an obsolete location. Staying risks ordinary sight, sound, search, and capture rules.
6. Contact supersedes the audit immediately. Joe never teleports, receives an invisible detection bonus, or learns the player's new position from the audit.
7. A shelter can be audited once per run, with a 12-second global cooldown and four-event run cap.

The intent is to make safe spaces temporary decisions while rewarding players who vary their route.

## Validation contract

`render_game_to_text` reports:

- acoustic blocker, material, cutoff, transmission, reflection, pan, distance, relative velocity, and Doppler multiplier;
- current shelter, stationary duration, visit count, audited shelters, warnings, investigations, escapes before arrival, and last outcome;
- Cover Audit phase, warning time, cause, remembered target, and whether the player left before Joe began searching.

Reduced Camera Motion keeps the audit ring static while retaining every warning and gameplay rule.
