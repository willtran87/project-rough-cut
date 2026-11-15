# Ghost Joe movement — 2026-11-07

Ghost Joe now takes slow, grounded steps while pushing his mower, then settles into a gentle idle with a small head turn. Both event and ambient sightings use the motion. The original pixel texture atlas style and spectral cutout remain.

Six morph poses come from the original Joe PushWalk animation; two idle poses add breathing and head movement. Gait phase follows distance travelled. Mower wheels rotate rigidly around their own axles, avoiding the wheel shrinking that ordinary pose interpolation would cause.

Each sighting chooses one fixed forward lane, up to 0.75 m long, and eases in/out over 2.6 seconds after a short initial hold. The lane checks solid footprints, water and course bounds, including clearance for the mower ahead. Blocked ghosts idle in place. They do not follow camera turns, chase the player, alter detection or participate in collision/navigation. Terrain height follows the moving origin.

Pause and duplicate renders freeze the animation. Reduced Motion and the independent Ghost sightings preference retain their existing behavior. Original horror-director event durations and cooldowns are unchanged, so brief flashes can disappear before completing the full movement.

The model remains one mesh/draw, with 5,648 triangles and one 1024-square atlas. Eight baked poses and wheel pivot attributes increase the GLB from 708,644 to 1,690,024 bytes (about 0.94 MiB more). There is no ghost skeleton, animation mixer, AI agent or shadow pass. Geometry, morph resources and shaders prepare behind the existing loading gate. This preserves the bounded draw count; it is not a claim of zero added rendering/load cost or fixed software frame spikes.

Verification:

- Pure motion tests: eased movement, terrain height, distance-driven gait, fixed anchors, duplicate timestamps, reset, blocked/limited lanes, swept mower clearance, pond and border limits.
- 17 atmosphere groups pass on hardware and SwiftShader. A fixed-anchor framebuffer comparison proves actual walking-pose deformation. Ghosts still disappear fully behind opaque cover.
- Original mist, course tears, floodlight haze, replay trails, comfort controls, pause/map, scene replacement and first-event shader reuse all pass.
- Walk-phase screenshots inspected at 2560×1600. Suites also cover 1280×720, 800×600 and 844×390 touch.
- Failed ghost loading retains the original apparition fallback; disposal during loading leaves no actor/overlay. Release verification passes 90 fixtures without warnings/failures.
- The installed normal-play client passed three iterations: 28 units travelled, 586 scene submissions, all eight ghost poses loaded, no renderer errors or error artifacts. Final screenshot/state inspected; syntax and whitespace checks pass.

Evidence: `output/ghost-motion-20261107/`. Original Joe model, movement, pathfinding and visibility optimizations were not modified. Local revision: `20261107-ghost-motion`. No commit or deployment was made.
