Under the Green district materials and landmarks — November 12, 2026

The five districts now use different construction surfaces rather than differently tinted copies of the same busy stone atlas:

- Root gallery: muted brick, pavers and three physical masonry arches.
- Bunker: broad sand strata behind the existing timber retaining structure.
- Pump house: quiet concrete with form seams and tie marks, a wall band, and the existing painted machinery.
- Abandoned range: vertically joined metal panels behind its steel ribs and range net.
- Keeper room: tiled walls, brass trim and a framed championship-green drainage survey.

`web/under-green-surfaces.js` creates six small, deterministic pixel tiles at startup. Their coordinates stay attached to world geometry at a two-metre repeat. Joints and clustered wear replace the previous high-frequency photographic noise. The original timber, turf, Joe, water signals and lighting remain in use. There is no per-frame texture generation or new downloaded art asset.

The keeper survey is fixed scenery foreshadowing the planned finale, not a new interaction or an implemented third level. Its geometry is registered with the camera-clearance inspector. Its face initially displayed mirrored text; corrected its orientation and checked the rendered result. Reduced its width from 3.2 to 2.3 metres so the full drawing is visible from the tested portrait approach. Generated surface, survey and net textures have explicit disposal.

The first arch layout ended short of the widened entry walls. Corrected its span to ten metres at y=10, with six-metre spans at y=22 and y=30. Blocks now meet each other and the actual walls. Their lowest detail stays above player eye clearance; no floor boundary, movement, water rule or enemy behavior changed.

Verification:

- `tools/verify-under-green-district-art.cjs`: five before views; twenty final views across 2560×1600, 1280×720, 844×390 and 390×844; five additional desktop rear views after actual keyboard strafing and rear glance. No page errors. Inspected root arches from both sides, bunker, pump, range and keeper views, including the portrait survey and landscape crossing. The district HUD name was hidden in these captures, but other contextual labels remain; this is not a blind recognition study.
- `tools/verify-under-green-structure.cjs`: 802 standing/crouched floor samples clear, 22 views, retained 48 retaining edges and six roof transitions; sky pause/reduced-motion and range-net sightline checks pass.
- `tools/verify-under-green-camera.cjs`: 23,424 environment plus 696 gate/actor camera samples clear; real keyboard bank/jamb/opening checks pass. These are sampled views, not an all-space clearance proof.
- Required standard Playwright client: two iterations pass; latest screenshot and state inspected, ready/playing with 3.84 m/s movement and no error artifacts.
- Syntax and whitespace checks pass for the edited runtime modules.

Rendering measurements were run separately from browser QA on the available desktop. Five matched 2560×1600 views changed draw counts from 228/287/71/168/68 to 228/288/71/169/69 (root/bunker/pump/range/keeper). Additional shapes stay in existing material batches; the framed drawing adds one visible draw. Texture counts in the before and after galleries are not a controlled memory comparison because the after run also visits rear views and uploads additional visible resources.

On the RTX 3090 at 1280×720, three fixed views measured median GPU-completed frame times of 7.9/6.9/7.0 ms, with p95 9.0/9.0/8.1 ms. Local ready time was 1,306 ms. SwiftShader fixed views at 960×540 measured medians 53/46/47 ms; its adaptive live run selected 640×360 and rendered 105 frames over 3.99 seconds while RAF/input updates stayed around 16.7 ms (p95 16.8 ms). This includes initial quality adaptation, not a steady-state FPS guarantee. The low-resolution full-page capture retains clear HUD text and physical signals. Resource counts were stable over this short run (269 geometries, 55 textures, 21 programs); this does not establish long-session memory behavior or physical-phone performance.

Evidence: `output/under-green/district-art/before/`, `after/browser.json`, `after/hardware.json`, `after/software-live.json`, `standard-client/`; existing structure and camera reports were refreshed. Earlier renderer reports were copied to `before/prior-*.json` only as historical records, not as matched performance baselines.

Review items 25, 26 and 30 have concrete new implementation and visual evidence. Unfamiliar-player district recognition, broader animation/art acceptance, physical-device usability and sustained hardware qualification remain open. The full 44-item goal is not complete.
