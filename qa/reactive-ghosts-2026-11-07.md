# Reactive Ghost Joe behaviors

Revision `20261107-reactive-ghosts`. Reload the local game to use it.

Ambient sightings rotate between three profiles:

- **Watcher:** turns toward the noticed player and holds an unnaturally still stare with slow breathing.
- **Stalker:** faces the player, pauses, then creeps up to 1.7 world meters toward the observed position.
- **Rusher:** faces the player for 0.75 seconds, holds a 0.6-second windup, then accelerates along a committed lane up to 4.8 world meters before dissolving. Its silhouette becomes more solid during windup/rush, without flashing or adding an effect pass.

A ghost notices a nearby player or someone looking toward it within 14 world meters, after an initial 0.8-second appearance interval. Solid cover prevents detection. The target is captured once; the ghost does not track through walls or steer after a sidestep. Padded prop/pond footprints and the course border constrain the entire mower lane. The endpoint stays at least 2.2 meters from the original player position; entering the committed lane within 2.05 meters dissolves the ghost immediately and permanently for that sighting.

These are atmospheric encounters: no damage, collision, player-input changes, gameplay noise, detection changes or real-Joe navigation changes. Short authored flash manifestations retain their existing passing animation. Recovery, patrol warnings, cover audits, real encounters, protected interactions and comfort settings suppress ghosts.

The existing 5,648-triangle mesh, atlas, morph poses, wheel shader and one-draw limit remain. No animation mixers, new assets, shaders, render targets or navigation searches. Perception runs at most five times per second before notice; the lane is checked once per encounter. Hardware test samples measured the entire effects update at 0.30ms p95 / 0.90ms maximum; these are CPU effect-update measurements, not whole-frame FPS guarantees.

## Verification

- Pure behavior checks: all three profiles; notice/windup; grounded movement; deterministic duplicate sampling; no input mutation; cover/distance rejection; committed targets; permanent close-range dissolution; full mower clearance; reset.
- Existing ghost-motion and release checks pass.
- Hardware integration: all fourteen sighting locations activate; all three profiles notice the player; an actual rush renders; player, real Joe and detection snapshots stay unchanged; one draw and fewer than 6,000 triangles throughout. A 2560×1600 rush screenshot was inspected.
- Software integration: three representative sites cover all three profiles, with each submitted frame awaited. Rush rendering, unchanged gameplay state and the single-draw cap pass; effects CPU p95 0.20ms / maximum 0.30ms in this sample. No sustained whole-game FPS improvement is claimed.
- All seventeen atmosphere regression groups pass, including depth occlusion, actual walking deformation, mist, comfort controls, pause, shader preparation and four viewport sizes.
- Normal installed gameplay client: two iterations, first-hole gameplay, 14 units of travel, no error artifacts; screenshot/state inspected.

Artifacts: `output/reactive-ghosts-20261107/`. Human suspense/fairness testing remains for later: try staring at a distant ghost, approaching one, breaking sight behind cover, and sidestepping a windup. Confirm that the visual warning reads clearly and the charge feels unsettling without resembling an unavoidable hit.
