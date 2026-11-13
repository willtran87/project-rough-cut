# Current quality reset contract — 2026-11-06

**Gameplay refinement — 2026-11-07:** fixed sagging rope connects the 88 side-boundary spans at the existing post line. It adds a visible edge beyond the playable hull without changing collision or navigation. A successful distant golf-ball diversion now permits a silent release signature without replacing Joe's existing investigation. Joe pauses and orients on new investigation/pursuit states; inspection/search head poses retain the mower grip. The authoritative close-contact warning, recovery window and HUD exception are specified in [action-response-contract.md](action-response-contract.md). These changes preserve movement scale and original pixel surface materials.

**Current default — meaningful pixel 3D:** the [pixel 3D art direction](pixel-3d-art-direction.md) supersedes the whole-prop illustration rules immediately below. `pixel-world-props.js` supplies fixed geometry for structural scenery and interaction mechanisms. Carts no longer switch pictures or change projected width; hedge/stone volumes follow the real hulls without painted recesses. Beveled forms, masonry, rails, tyre tread, lathed bells, tree cores and layered fixed foliage create actual depth. Restricted procedural pixel surfaces and selected original material/foliage detail preserve the art language. Triplanar surface coordinates stay attached during animation. Local moon shadows and one nearby station light explain volume without changing gameplay visibility. Static geometry batches by material and spatial chunk; moving parts remain independent. `?art=illustrated` retains the previous candidate. Joe now uses `joe-model.js`: a 17-bone GLB with pixel material maps, a rigid mower, four distance-driven wheels, and baked push-walk/planted-idle clips. Heading and position follow authoritative gameplay state; camera orbit never selects a facing image. The directional sprite remains a loading/error fallback and `?joe=sprite` comparison. Small foliage components and distant illustration layers remain intentional uses of flat art.

**Pixel finish:** `terrain-finish.js` combines the route-color atlas with source turf detail at a fixed 2.4-meter repeat scale. Stable gravel/shoulder marks follow existing path segments; station contact shadows are baked into the same terrain canvas. Six instanced planting variants stay low at path shoulders, with later-zone dry varieties. Original closed-back hedge recess artwork supplies the leaf/branch silhouettes without opening a new passage. World labels use original timber grain, a restrained border and fasteners; station labels are slightly smaller. Lamp glow coordinates match the source-art lanterns, and completion seals replace floating indicator bulbs. Cooler ground illumination does not alter gameplay exposure or floodlight radii. No new decorative animation or motion is introduced.

**Latest art refinement:** `illustrated-props.js` now draws full original silhouettes for stations, pickups, directional carts, foliage, stone, reeds, lights, signs, boundary posts and facades. This supersedes the older solid-cart/surface-patch descriptions below. Props are upright camera-facing 2.5D cards, with fixed building facades; carts select four authored directions with hysteresis. Cover width follows the projected existing hull. Collision and occlusion logic continue to use authoritative gameplay hulls, not image alpha. Full pictures do not provide continuous volumetric parallax within an individual prop.

Fresh settings default to 1280x720 world resolution (50% remains 640x360); saved user preferences are respected. Source pixels remain intact with nearest magnification and mipmapped minification. Five-layer background parallax, movement and navigation remain active. Illustrated stations respond with a brief rock/warm tint and persistent completion seal; pickups retain visibility/state feedback, and the physical shed door and drain grille still animate. Mechanical lever/wheel animation belongs to the smooth comparison, not the single-piece station illustrations.

This section supersedes the historical renderer descriptions below. `web/quality-core.js` owns physical scale, reticle aiming, stance interpolation, visibility cone, instruction priority and fixed route centerlines. `game.js` supplies authoritative obstacles, mechanisms, lights, actions and state; `scene-3d.js` renders them; `quality-ui.js` presents the ordinary HUD.

