# Environmental Noise Hazards — 2026-08-01

## Outcome

Hole 1 now contains twelve readable, one-shot environmental noise hazards. They create avoidable route pressure, draw Joe to the physical sound source, and can be activated remotely with the existing golf-ball mechanic. No new zone, objective, exit, collision blocker, or progression layer was introduced.

The system reuses the existing high-detail generated course-clutter atlas rather than adding procedural stand-ins. Its six prop families are spilled range balls, toppled golf bags, loose hose couplings, maintenance tools, loose tee stones, and broken flag hardware.

## Behavior contract

- Entering an unspent hazard radius while moving triggers it deterministically.
- Ordinary movement produces `0.78` intensity.
- Sprinting produces `1.0` intensity.
- Crouching or Listening Focus produces `0.52` intensity.
- A golf-ball impact inside the radius plus its 2.4-meter landing tolerance produces a `1.0` remote trigger.
- Joe changes to `investigate` and pathfinds toward the authored hazard coordinate unless direct pursuit or the protected Emergency Appeal already has higher priority.
- During pursuit, the sound updates Joe's last-known position and attention instead of incorrectly cancelling the chase.
- Each prop can trigger once per run. Its persistent spent state prevents farming and communicates that the lane is now safe.
- The sound is spatialized with the existing Web Audio effects bus. Material families use distinct ball scatter, club/tool clatter, coupling impact, stone rattle, or flag snap synthesis.
- The player receives an in-world prop, amber ground ring, reflective glint, adaptive distance plate, Surroundings warning, spatial sound, cause-specific threat caption, and first-contact explanation.
- Crossing within 17 meters plays one restrained, directional player-only rustle before contact. It never raises course noise, Joe alert, detection, or investigation state, and the warning is also represented visually.
- The close plate reports `FULL ALERT` while sprinting, `MUFFLED CROSSING` while crouching or Listening, and `WALK WIDE` otherwise.
- The initial consequence message suppresses the redundant generic world marker. Once that explanation clears, the same authoritative point is identified as a timed `NOISE SOURCE` rather than an abstract `DISTRACTION`.
- Joe has sixteen dedicated Product Owner/Agile hazard barks. Subtitle-only voice behavior is unchanged.

## Placement audit

| Hazard | Position | Prop | Nearest blocking footprint | Normalized center clearance |
|---|---:|---|---|---:|
| `tee-spill` | -12, 62 | Range balls | Course sign | 2.86 |
| `audit-tools` | 4, 139 | Tools | Audit cart | 2.83 |
| `audit-bag` | 32, 172 | Golf bag | Audit board | 4.26 |
| `water-hose` | -16, 214 | Hose | West pond | 1.72 |
| `water-balls` | -38, 254 | Range balls | Bunker wall | 2.06 |
| `club-tools` | 10, 332 | Tools | Clubhouse stone | 2.31 |
| `service-stones` | 8, 392 | Tee stones | Maze cart | 3.37 |
| `service-bag` | -30, 444 | Golf bag | Service pond | 1.69 |
| `dead-coupling` | -12, 522 | Hose | Range-entry wing | 3.45 |
| `range-balls` | 26, 574 | Range balls | Range-entry wing | 2.40 |
| `range-tools` | -30, 608 | Tools | Release-intake wing | 2.30 |
| `release-bag` | 7, 662 | Golf bag | Release cart | 2.33 |

Every center is reachable by the authoritative player collision footprint. Trigger radii are 4.6–5.8 meters against fairway half-widths of 50–67 meters, leaving clear alternate lanes.

## Automated and visual validation

### Approach readability

Action file: `web/test-actions/noise-hazard-approach.json`

- Reached x `0`, y `41` with `tee-spill` 22.9 meters away.
- Text state exposed the hazard label, coordinate, radius, and distance.
- Visual review confirmed the generated ball bucket, reflective glint, amber ellipse, and `WALK WIDE` plate were visible.
- The adaptive plate sat below the prop and no longer overlapped `PRACTICE BELL // OPTIONAL`.
- Average warmed canvas work: `2.11ms`; browser errors: none.

### Accidental step and repeat protection

Action file: `web/test-actions/noise-hazard-step.json`

- Reached x `-12`, y `64` through ordinary movement.
- `triggered: 1`, `steppedOn: 1`, `remoteTriggers: 0`.
- Active intensity: `0.78`; authored duration: `5.0592s`.
- Joe entered `investigate` with next navigation waypoint x `-12`, y `62`.
- Additional left/right movement while still inside the radius left the trigger count at exactly one.
- Visual review confirmed one cause-specific hazard card, one Joe bark, the spent prop, and the sound-source ground response without the former duplicate generic investigation card.
- The former bottom-center `DISTRACTION` plate no longer competes with the first-contact explanation. The active event retains its exact timer and source coordinate in text state while the visual hierarchy is simplified.
- Average warmed canvas work: `1.84ms`; browser errors: none.

### Crouched contact

- Used physical `C` plus forward movement after ordinary approach.
- `triggered: 1`, `steppedOn: 1`, intensity `0.52`, duration `4.5288s`.
- Joe entered `investigate` with next waypoint x `-12`, y `62`.
- Browser and page errors: none.

### Remote golf-ball trigger

Action file: `web/test-actions/noise-hazard-remote.json`

- Held Space, steered left, and released through the standard input path.
- The shot impacted at x `-12`, y `60` and settled at x `-14`, y `69`.
- `triggered: 1`, `steppedOn: 0`, `remoteTriggers: 1`.
- Active intensity: `1.0`; authored duration: `5.508s`.
- Joe entered `investigate` and routed to x `-12`, y `62` rather than the player's origin.
- The ball remained recoverable and the inventory changed from four to three.
- Visual review confirmed `REMOTE NOISE // JOE RE-ROUTED`, `REMOTE LURE`, and the tactical counterplay message.
- Browser errors: none.

### Baseline regression

Action file: `web/test-actions/first_hole.json`

- Remained in `first_hole` with no false activation.
- Existing objective, optional practice lesson, course map, navigation ribbon, collision guidance, and input legend remained readable.
- Browser errors: none.

## Remaining human check

The mechanic and all input-independent behavior are complete. A physical full-route pass on keyboard, gamepad, and touch should be used only to tune later-zone investigation durations if the hazards feel too forgiving or punitive in hand; it is not blocking the implementation.
