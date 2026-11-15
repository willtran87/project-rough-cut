# Level 1: movement hearing through cover

Status: verified implementation progress. Full Level 1 scope remains active.

## Reproduced defect and player behavior

The baseline browser check placed the player and Joe on two clear sides of the
actual start hedge,54 course units apart, with movement noise0.7. The existing
world-sound calculation rejected that sound at an attenuated range46.14, while
movement detection ignored the hedge, reached full attention and began a sound
chase. `output/movement-hearing/baseline/blocked.json` records both results.

Local player noise now uses the same distance/material reception as balls and
equipment. Quiet noise at or below0.16 and sources beyond their open-air range
skip the obstruction query. Diagnostics distinguish an unchecked path from a
checked path's range/transmission/blockers. This is an authored gameplay model,
not a physical acoustic simulation.

Footstep and footing noise are now driven by applied ground distance rather than
held movement input. Pushing sprint against the closed gate therefore settles
to silence. Surface, stance, crosswind and filing noise rules remain in place;
filing can still make local noise without movement.

Confirmed audible movement can interrupt ordinary ball, equipment, switch,
closing-round and patrol-reposition distractions. The authored appeal commitment
retains its protection. Patrol reposition is also removed on interruption, so a
stale destination cannot resume after contact loss. Existing sight confirmation
and the delay before a fresh sound becomes a chase remain intact.

Material inspection found that named pine obstacles fell through to structure
transmission. Pines now use the existing vegetation class, consistently with
trees and hedges. This shared correction also affects their existing sound mix.

## Verification

- `node tools/verify-movement-hearing.cjs --baseline`: terminal baseline proves
  the hedge mismatch through the actual Joe perception update.
- `node tools/verify-movement-hearing.cjs`: final terminal pass, eight check
  groups and no page errors. Actual authored vegetation/metal/structure pairs
  reject otherwise-in-range noise without detection or false remembered contact.
  A32-unit loud sound still carries through the hedge; cover is not absolute
  immunity. All authored pine identities resolve as vegetation.
- At noise0.7, the54-unit fixtures measure ranges46.14 through start-hedge,
  40.60 through service-cart and36.12 through mid-boundary. The corresponding
  clear-air case confirms a sound chase. Noise0,0.1,0.16 and a distant source
  remain inaudible without querying blockers.
- Actual W/C+W/Shift+W input from one starting surface yields increasing noise
  in the expected order: approximately0.227/0.131/0.874. Holding sprint into the
  closed gate yields zero applied movement and zero settled noise. Pause freezes
  reception/noise; stopping after resume naturally quiets it.
- All five ordinary distraction types yield to confirmed sound; appeal retains
  its source. A first run exposed retained patrol-reposition state despite chase;
  the implementation now clears it and the final check passes.
- `verify-opening-walk.cjs output/movement-hearing/opening-walk`: terminal pass
  98377. Fresh UI, keyboard and pointer route reaches cover, welcome board and
  Audit Bell with no state placement, final detection0 and no errors.
- `verify-search-memory.cjs`: terminal pass88382, including actual sound/sight
  loss, fresh search evidence, pause, recovery and reacquisition.
- `verify-encounter-refinement.cjs`: terminal pass51703, including all station
  actions, quiet release and ordinary shed/drain victories.
- `verify-ball-hearing.cjs` and `verify-equipment-hearing.cjs`: final shared
  material regression rerun recorded in progress.md; ball already passed before
  and after the pine correction. These cover the actual Space/W/E quiet-release
  combination, protected pursuit/appeal, physical impacts and spatial voice layers.
- Installed standard web-game client final run, screenshots/state and terminal
  result recorded in progress.md. Syntax and scoped whitespace checks pass.

Focused artifacts are in `output/movement-hearing/final/`. Inspected actual
2560x1600 gameplay after stopping. This changes perception and noise production,
not UI layout or new assets. Existing encounter checks cover HUD at four sizes;
portrait layout and physical devices remain unfinished broader requirements.

Opening/search/encounter regressions precede only the pine material correction;
final movement/ball/equipment cases cover that correction directly. No whole-game
frame-rate, human hearing, fairness, fear or fun acceptance is claimed.

## Remaining scope

Other authored alarms/station reception, stacked acoustic material ordering,
global distant announcements, tactics that reference live player state, and
visibility rules based on requested movement need continued review. Whole-route
stealth balance and near-pass tension remain open alongside the visual, dramatic,
responsive and performance work. Prior legacy atmosphere-test gaps remain open.
