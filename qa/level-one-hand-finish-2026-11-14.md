# Level 1 first-person hand finish

Local scope: V01 material clusters, V09 surface separation and V12 hands/grips. The full35-item/V01–V21 objective remains active; this is not whole-character or whole-level acceptance.

## Visual change

The arrival review showed a coarse hand sitting beneath the phone, with most fingers hidden and an unclear grip. `course-player-craft.js` now constructs a dedicated side grip: four tapered, continuous curled fingers behind the shell, an opposed thumb on the front rim, one continuous palm/wrist, and a connected cuff/sleeve. The first candidate used separate ellipsoids for finger segments; its bead-like joints were rejected after inspecting normal desktop/phone views. A later side inspection exposed a pinched wrist; the final palm uses a continuous shaped cross-section instead.

The same skin and work-shirt material family is used for the phone and club. Two random64px maps become two authored128px maps: quiet connected skin tones and sparse creases, plus longitudinal cloth folds and restrained twill stitches. Nearest magnification and mipmapped minification remain. Existing club hand centres, grip angles, wrists, sleeves, club geometry, animation and gameplay timing remain. Hand ellipsoid tessellation increases from8×6 to12×10 for smoother close silhouettes.

The phone's portrait offset changes from.095 to.06 so the side grip fits on-screen. Landscape placement, phone shell/screen, message, scale, rise/stow timing and priority rules remain. Cache versions propagate through player craft, arrival phone/presentation, scene and index. No light, ambient value, lantern placement, collision or other-chapter source is changed.

## Verification and evidence

- Final native phone55927/software59519 exited0:18views each at2560×1600,1280×720,390×844 and45/85FOV extremes, plus reading/stow phases, priority flags, actual W movement, pause/reduced motion, bounded warm resources and rebuild. No browser errors. Baseline native91293 also passed18views.
- In the reading pose,209camera-to-screen rays per renderer are unobstructed by the hand. Four separate finger bands reach the phone back within1.33–1.44mm. The former pose has no skin vertices in three of these bands. This verifies local contact/readability, not full anatomical realism from every viewpoint.
- `tools/inspect-course-hand-geometry.cjs` renders front/side/back under explicitly diagnostic studio lighting. Those captures are construction evidence, not gameplay lighting. All rendered attributes are finite; no triangle has inward winding relative to its vertex normals. The entire bare hand remains inside the held view at16:9 and390:844 across45/58/85FOV; worst portrait right edge is NDC.9543.
- Twenty unique rendered geometries/materials/textures each emit exactly one dispose event even if craft.dispose() is called twice; club/phone-hand roots detach. Phone screen disposal and scene reconstruction are independently covered by the arrival fixture.
- Club native5688 (dark approach), native86877 (existing-lantern approach), baseline52554 and software98281 exited0. Six captured states per lit version: actual Space aim, Escape cancellation, release/swing, paused follow-through, continued ball flight,1280/844-landscape/390-portrait aiming and reduced motion. Warm resources stay bounded; scene rebuild retains one club. All required assertions and console checks pass.
- `tools/compare-course-hand-finish.cjs` passes: unchanged world/light/28-lantern/collision inventory, phone shell/speaker/screen geometry and eight-colour screen; stowed world image byte-identical to baseline. All six club/ball states are exactly equal across baseline/current native/current software. Final reports live in `output/level-one-hand-finish/`.
- Final installed gameplay clients through `verify-presented-client.mjs` use the original arrival input fixture and five natural keyboard bursts, with no state injection. Native74071/software17010 exited0; native2492×1402/software640×360. Current native opening and software reading images inspected, along with final fixture portrait/club views. Earlier candidate runs19618/89198 passed, but final screenshots are regenerated after the continuous-palm refinement.

## Cost and limitations

Phone hand triangles1164→2332, retaining four material batches. Entire player craft (club, forearms, phone hand)4184→8888triangles, with the same12rendered meshes, six materials and two texture objects. Two128px maps replace64px maps. Native phone warm counts980geometries/116textures/109programs; software733/116/120, each stable across30age updates. These counts are resource observations, not a performance improvement or a whole-level budget pass.

Actual dark areas still render dark hands. This pass adds no exposure/ambient fill to disguise that. The grip now reads more clearly near existing lights and has better continuous construction; broader actor anatomy, encounter lighting, material-density consistency and complete transition acceptance remain open. Software gameplay still adapts to640×360 in the standard client, so high-resolution software fidelity remains unaccepted.

Source/tool snapshots and SHA256 receipts are kept under `output/level-one-hand-finish/verified-source/`. Prior arrival receipts remain historical; the portrait offset and shared hand craft intentionally advance that source.
