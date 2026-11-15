# Back Nine visual finishing and acceptance

This records the current continuation of the 48-item visual upgrade. The ledger remains the authority for completion; this report does not turn unverified requirements into completed items.

## Implemented in this continuation

- The garage now has 24 connected shutter sections that follow vertical guides, a continuous curved transition, and overhead rails. A drive wheel and bounded track dust follow the actual release/sealing state. Three contained interior fixtures provide the exterior/interior contrast. Pausing halfway through sealing previously reopened the visual shutter; its authoritative gate fraction now survives pause.
- Fairways have curved deck overlaps, interrupted shoulder passes, and irregular rough boundaries. All six greens have worn cup collars, repaired plugs, terrain-following flag/pole contact shading, and numbered cloth flags from a shared nearest-filtered atlas. Flags retain their rooted edge and stop fluttering with reduced motion.
- Four service courts have feathered gravel shoulders, discontinuous tire wear, drain sediment and localized repair stains. The four bunkers retain their physical boundaries, damp irregular banks and footprint trails, with differently oriented interrupted rake fans.
- Vegetation, tree islands, fixed foundations and movable/destructible objects have terrain-conforming contact shading. Destroyed objects lose their intact footprint; the released range cart's footprint follows its movement.
- Destruction now has separate cart, fence, planter and timber collapse poses. Recognizable crushed bodies remain above the terrain. Fixed pools retain tapered wood, folded metal and leaf debris; impact dust dissipates. Reduced motion shows settled pieces immediately, and retry clears all aftermath. Washer/trolley cues use metal impacts.
- Outer woodland is composed around nursery, ridge and garage encounters. Existing tree islands gain climbing stems and lobed ivy. These changes preserve collision-bearing trunks, routes and escape gaps.
- Joe's visible drive pulleys rotate, attached chains sway with actual speed, and loose rear panels vibrate while traveling. His existing suspension, wheel motion, mouth, hydraulics, feed roller and flexible hoses remain authoritative. Pause/reduced motion and retry are supported.
- Relay chargers have mechanical housings, analog remaining-charge instruments, ribbed contactor grips and connected conduits. The needles and contactors reflect the existing finite charger state; they add no new interaction or repair supply.

## Verification

Geometry/rules: `verify-garage-motion.mjs` (1,001 guide samples and 101 section sweeps), `verify-scenery-contact.mjs` (terrain interior contact and dynamic footprints), `verify-break-finish.mjs` (483 poses, all-object fixed capacity, pause/reduced/retry/disposal), `verify-back-nine-ground-art.mjs` (identical synchronous/asynchronous construction), `verify-back-nine-bunker-banks.mjs` (upward finite geometry, terrain contact, route clearance, unchanged navigation), and the existing course-destruction, runner-controls and Back Nine simulation suites passed.

Current browser evidence, under `output/back-nine-visual-upgrade/`:

| Area | Evidence | Checks |
|---|---|---|
| Garage | `garage-motion/native`, `garage-motion/software` | Actual cart and foot release → enter → seal → complete, pause during both motions, retry, reduced motion, desktop and portrait |
| Ground/flags/courts/bunkers | `surface-finish/native`, `surface-finish/software` | All six greens, four bunkers, two courts, fairway and tree island; 2560×1600, 1280×720 and 390×844; pause/retry/reduced; no browser errors |
| Destruction | `break-finish/native`, `break-finish/software` | Real mower collision entry points, intact/burst/crushed states, stable resources, persistent wreckage and reset |
| Trees/framing | `tree-finish/final-native`, `tree-finish/final-software` | Three normal encounter cameras and ivy approach; responsive/reduced/pause/retry |
| Mower | `mower-mouth/native-final` | Raised/drop/lowered, hydraulic endpoints, side/front/whole machine, pause/reduced/retry and stable prepared resources |
| Integrated effects/charger | `final-polish/native`, `final-polish/software` | Actual finite charging, instrument state, all 35 objects broken with wet turf and nearby Joe, settling, no shader/texture growth, full restart, responsive layouts |