- Physical scale remains `.16` scene meters per course-distance unit; authored X uses `.72`. The player radius is 2.4 course units. Cart hulls are boxes with half extents 9×5; shed walls are boxes; other cover uses ellipses. Collision inflation is the player body clearance. Tangent sliding supports both shapes and checks neighboring solids.
- Immediate walking/reversal/release is the default. The optional comparison ramp only affects initial movement. Mouse yaw/pitch are raw; each input device has one effective sensitivity. Crouch changes tactical stance immediately while eye height approaches 1.12 m from 1.65 m exponentially. Aim is never filtered.
- Ground aiming intersects the camera's vertical angle with the flat course plane, bounded to the legal range. Charge controls loft and roll. Preview and release use `golfBallShotPlan`; spatial preview and flight share `RCQuality.chipPosition`. Gold ring = first impact; pale small ring and dashed segment = final roll destination. Walls/banks retain the shared course collision calculation; this is not a general 3D rigid-body ball simulator.
- Interaction selection and commit require the same range, line-of-sight and view-cone tests. There is a small incumbent margin. Exact physical overlap has no stable bearing and permits Use. The same gate applies to keyboard, controller and touch choices.
- Static art is batched into spatial chunks. Default presentation keeps the world on the GPU and places a DOM HUD over the visible canvas. `?presentation=copy` retains the measured old copy path; `?renderer=legacy` retains the earlier 2D comparison. Expanded maps, pause and menus still upload the Canvas UI. A canvas-only screenshot omits the native HUD; use full-page captures for acceptance.
- Authoring data defines route centerlines directly. No runtime solver draws the ground paths. Every centerline is checked with body clearance and against ±112 course-X bounds. Navigation planning can still choose a safe approach to an action.
- Light-pool positions, radii and power come from actual exposure data. Cosmetic head turning does not suggest extra vision: Joe's body orientation owns perception. Inspection visibly pauses the mower. Completed log ink, release lever, valve, drain grille and shed door consume real mechanism state.
- HUD priority is sealing → filing → quiet hold → aim → danger → choice → interaction → lesson → objective. Resources and captions are secondary. Touch pads occupy their own bottom corners; inventory moves to the center. Comfort controls are available from normal menu/pause/settings, separately from the later study form.
- Spatial ball particles use bounded world-space pools. Mower acoustics retain distance/cover filtering and camera-relative pan. Ball impact and settle cues now use the same directional convention, attenuate with distance and filter through cover. Real listening sessions remain required.

The acceptance ledger deliberately separates engineering, regression, visual inspection, measured pacing and player acceptance. Earlier results below are historical, not evidence for this candidate.

---

# Perspective candidate contract — November 6, 2026

The default local gameplay renderer is now `web/scene-3d.js`, using the vendored Three.js r187 WebGL2 runtime. `?renderer=legacy` selects the previous Canvas presentation. The old contract below documents that comparison renderer; its projection and speed-bonus conventions do not describe the new view. This is an engineering candidate, not user acceptance of its art or feel.

- Authoring coordinates remain compatible with the existing game: physical X is authored X × .72; physical forward is authored Y. Both then use **.16 meters per physical course unit**. The scene is approximately 115 meters long. Gameplay telemetry still stores course units.
- One perspective camera uses vertical FOV 58° by default (adjustable 45–85°), eye height 1.65 m, crouched height 1.12 m, near plane .055 m, player clearance radius .384 m. There is no separate horizontal projection gain.
- Walk/sprint/crouch/listen translate at 3.84/6.08/2.4/2.4 m/s before material cost. Perspective movement removes roadmap and second-wind speed multiplication. One blended, most-restrictive terrain cost remains. Optional 80 ms start response always brakes immediately on release; reversal restarts the ramp. Immediate response is the default, pending comparison by players.
- Mouse, controller and touch have separate sensitivity multipliers, in addition to the existing base sensitivity. Pitch clamps to ±.85 radians; inversion of vertical look is independent. Bob, roll and impact shake remain independently optional and reduced motion overrides them.
- Uninflated authoritative cover ellipses generate scene volume. Clearance inflation represents the player body. Cart equipment trays fill the collision footprint. Decorative foliage can overhang slightly; collision is not inferred from foliage pixels. Actual gameplay collision still uses stable small-step ellipse sliding and multi-obstacle checks.
- Geometry is depth-tested, world-fixed and visible from front, side and rear. Ground textures use mipmaps and anisotropic filtering. A shared low-poly material kit replaces sprite/mesh mixtures. Default 960×540 scene rendering is composited into the existing 1280×720 HUD canvas; resolution is selectable from .5 to 1.0. UI remains at logical resolution. This copy/compositing path and shared-host frame pacing still require target-device qualification.
- Paths are fixed collision-planned routes, including secondary approaches that reconverge at the three checks. Zone signs use the same names as the map. Standard's drain valve now sits at the water crossing instead of behind the first objective.
- Light-pool radius and power derive from the same lightRadius and floodlightPowerAt values used for exposure. Station mechanisms, Joe facing/inspection, ball flight/roll/recovery, material footstep rings and bounded mower clippings use live game state. Aim arcs share the trajectory height with flight; a landing target does not guarantee a stationary final ball on rolling surfaces.
- Nearby prompts use the existing single-owner arbitration; direct choices invoke the same action. Contextual text suppresses routine messages when an action/lesson owns attention. Existing captions, hearing, cover filtering, pursuit, capture explanation, pause and retry remain live.
- Gameplay displayed meter labels convert course distance to scene meters at draw time. Internal telemetry and existing historical reports retain their original units. Do not combine them without conversion.

