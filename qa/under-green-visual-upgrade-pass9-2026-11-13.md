# Under the Green visual upgrade — pass 9

Full scope remains all 53 items and all seven release gates. This pass advances V06 (render efficiency without removing detail), V50 (weathered physical signs), and the performance investigation. No release gate is accepted by this pass.

## Fixed distant geometry with cheaper shading

Added under-green-fog-materials.js. Conservative static world bounds determine when every vertex of an opaque architectural mesh lies beyond the existing linear fog far distance. At that point its original geometry and depth still draw, using a plain fog-colored material. The original material is restored in finally immediately after rendering. Camera far remains 200; no wall is removed and no lighting field follows the viewer.

Uses minimum camera-space depth, not radial distance. Transparent, alpha-tested, alpha-hashed, displaced, instanced, skinned, morphing, clipping, additive, non-depth-writing and shadow-casting meshes are excluded. This is scoped to the authored static structural mesh list. It does not apply to moving actors or water. Future changes to those assumptions require revalidation.

Hardware70690 and software60923: 27 comparisons each, exact framebuffer parity with substitution disabled. Six districts/states, rear views, crouch, FOV50/90, and 2560x1600 / 1280x720 / 390x844 / 844x390. Hardware native2560x1600; software high-viewport internal960x600. 278 eligible static meshes; gallery69 substitutions, bunker52–57 depending on existing software visibility. Material references restored after every draw.

Paired alternating GPU-completed gallery samples at960x600: hardware median9.9ms versus10.0ms, software140ms versus144ms. Software p95 essentially unchanged156 versus155.9ms. This is a small median improvement, not resolution of the software pacing failure. Original raw samples retained. Pure geometry test:180camera poses,915substitutions,21,960actual transformed vertices all beyond43.01m; six unsafe material cases excluded and explicit peripheral radial-distance counterexample retained.

## Weathered enamel signs

Added under-green-sign-art.js and replaced the old inline plain sign artwork. Fourteen authored plates retain their messages, placement conventions and reversed back-face arrows. Each has fitted crisp raster lettering, layered quiet paint variation, edge chips, bolt-origin rust streaks, subtle cracks, a substantial metal backing and physical hexagonal bolts. The new materials respond to the actual practical lights and have no emissive map. A deliberate fourfold indirect-diffuse art adjustment keeps lettering readable in dark intervals. This is an art readability choice, not a claim of physically accurate bounced light.

The first fully lit candidate was too dark in actual renders and was revised before acceptance. The first crossing plate moved down20cm and its existing support rods lengthened to meet it, reducing overlap from hanging root tips. The central signal support remains a real foreground object between the two instructions. At very close portrait views a world-space sign can extend beyond the camera; the physical signal and accessible HUD remain visible. Per-location distant/flicker readability acceptance is still open, so V50 remains in progress.

Hardware45167 and software95973:14plates/28faces; all text fits its available canvas area and directional back-face arrows reverse correctly. Nine views each, including gallery close/front/back, pump/control, keeper and three responsive sizes. 1,604real standing/crouched camera poses have no geometry hits. Zero browser errors. Inspected native2560x1600 crossing/pump views, portrait crossing, software gallery and source plate artwork. The source plate export was corrected to find material names after fixture batching; software export confirms both faces. Hardware image behavior is unchanged by adding those diagnostic names.

## Final regression and remaining work

Final stock17PointLight parity regression and installed client results are appended below when terminal. Gameplay simulation, water timing, Joe pursuit, attacks, E/Q bindings, retry-from-entrance and banner behavior are untouched.

Evidence: output/under-green/visual-upgrade/fog-materials, sign-art, pass9-practicals, pass9-client and pass9-source. Full Level1 comparison, route-wide finish, shadows/contact grounding, localized humidity, actor materials, water refinement, UI coherence and software performance remain active requirements.

Final hardware practical regression6801 terminal pass: all six fixtures pixel-exact against17stockPointLights, camera-independent sources, Reduced Motion actual uniform check passes, four viewports and zero browser errors. Native2560x1600 p95 across fixtures8.1–13.9ms. Final source snapshot retained; installed input client now running.

Installed client47106 terminal exit0: five input bursts complete intro and reach gameplay at(0,16.52), internal960x540,14newplates. Latest screenshot/state inspected, no error artifact. Final hardware practical Reduced Motion check covers5,255actual renderer uniform samples with zero error. All owned verification processes finished. Concurrent other-chapter client observed during final functional smoke; no performance claim is based on that smoke.