The installed gameplay client also ran the garage sequence on both renderers and current surface traversal on native. Its wrapper adds presentation fences and full-page captures; simulation/input comes from the installed skill client. These are separate from controlled visual staging.

## Current Level 1 comparison and limits

Fresh native Level 1 opening and maintenance views are in `parity-current/`. The maintenance capture shows the reference's weathered timber, roof thickness, hardware, vegetation and restrained warm light. Back Nine now uses the same architecture/needle/verge art families, with dedicated high-resolution turf, mower, runner and flag artwork. Source density is approximately 285 texels/m for 1254px turf over 4.4m, 301 for 512px masonry over 1.7m, 488 for close weatherboard over 1.05m, and 271 for the 190px hedge crop over .7m. These are cropped source dimensions, not the full architecture atlas size.

The integrated native stress fixture retained 2560×1440, with a 17.2ms median and 18.9ms P95 presentation time. It is a controlled 60-frame maximum-debris fixture, not a whole-game frame-rate guarantee. Software retained correct state and passed the same checks but fell to 640×360, with an 89.2ms median and 106.7ms P95. Software fidelity/performance remains an actual outstanding issue; it cannot be called accepted merely because functional assertions passed.

The shared pine builder gained an optional wind hook; Level 1 does not opt in, and its fresh reference views were checked after this change. Back Nine navigation, collision rules, failure checkpoints and bell placement were preserved in this finishing continuation. No commit or deployment was performed. Existing shared workspace edits were retained.

## Final finishing changes and regression coverage

- A shared spatial gust field coordinates canopy, cloth flags, hedge shoots and verges. Lower trunks stay fixed; canopy displacement is capped at 20 cm with padded culling/light bounds. The shader applies the same bend to branches and needles and adjusts normals. Pause and reduced motion stop the motion.
- Mower spray now distinguishes brown wet-soil clods from flat green grass, within the existing 96-particle pool. Wood, bent metal, leaves, dust and sprinkler water keep distinct shapes and lifetimes. Settled feature poses are cached, and fragment instance buffers are disposed.
- Low mist catches the finite headlight cones at each clipped mist chord's midpoint. This is bounded approximate scattering, not volumetric shadow mapping. Existing opaque-surface shadowing remains. Dry areas have no added light haze.
- The final visual inspection caught hard tree-bed polygons. Their edges now feather into turf through the existing soil-margin material; no texture, light or update loop was added.
- The charger capture was moved to an unobstructed normal player position so the new analog meter can actually be reviewed.

Current additional evidence under `output/back-nine-visual-upgrade/`:

| Area | Current report | Result |
|---|---|---|
| Shared gust/soil/mist | `wind-mist-finish/native`, `wind-mist-finish/software` | Native318354/software29981 changed canopy pixels; reduced motion byte-identical; mist response present inside hollows and absent outside; soil peak11; no errors |
| Actual foot chase | `wind-mist-finish/client-native-final`, `client-software-final` | Installed client, same input and exact matching player/clock state; native2560x1440, software640x360; rendered images inspected |
| Planting bed edge | `tree-finish/soft-bed-native`, `soft-bed-client` | Four current vista/ivy views, reduced/pause/retry and responsive checks; actual traversal; hard edge removed |
| Runner | `player-face/native-final` | Face/hair/cloth1254px sources, gear, multiple lights, front/back/seated/motion, pause/retry and responsive checks |
| Districts | `final-polish/districts` | Nursery, range, terrace, relay, cart and foot views; stable state/resources and retry |
| Mower aftermath | `final-polish/scars` | Dry curved slope, wet ruts and drained ruts; pause/reduced/retry and responsive views |
| Intermittent irrigation | `final-polish/irrigation` | Three natural cycles, head rotation, boosted32-drop emission, drying, pause/reduced, responsive; stable41programs/58textures |
| Current headlights | `headlights/native` |12views including turn, wet, cover, garage, slope and runover; body attachment, shadows, pause/retry;41programs/58textures/2668uploads stable |
| Beacon | `beacon-finish/native-final` | Peak/trough, wet/player, comfort/pause/resources and responsive;1612 clipped red pixels out of524579 red pixels,0.31%; current close view inspected |
| Fixture lighting | `final-polish/practical` |13views including source-off light proof, garage and shelters, red overlap, reduced/retry and responsive |
| Cameras | `final-polish/route-cameras` |1601 actual scene camera positions on11cart/14foot routes; independent solid-volume/terrain tests, zero violations/errors |
| HUD | `final-polish/hud` | Keyboard2560/1280/390; touch844/390/320; captions,44px controls, movement, pause/retry and fullscreen; no overlap/overflow/errors |
| Maintenance stories | `final-polish/maintenance` |12current approach/detail/responsive views across five distinct repair/supply bays; no errors; abandoned repair detail inspected |
| Source delivery | `final-polish/source-manifest.json` |25current modules syntax-checked and HTTP bytes verified against disk; SHA256 recorded; import map cache versions refreshed |

