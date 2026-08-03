# First-Person Rear Bearing — 2026-08-01

## Outcome

The collision-aware objective route now remains actionable when its next waypoint falls entirely behind the fixed first-person camera. The persistent course map is unchanged, but it is no longer the only surface that communicates a necessary backtrack.

## Behavior contract

- The cue appears only when the authoritative guidance direction is `TURN BACK` and an active target exists.
- It names the active objective, rounded distance, and the safer left, right, or centered return bearing derived from the next collision-aware waypoint.
- It is guidance-only: movement, collision, route planning, objective selection, Joe behavior, detection, and scoring are unchanged.
- It stays below the compact objective panel or below the expanded Surroundings panel, avoiding the map, center crosshair, reward cards, and bottom message rail.
- It disappears during the Survival Briefing, chip aiming, Final Filing, and a committed rear glance.
- Reduced Camera Motion holds the cue at full opacity and removes its restrained pulse.

## Validation

Action file: `web/test-actions/presentation-handoff.json`

- The deterministic route reached Audit Row at x `0`, y `94` after passing the still-active drain valve.
- Guidance reported `TURN BACK`; the next collision-aware waypoint was left of the player.
- Text state reported `visible: true`, `side: left`, `targetLabel: DRAIN VALVE`, and distance `90.57`.
- Visual review confirmed the cue rendered beneath the compact objective panel as `◀ TURN BACK` and `DRAIN VALVE // 91m`, clear of the zone card, hedge opening, map, and bottom cue.
- The handoff itself remained correct: Delivery resolved first, then the deferred Audit Row card appeared with zero ambient threat cards.
- The standard forward route reported `BEAR LEFT`, five visible route reflectors, ten visible path lanterns, and a null rear cue.
- Both scenarios stayed in `first_hole`, produced no browser error artifact, and sampled `1.74ms` and `4.01ms` average canvas work respectively.
