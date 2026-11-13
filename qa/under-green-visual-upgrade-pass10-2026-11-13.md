# Under the Green visual upgrade — pass 10

All 53 requirements and seven release gates remain in scope. Previous goal turn was implementation progress (sign art and conservative fog shading). This pass advances V29 contact grounding. V30 projected Joe/scythe shadows is still a separate unfinished requirement.

## Surface-bound contact shade

Added under-green-contact-shade.js. It generates narrow feathered floor/wall seams from the actual layout, root/masonry contact ribbons from the same authored curves/taper used by root geometry, and low floor contact masks under machinery skids, cabinets, buttresses and the root pillar. Vertex alpha carries the falloff; no new textures, lights or screen-space postprocess. The two static batches use depth-tested single-pass transparent materials, draw ahead of water, and stay fixed in world coordinates.

Root ribbons are clipped against the actual wall-piece vertical/along-wall ranges, including keeper recess openings. Fine root hairs are excluded; these are contact treatments rather than projected long shadows. Static footprint masks follow physical skids/cabinets; they do not add collision or navigation boundaries. 326 wall seams,575root strips,9machinery/pillar contacts. First candidate77,260triangles reduced to53,408 with curvature-sufficient sampling and a segment cap. Temporary construction arrays are released after typed geometry is built. Two additional static draw calls, zero added textures. Existing foot-shadow draw count retained.

The first candidate used nearly black green and could slightly brighten already-black pixels. Final black masks only darken in all seven hardware comparisons (max lightening0), while preserving fog/depth. Hardware A/B changed52,093gallery pixels,109,312entrance-root,205,601crossing-root,83,265pump-feet,22,193keeper,16,824actual-high-flood and21,336Joe-feet pixels. These are proof of visible contribution, not a standalone aesthetic acceptance metric.

## Joe's feet

Replaced the two solid circular contact discs with feathered ellipses. Their centers derive from the actual shoe-vertex bounds in each foot bone's coordinates, transformed through the current gait pose. Opacity follows actual sole height; a lifted foot's contact shade fades and spreads slightly. Ground height remains0.004m. The simulation, gait/IK, pursuit, attack timings and footstep events remain unchanged. Shadows stay depth-tested and underneath water; they do not project Joe's hidden movement through walls. Foot shadow materials are explicitly disposed with the actor.

## Verification

- Hardware contact21966 initial and21070 tuned:10views including four viewports2560x1600,1280x720,390x844,844x390. Tuned shadows show actual pixel contribution in seven contexts; high-flood depth0.38 asserted. 226sampled positive-alpha root vertices raycast to real rendered masonry within2.5cm, zero unsupported samples. Eight gait phases prove lifted-foot opacity falls, floor attachment and hand IK remain valid. Pause freezes the contact pose. Zero browser errors.
- Hardware tuned paired alternating GPU-completed960x600 frames: enabled median11.6ms/p9513.0ms; disabled11.8ms/p9513.1ms. No measurable incremental cost in that fixture. This does not accept the still-failing whole-level software performance gate.
- Software initial50457:10views,247initial-geometry receiver samples,zero misses/errors. Final tuned software check pending below; do not attribute initial evidence to the tuned geometry.
- Actor63572: existing seven-view scythe/ghost/IK/camera motion/pause/reduced-motion regression passes. Latest actor change after that run only assigns names to foot-shadow meshes for targeted observation.
- Practical64945: six exact stock17PointLight comparisons, camera-independent light sources and Reduced Motion actual-uniform checks pass; native2560x1600fixture p958.1–15ms. That regression preceded the single-pass/black-mask/tessellation tuning; final targeted contact checks cover those subsequent rendering changes.
- Inspected native gallery/pump, close entrance-root and Joe-feet screenshots. Subtle grounding retained; larger material, root composition, Joe-art, local humidity and projected-shadow work remains.

Evidence: output/under-green/visual-upgrade/contact-shade, pass10-practicals, pass10-actors, pass10-source and pass10-client. Gameplay bindings E/Q, no checkpoints, fixed-world lamps, opaque boundaries and no action/noise banners remain unchanged.

Final tuned software76101 terminal pass:10views/four sizes,226physical receiver samples with zero misses,eight gait phases/pause,actual high-flood.38,zero browser errors. All seven framebuffer comparisons have maxLightening0 (also asserted offline against final hardware/software reports after strengthening the harness assertion). Enabled960x600 median132.9ms/p95142 vs disabled130.2ms/p95150; approximately2.7ms median incremental cost, with one disabled304msoutlier. Software remains well below target regardless of these contact masks. Inspected software flood and native pump-foot/root/Joe images. Current4runtimefile snapshots saved. Installed client29765 pending.

Final exhaustive hardware9200 terminal pass: independently indexed5,168actual rendered masonry triangles, then proved all70,047positive-opacity root-contact vertices supported; zero unsupported vertices. Retains226short physical ray checks, all seven visual contexts, four viewports, eight gait phases, pause and zero errors. Final paired960x600 median10.9ms enabled versus10.4ms disabled; p9515.8 versus15.9. This repeat supersedes the previous hardware timing sample, showing approximately0.5ms median incremental cost in this fixture. No whole-level performance acceptance claim.

Installed client29765 terminal exit0: intro completes and real forward input reaches(0,16.52), internal960x540, both contact batches active,53,408triangles. Latest screenshot/state inspected; no browser errors artifact. Four final runtime snapshots match exactly. All owned jobs terminal.

V29 is now marked implemented: each named contact class is present, actual world attachment is verified, inspected close/medium views retain material detail without a halo, and incremental cost is bounded in measured fixtures. Overall Level1 consistency, full-route/performance/accessibility gates remain pending. V30 projected shadows is not counted as part of this completion.
