# Back Nine Joe rider motion — 2026-11-14

Joe now holds and turns the mower's steering wheel, follows the player with his head, leans through corners, reacts to acceleration/braking and braces before a charge. His hips and feet retain the authored seated pose. The rider follows the seat's chassis motion, and subtle torso motion deforms the existing clothing. This addresses BV28 using the existing detailed Joe artwork and skeleton.

## Production change

- `web/back-nine-rider-motion.js` separates visual motion state from pursuit simulation. Steering derives from actual heading change and reverses correctly when backing up. Acceleration, steering, target tracking and bracing ease over simulation time. Breathing uses a fixed phase so changing charge intensity cannot suddenly change its frequency.
- Two-bone arm solves position the authored curled hands on fixed points of the turning rim. Joint translations and limb lengths are preserved. The wheel is ten centimeters closer to the rider so the lower hand remains reachable at full lock.
- The wheel has three spokes, a hub, a column and a floor bracket. Its rotating geometry is one mesh using the existing iron material; the fixed column/bracket remain in the chassis batch.
- The rider is attached to the mower body containing the seat. Body recoil no longer separates Joe from that seat. No camera controls, collision, navigation, pursuit speed, damage or checkpoint rules change.
- Reduced-motion mode retains functional wheel/hand movement and head tracking while removing breathing, body lean and charge nods. Pause does not advance the pose, and a new run resets motion history.
- Back Nine scene and rider-motion import-map versions are `20261114-rider-motion-3`; unique keys and served source bytes were verified. Level 1's model, assets and animation module are unchanged.

## Evidence

Root: `output/back-nine-visual-upgrade/rider-motion`.

- `motion-rules.json`: 4,368 poses using the actual GLB skeleton, including steering extremes, reverse, idle, fast travel, bracing, inclined chassis and reduced motion. Maximum palm-to-rim error is 3.923 mm. Quaternions are finite/unit length; original joint translations and seated hips are preserved. Run data is unchanged. Braking/acceleration direction, heading wrap, pause and restart checks pass.
- `complete-native` and `complete-software`: eight controlled gameplay-camera cases at 2560 × 1600 — idle, left/right turn, braking, charge brace, reverse, target tracking and reduced motion. These are visual fixtures, not claims of eight simulated chase outcomes.
- Use `actual-reduced-native` / `actual-reduced-software` for the smaller 1280 × 720 and 390 × 844 views. They enable reduced motion through the pause UI, hold the actual Q input and advance one simulation step; the run reports rear glance active, breathing is zero, and rider meshes remain visible. Earlier small captures in `complete-*` looked forward and are rejected for rider visual acceptance.
- Actual weighted-vertex checks cover 341,856 vertices across 24 animation combinations on nine skinned meshes. Maximum radius is 0.9382 m around the existing culling center, retaining over 0.211 m padding inside its unchanged 1.15 m radius.
- Five camera-edge render comparisons change zero pixels when rider culling is enabled versus disabled. A separate hide/show readback confirms the rider actually contributes visible pixels, preventing a hidden-model comparison from falsely passing.
- Pause/resume, full restart and console/page error checks pass on both renderers. Geometry/material/texture ownership continues through existing scene disposal; the controller creates no timers, renderer lights or textures.
- The original Level 1 Joe reference, `output/joe-model/acceptance/front-2560.png`, was opened alongside this pass. The same authored face, hair, cuff and cloth textures remain in use; the new arm and body poses connect that existing detail to the mower's controls. This is a reference comparison, not a new full-Level-1 regression run.

## Resources and actual gameplay

Eight matched before/current native cases preserve player/cart/Joe/time/objective/checkpoint/service/utility/navigation/destruction state. Each adds one draw call and 168 triangles, retaining 35 programs and 55 textures.

Installed standard gameplay clients ran forward, turning and Q rear glance on both renderers. Both finish at `(20.99670594253312,83.94355811194566)` with player/cart/Joe/time/checkpoint identical to the preceding estate pass, and identical rider-motion state between renderers. Final images and text state were inspected; no error artifacts. Native 2560 × 1440 average/P95 frame completion is 11.93/15.90 ms; software 640 × 360 is 106.07/152.90 ms. These shared-host observations are not an isolated performance comparison or whole-level budget acceptance; software remains coarse and slow.

## Corrections and limits

The initial reach test found non-unit rotations from decomposing scaled bone transforms. World/local rotations are now normalized. Extreme steering also exposed an unreachable lower grip; moving the wheel closer fixed the reach instead of stretching the skeleton. Earlier `first`, `final-*`, `accepted-*` and `reduced-native` outputs are intermediate evidence, not the complete accepted build.

The original chest/head-only `tools/probe-chase-rider-bounds.cjs` predates this controller and is superseded by the current full-rig verifier. Its old animation envelope does not prove the new motion.

Player animation and clothing/boot detail, broader material consistency, foreground composition and software-renderer quality remain separate unfinished items. This pass does not establish whole-level Level 1 parity.
