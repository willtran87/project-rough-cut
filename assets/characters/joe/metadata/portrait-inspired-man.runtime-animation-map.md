# Joe Runtime Mower Animation Map

Runtime integration completed July 29, 2026 for the browser vertical slice.

## Canonical Sources

- `../sprite_sheets/portrait-inspired-man_mow-walk-chaotic_FRONT_sheet.png`
- `../sprite_sheets/portrait-inspired-man_mow-walk-chaotic-head_FRONT_v2_sheet.png`
- `portrait-inspired-man.animations.json`

## Browser Runtime Copies

- `../../../../web/assets/joe-mower-animated-v1.png`
- `../../../../web/assets/joe-mower-erratic-head-v1.png`

The runtime copies are byte-identical to their canonical sprite sheets.

## Frame Contract

- Layout: ten horizontal frames
- Frame size: 192×192 pixels
- Shared ground pivot: `(96, 187)`
- Direction: front-facing
- Physical runtime height: 1.95 meters
- Projection: the same focal length, near plane, horizon, and pixels-per-meter calculation used by all Hole 1 props
- Fallback: `web/assets/joe-mower-v1.png` remains available if either animated sheet fails to load

## State Mapping

| Joe state | Runtime name | Sheet | FPS | Frame sequence |
| --- | --- | --- | ---: | --- |
| Patrol | `measured_mow` | calmer mower loop | 3.4 | `0, 0, 3, 3, 5, 5, 9, 9` |
| Investigate | `evidence_check` | erratic-head loop | 5.2 | `0, 3, 3, 8, 8, 9, 4, 4, 5, 0` |
| Search | `erratic_search` | erratic-head loop | 6.4 | `0, 1, 1, 7, 7, 9, 2, 3, 8, 8, 5, 0` |
| Chase | `scope_escalation` | erratic-head loop | 10.5 | `0, 1, 2, 4, 5, 6, 7, 8, 9, 3` |

Repeated frames create intentional holds during calmer states. Investigation favors pause-and-look poses, search favors alternating head and arm checks, and chase uses the complete irregular performance without holds.

Reduced-camera-motion mode retains readable character animation while lowering its playback rate and removing secondary translation and rotation jitter.

## Supporting Presentation

- State-specific mower cadence, gain, and cutter pitch
- Contact-frame grass clippings
- Restrained investigation/search glow and stronger chase rim glow
- Existing state banner, direct label, proximity meter, spatial mower audio, map signal, and pursuit grade remain active so animation is never the only state cue
- Objective markers fade when Joe is guarding the same world position, preventing UI from covering his silhouette

## Validation

- Verified frame changes in patrol, investigate, search, and chase through `render_game_to_text`
- Verified the shared pivot at far, middle, near, and chase projection scales
- Visually inspected investigate and search transitions at 1280×720
- Visually inspected search at 2560×1600 with the stage contained and no document overflow
- The broader character package remains eligible for a future manual paint-clean pass; this runtime map does not erase the remaining source-art notes in `portrait-inspired-man.quality-report.json`
