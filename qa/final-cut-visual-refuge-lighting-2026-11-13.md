# Final Cut — refuge entrance lighting

Progress on FV10, FV11, FV12 and FV71. Three permanent entrance downlights replace the duplicated exterior glow boxes. Each fixture has a ceiling plate, drop stem, arm, weather lip, housing, lens, cage and fasteners: 19 connected pieces per refuge, reusing the existing static batches, unit geometry and pixel materials. The lowest fitting is 2.21m above the ground; the source is just below its lens/cage at 2.19m. Doorways retain their movement clearance.

Each warm spotlight has intensity23, range5.8m, angle1.02rad, penumbra0.65 and decay1.7. Its origin follows the actual fixture. Native shadows use256px and software shadows128px. Walls cast real shadows across the pool. The existing interior fixtures and reveal circuit are retained.

The complete finite light sphere is tested against the camera frustum. A light is excluded only when that sphere misses the view; this is not a nearest-light limit. Static shadows are cached, with refreshes while the mower envelope is nearby and once on departure. The pump lamp also refreshes for nearby wind/contact-driven reeds. Pause retains exact pixels. Shadow maps are explicitly disposed.

## Verification

- `tools/verify-final-cut-refuge-fixtures.mjs`: all57 parts connect to the existing roof through real fittings, lens/source alignment and head clearance pass; static/moving/departure shadow-cache behavior passes; all three owned render targets dispose.
- Native browser pass:11 views, 2560x1600,1920x1080,1280x720,844x390,390x844; real keyboard doorway traversal, exact pause and warmed resource stability pass. All three entrance samples brighten; interior samples behind actual masonry return exactly to the lamps-off value. All six culled/full-light framebuffer comparisons are byte-identical. No page/console errors.
- Initial apron probe was obstructed by the overlook parapet. Ray intersections identified the real visible surface; the final test uses an unobstructed floor view. The first pump oblique views intersected the south reed stand; the final viewpoint is north of the entrance. These were diagnostic camera errors, not changes to world geometry.
- Software browser pass:11 views at the same five viewports,960x600 internal rendering at2560x1600 and960x540 at ordinary desktop; compact viewports render at native dimensions. All six culling comparisons are exact, all three masonry shadow samples equal the lamps-off value, movement/pause/resource stability pass, and there are no browser errors.
- Matched native before/after captures are retained in `output/final-cut/refuge-lighting/comparison.html`. Inspected the entrance, fixture close-up, oblique, bunker, pavilion and compact views.
- Full browser routes pass: direct/garage/drain, four heard ball redirects, three completed physical finales,77 screenshots, zero captures and no browser errors. The original48 concealment comparisons pass. The strengthened verifier also passes all48 pairs after explicitly invalidating every casting-light shadow map on each rig-visibility toggle; no direct or indirect silhouette is exposed. Installed web-game client2121 completed with exit0. Fresh screenshot and text state inspected: ready/playing, ordinary movement to(-1.8880467,4.7372006),960x540 software framebuffer, all57 fixture parts present and no error artifact. All owned jobs are terminal; six retained source/test hashes match the current files.

## Cost and remaining work

The final native A/B render/readback sample at1280x720 measures2.7ms with the new lights removed and3.0ms with them enabled, including the pump's animated reed shadow refresh. This is one controlled view, not full-level frame-pacing acceptance. The original always-visible three-light prototype was rejected for excessive software shading cost. Software absolute performance already fails the overall budget and remains an open FV71 requirement.

Final software A/B medians are1078.9/798.4ms without the new lights and1285.5/1010.6ms with them. The within-run drift is substantial; these samples do not establish a reliable cost delta or any software performance acceptance. No other owned browser job ran during this measurement. Native and software warm resource counts stabilize at143geometries/66textures and143/63 respectively, including render-target textures. No material texture assets are added.

Broad facade values, the remaining flood/beacon fixtures, complete prop contact shading and matched Level1 acceptance remain open. This pass does not complete any whole-level lighting or performance item.
