# Opening movement-hierarchy polish — 2026-08-02

## Scope

Make the first playable frame immediately actionable without adding another tutorial, persistent HUD layer, mechanic, or route assist.

## Finding

The opening objective was repeated in the dossier and bottom rail, while the movement binding appeared only in the smallest footer copy. The existing route ribbon and objective bearing were visually useful but were not explicitly connected to the player's first input.

## Implementation

- Reused the existing expanded surroundings card as a temporary `FIRST STEPS` card.
- Named the current input method's movement control:
  - keyboard: `MOVE WASD / ARROWS`;
  - controller: `MOVE LEFT STICK / D-PAD`;
  - touch: `DRAG LEFT PAD`.
- Connected that input directly to the existing mint route and its live objective, distance, and bearing.
- Replaced the duplicate locked-gate bottom message with one concise, input-aware movement instruction.
- After ten meters of real travel, the first-step copy yields to normal surroundings and the bottom instruction fades. The existing 18-meter compact-HUD transition remains unchanged.
- Added the visible opening-cue contract to `render_game_to_text` so target, distance, direction, instruction, and collapse threshold are testable.

## Validation

- `output/validate-opening-movement-cue.mjs`: 10/10 assertions passed.
  - keyboard instruction;
  - live route target and bearing;
  - opening signal-lane ownership;
  - redundant gate-message removal;
  - real-movement collapse;
  - manual H recall after collapse;
  - controller wording;
  - compact layout parity;
  - Reduced Camera Motion parity;
  - no browser or page errors.
- `node --check web/game.js`, validator syntax, and `git diff --check` passed.

## Visual review

- 2560x1600: initial cue, collapsed travel state, and manual control recall.
- 1280x720: initial cue, active travel, and Reduced Camera Motion.
- 844x390: compact initial cue.
- The cue remains anchored to the canvas at every size, does not overlap the objective dossier or map, and yields before normal tactical feedback needs the lane.

## Uninstrumented gameplay client

- Initial route: no error artifact; 5.54ms average / 1.80ms last canvas sample.
- Active movement route: no error artifact; 4.98ms average / 1.90ms last canvas sample.
- The player moved 19 meters, the dedicated cue retired, and ordinary surroundings presentation resumed.

## Outcome

The game now answers “what do I press and where do I go?” at the exact moment control begins, then gets out of the way once the player demonstrates intent.