The geometry/rules aggregate is now15/15 passing. Two old test assumptions were corrected: the headlight test now mounts the real player body lamp, and the planting cap recognizes the already-authored5450 plants while retaining route/footprint assertions. The current beacon test has an explicit after-only mode with a <2% peak clipping bound; its old mixed-version baseline run was stopped and is not counted as a pass. A first installed-client attempt omitted the Back Nine startup flag; only the corrected `client-*-final` runs are acceptance evidence.

## Level 1 comparison

The final six fixed reference images in `parity-current/reference` show Level 1's maintenance and service buildings at2560x1600,1280x720 and390x844. These supplement the actual installed-client opening and maintenance captures. Back Nine's current maintenance detail uses the same weathered timber/stone art family and adds recessed equipment, supplies, drawers, hardware and interrupted repairs. Its relay interior exposes joined roof framing, drainage, lamps and functional instruments. Nursery and clubhouse vegetation retain Level 1's detailed leaf/needle art with authored grouped placement, ivy and coordinated wind; open range areas preserve chase sightlines. Dedicated fine turf, worn shoulders, bunker banks and mower scars avoid the earlier empty smooth ground. Runner clothing/face/gear and Joe's machine remain detailed under moonlight, work lights and the red beacon.

On the inspected GPU-rendered views, Back Nine meets the Level 1 bar for material detail, vegetation, structures and readable nighttime composition. It exceeds that reference in the scope of reactive scenery: mower destruction/aftermath, wet/dry irrigation, moving machinery and the sectional garage finale. This is a visual review of the captured gameplay and states, not a claim about every untested device or every possible camera pose.

## Final combined-load acceptance

The final fixture covers cart travel and a separate foot view facing Joe across the flooded range, with a nearby wreck and all35 destructible states active. It checks burst, settling, persistent aftermath, pause, responsive layout and full restart. No shader/texture growth or browser errors occurred. Native retained2560x1440: cart median19.2ms/P95 24.0ms, foot median20.2ms/P95 26.6ms. These are controlled GPU-fenced50-sample measurements after warmup, not a sustained whole-game frame-rate guarantee.

The high-resolution visual acceptance is explicitly scoped to GPU-accelerated rendering. CPU-only software rasterization is a compatibility fallback and remains below that quality/performance bar; its previous failures are not erased by native acceptance. That limitation is recorded separately in the ledger, rather than treating a low-resolution functional pass as high-resolution parity.

Final checklist state:48/48 visual items accepted for the GPU-rendered target. The software fallback limitation remains open, with final640x360 cart116.2ms median/282.6msP95 and foot138.3ms median/187.4msP95. Its functional assertions and resource/retry checks pass; its image was inspected and is visibly coarser. This is not a software performance signoff.