## Previous Canvas contract (legacy comparison only)

# Rough Cut — movement, space, and presentation contract

This build keeps the Canvas renderer and introduces depth-sorted solid cover and inverse-projected terrain. It is an incremental renderer prototype, not a claim of a full 3D engine or finished art direction.

## Shared coordinates

- Authored X becomes physical distance by multiplying by `0.72`; authored Y already uses the movement-distance unit. A vector's physical length is `hypot(dx * .72, dy)`.
- Yaw zero faces increasing Y; positive yaw turns toward increasing X. Movement and projection use the same rotation. Diagonal input is normalized before this transform.
- Projection uses a 282-pixel horizon, 1.65 camera-height parameter, 1800 focal parameter, 8-unit near offset and `.12` horizontal visual conversion on the 1280×720 stage. These are the retained stylized projection parameters, not SI optics. Ground sampling inverts precisely this contract, including the optional lateral camera offset and signed depth at the bottom of the view. A safety clamp stays behind the visible near region; near-ground rows no longer repeat the same zero-depth sample.
- Collision inflates authored obstacle ellipses by the player's clearance radius. Solid hedge/stone geometry uses the obstacle's uninflated footprint; the extra collision margin represents the player's body. Contact motion follows the tangent of the ellipse and checks the whole result against neighboring obstacles.
- Walking, sprinting, crouching and listening have base speeds 24, 38, 15 and 15 physical distance units/second. Release braking is immediate. Terrain blends toward the most restrictive material multiplier over a short exponential transition; it does not multiply two simultaneous terrain penalties. Existing signaled roadmap/second-wind bonuses remain.
- Gait and footsteps use applied distance, not held keys. Default camera bob, lean and impact shake are off. Camera decoration must not change movement, targeting, collision or perception.

## Spatial presentation

Terrain is a fixed atlas of paths, grass, rough, sand and wet/muddy footing. Paths are authored once from collision-checked route segments. They do not move when the objective changes. A continuous inverse-projected floor is drawn every frame. Background rasterization remains half resolution but its pose now updates on every presentation frame; there is no separate 20/30 Hz scenery timer.

Hedges, stone cover and hedge openings use depth-sorted faces with clipped near geometry and stable local texture coordinates. Existing directional sprite artwork remains for Joe and carts. This hybrid avoids replacing the whole game before the movement slice is evaluated. It still has painter-order and sprite limitations; do not call it general depth-buffered 3D.

## Art specification for this pass

- Quiet blue-gray background; dark green cover; desaturated lighter paths; brown sand/mud; warm amber interaction accents; pale green successful evasion. Reserve bright warm threat accents for immediate danger.
- Keep terrain detail lower contrast than props. Use repeating material texture in world space; never scale one small hedge picture across a nearby wall.
- Props touch the same projected floor. Shadows sit at the base even when a bell or mechanism animates. Cover sides and top communicate thickness before decorative leaf detail.
- Use restrained, hard pixel edges at the existing 1280×720 logical resolution. Background art may be softer and quieter. Avoid outlines/glows on every object.
- Keep the opening lane, wet crossing, maintenance enclosure, light-controlled range and exit threshold distinct through their existing large props and arrangements. Review recognition without labels in the later study; pennants and labels alone do not certify landmark quality.
- Default foreground fringe is removed, fog is reduced and redundant routes/footprints/callouts are hidden. Expanded navigation remains available through Listen/map and the route setting.

## Interaction and feedback

