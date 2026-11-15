# Stronger tears and longer moving ghost sightings

Revision: `20261107-longer-ghosts`.

Screen interference now uses five broader pixel strips, stronger contrasting edges and six bounded horizontal-offset steps per pulse. Seen/notice peak is .44 for .8 seconds; rush peak .62 for 1.15 seconds (previously .20/.48s and .32/.55s). Rush can supersede a recently triggered seen pulse. Each cue still triggers only once per encounter, and the center aiming region remains clear. The existing 256x144 overlay and source art are reused, without scene readback, extra WebGL passes or camera motion.

Ambient anchor lifetime is now 11-13 seconds (12 for fallback locations). Moving profiles no longer vanish immediately after approaching: rushers can travel up to 6.2m over 2s, stalkers up to 3m over 3.8s, then pause .85s, walk backward over their checked lane for 2.2s, linger 1.5s and fade over 1.2s. All travel is constrained by the existing obstacle, pond, boundary and player stand-off checks. Watchers keep their still-watch behavior. Real encounters, protected interactions, close-player intrusion and disabled apparitions can still end sightings early.

No extra models/assets, draw calls, navigation queries or animation targets. One ghost remains visible at a time. Comfort settings continue to govern movement, apparitions and interference.

Validation:

- Pure checks pass lifetime/anchor stability, longer presence, reverse gait, finite fade, safe movement, immediate suppression, stronger/longer pulse peaks, rush priority and no duplicate triggers.
- Fourteen hardware site cases and three extended software profile cases pass with unchanged player/Joe/detection snapshots. Actual stronger tearing and backward-walk screenshots inspected at 2560x1600. One ghost draw / 5,648 triangles retained.
- Sampled effects CPU p95 .20ms hardware/.30ms software; max .50ms/2.0ms. These are CPU update samples, not whole-frame GPU benchmarks.
- Release validation (90 action fixtures, 56 referenced images), syntax, whitespace and mouse-limit checks pass.
- All 17 atmosphere groups pass across 2560x1600, 1280x720, 800x600 and 844x390, including depth occlusion, pause, shader preparation and unchanged simulation. Integrated audio/camera checks pass with no duplicate cues or mouse drift. The reduced-motion/zero-density natural run retains a visible stationary ghost at 8.6s with no tear and working apparition-off suppression.
- Normal installed gameplay client completed two iterations / 14 units of travel without error artifacts; final screenshot and state inspected.

Artifacts: `output/longer-ghosts-20261107/`. Human comfort/playtest tuning remains deferred; existing whole-game software-renderer throughput issues are not claimed solved.
