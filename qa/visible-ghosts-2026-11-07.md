# Visible Ghost Joe sightings

Revision: `20261107-visible-ghosts`.

The earlier site coverage used deliberately clear camera positions. It proved the models rendered but missed sightings hidden behind hedges along normal routes. Ambient timing also used a clamped decorative clock, which stretched delays at low presented frame rates. Reduced Motion and zero atmosphere density could hide sightings despite the independent Ghost sightings preference being enabled.

## Changes

- Check line of sight as well as frustum and footprint when selecting authored sites.
- If no authored location qualifies, try up to fifteen clear-ground positions ahead of the player. Reject solid footprints, ponds, blocked sight lines and course boundaries. Keep the selected anchor fixed throughout the sighting.
- Schedule ambient sightings and reactions on elapsed game time, with pause/reset handling. Preserve the separate decorative motion clock.
- Allow the first ambient sighting after eight seconds of play, without adding a second suppression delay. Existing protected interactions, actual Joe encounters and tension-director suppression remain authoritative.
- Increase the ambient dither envelope from .38 to .52. Reuse the original pixel atlas and single 5,648-triangle draw; no new assets or shaders.
- Keep ambient sightings independent of atmosphere density. Reduced Motion presents stationary ghosts with no reaction movement or interference. Ghost sightings off still disables all apparitions.

## Verification

`tools/verify-natural-ghosts.cjs` uses default player position, actual opening movement input, the live directors and original site list. It does not relocate Joe, force a ghost event or pick a special camera position. The first visible apparition appeared at 8.6 seconds, on the left of the opening route, with the player at x=0/y=14.4. The 2560x1600 screenshot was inspected. A separate Reduced Motion plus zero-density run also passed, with zero walk weight/distance, still behavior and no tear. The apparition-off check passed in both runs. No browser errors.

Pure reactive behavior and feedback/mouse-limit checks passed. All 17 atmosphere regression groups passed, including world-depth occlusion, morph animation, mist pixels, pause, unchanged simulation and viewport checks at 2560x1600, 1280x720, 800x600 and 844x390. Release validation passed all 90 action fixtures and 56 referenced image assets.

Artifacts: `output/visible-ghosts-20261107/`.

The separate `--fallback` integration case deliberately removes authored sites to exercise the new route placement. It produced a clear-ground apparition at 8.6 seconds from the unchanged opening camera; its 2560x1600 screenshot was inspected. The installed normal-play client completed two iterations, reached first-hole gameplay and travelled 14 units without error artifacts; final screenshot/state inspected. Syntax and whitespace checks passed.

Existing user tabs/settings were not accessible for inspection. Reload the local page to obtain this revision; saved Ghost sightings remains authoritative. Human pacing/comfort playtests remain deferred. These checks do not establish a whole-game software FPS improvement.