One displayed object owns the prompt. Nearby stations score distance, facing and a small incumbent bias. Direct quiet/loud, ball/blackout and cart/hedge choices share the same interaction function as expert posture + Use. Keyboard 1/2, controller RB then A, and visible pointer/touch buttons all commit that choice. Quiet filing supplies crouch only for the hold and releases it afterwards.

The small HUD presents the current action, inventory/access and a single bearing. Threat/relief is contextual. Direct choices replace the old verbose bottom prompt. A selected exit preference constrains the destination candidates, not collision or access permissions.

Bell swing, log lift/stamp and release motion begin on the same activation as their existing audio. Threat and interaction audio duck ambience; output passes through a compressor. Sampled post-compressor peak data is diagnostic only and cannot certify perceived loudness or exhaustive absence of clipping.

## Practice and qualification

Movement practice uses separate collision geometry and bypasses campaign perception, terrain hazards and progression. The bell encounter reuses the real interaction, lure, perception and clean-break rules; its other checks are precompleted only inside an explicitly marked rehearsal. Practice does not earn career records. A successful bell clean break opens the completion pause once; retry restarts the same practice.

Automated checks establish coordinates, transitions, collision and rendering behavior. They do not establish enjoyment, good landmark recognition, comfortable physical controls, audio localization or sustained 60 Hz on target devices. Those observations remain in the prepared human study.


## Pixel-art restoration - November 6

At the user's request, original illustrated pixel art is the default again. Joe uses the shipped four-direction walk/state atlases and front mower poses; trees and sky reuse authored scenery. Hedges, stone, wood and cart paint use patches from the original illustrations on current solid geometry. Cart surfaces remain three-dimensional at oblique views; collision boxes do not change. No movement, target selection or route coordinates were reverted.

The world uses nearest-neighbor presentation at 640x360 by default, 320x180 below 75% scene resolution and 1280x720 at 100%. The native HUD stays sharp and restores monospace type and square panels. `?art=smooth` retains the prior scene comparison. Original assets are reused in memory; there are no new exported art files.


## Detail and parallax refinement - November 6

Supersedes the prior resolution paragraph: world resolution now follows the existing slider directly (640x360 at 50%, default 960x540 at 75%, 1280x720 at 100%). Full-resolution source patches preserve leaf, timber and paint detail. Nearest magnification retains source pixels; mipmapped minification reduces distant texture shimmer. Native HUD resolution remains unchanged.

A separate far scene contains sky/moon, clouds, ridge, trees and estate illustrations. Their translation influence increases with proximity (0, .025, .08, .30, .65); each receives the same camera orientation and FOV as gameplay. The main scene's collision, near projection and draw distance are unchanged. Background depth is cleared before the physical scene renders, so scenery cannot occlude interactables. Clouds have slow decorative drift; Pause and reduced motion freeze that drift without suppressing camera-driven parallax.

Low foliage is instanced inside cover or outside the course bounds, plus small opening verges clear of the path. Warm guide/station glows are depth-tested decoration. No new collision or route edits.


## Current 3D performance contract — November 7

Static geometry batches share materials by shader/texture configuration, with tint preserved as vertex color. Animated station mechanisms, completion ink and lamps remain independent. Spatial chunks retain frustum culling. Joe uses the original 141,248 runtime triangles nearby and a 22,598-triangle real skinned mesh beyond 14 m; he returns to original geometry below 11 m. Both use the same original materials, skeleton, animation clock and grip. A conservative whole-actor frustum bound skips offscreen draws. Shadows refresh immediately for camera translation or mechanism changes and at up to 30 Hz for stationary animation.

Hardware keeps the original pixel textures, full requested resolution, shadows and parallax. Detected software renderers cap scene resolution at 75%, use 36 m far clipping with 18–34 m fog, omit dynamic shadows, and sample one dominant texture projection instead of three. They retain textured 3D props, nearby Joe geometry and native-resolution HUD. This fallback reduces work; it does not establish a software-renderer frame-rate guarantee.

The 3D path skips unused legacy course bitmap materialization, atlas-cache priming and prototype ground creation. Legacy/failure rendering retains the decoded images. The distant Joe asset contains geometry and material slots only; it reuses the original texture maps. Preparation continues to hold simulation until ready and supports Pause, cancellation and model fallback.
