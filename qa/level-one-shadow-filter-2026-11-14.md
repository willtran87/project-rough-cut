# Level 1 native shadow-edge refinement

Partial V02/V11 progress in the comprehensive 35-item/V01–V21 upgrade. The preceding paperwork pass was implementation progress; this pass addresses its reported native shadow faceting. The full goal remains active.

## Diagnosis and change

The triangles on Release Review were not painted into its paper and were not caused by the sheet casting onto itself. Tests removing paper casting, changing receiver/scene bias and selecting front/back/double-sided shadow casters did not resolve the pattern. Turning off the moon shadow or all other casters removed it. Ray probes, followed by binary isolation of 1,054 scene meshes, identified the station timber batch and the overhead sign face. The 44 m wide, 2048² unfiltered moon map produces approximately 2.15 cm shadow texels, which create coarse edges across a close, pale receiver.

`scene-3d.js` now selects Three's PCF depth-comparison filtering for native rendering before building the scene. The existing one-texel filter radius smooths the offending edge; zero and half-texel candidates retained more visible bands. Geometry, pixel textures, shadow casters/receivers, map resolution, bias, normal bias and all light intensities remain unchanged. This is shadow filtering rather than an image blur or extra fill light. The software path continues to use BasicShadowMap with its existing practical shadows and budget. Level 1's entry cache version is updated. No other chapter entry or scene is changed.

The diagnostic initially switched shadow types after building a scene without refreshing the cached opening spotlight. That produced invalid comparison-sampler bindings and unusable images (`probe/pcf-*.png` from that experiment). Accepted `probe/pcf-initial-*.png` start with the correct shadow type. The diagnostic script now refreshes every shadow map when switching types; production selects once at renderer setup and does not perform runtime switches.

## Verified evidence

- `verify-station-mechanisms.cjs --paper-audit`: all 16 native views and actual quiet/loud filing, cancellation, pause, release lever, persistent receipt, repeated Use, reduced motion and four-paper exact-once disposal checks pass. Artifacts: `after-native`. No page/console errors.
- `verify-course-shadow-filter.cjs`: opening, service, woodland, log, release, oblique release, Joe/front/side and ordinary/portrait views. Viewports 2560×1600, 1280×720, 390×844; actual native targets 2492×1402, 1193×671 and 379×833. Five lateral camera positions near Joe compare complete rendered-scene hashes with forced fresh shadow renders; cached and fresh results match at every pose. Twenty frozen redraws retain identical geometry/texture/program counts. This checks update consistency, not full artistic motion acceptance.
- Ten before/after matched views retain identical light inventories/intensities, path-lantern data, moon map size/bias and rendered draw/triangle counts. The 28 symmetric path lanterns and low ambient remain. Program count remains 107. Renderer texture accounting increases by one (112→113) and stays fixed. Three's comparison-sampler path includes a separate 1×1 fallback depth texture; the count increase is consistent with that path, not a larger moon map.
- Installed web-game client runs actual Release Review Use on both renderers; native also turns left between captures. Both finish with persistent ink/receipt and 1/3 checks complete, no error files or scene error. Native reports `pcf` at 2492×1402; software reports `nearest` and still adapts to 640×360. Current captures and state inspected in `client-native` and `client-software`.
- Initial timed runs overlapped a software browser and are not used to establish performance. `isolated-before` and `isolated-after` repeat opening/woodland/release with 8 warm-up and 40 measured draws per view, synchronizing GPU completion. These are frozen render-cost samples on this RTX 3090, not gameplay FPS, target-device coverage or a whole-route performance guarantee.

The pale-form triangular bands are substantially reduced in the accepted close views while the overhead shadow remains visible. Wider source composition, shadow contact throughout the route, full motion review and software high-resolution fidelity remain open. This pass does not complete V02, V11 or the full visual upgrade.

Artifacts: `output/level-one-paper-shadows`, including baseline source, diagnostic isolation reports, native mechanism/route captures, matched comparison, client captures and source snapshots.

Isolated median render samples (before → after): opening9.8→6.3ms, woodland6.8→6.2ms, release4.2→4.3ms. P95:11.2→7.1ms,8.4→6.7ms,5.8→4.7ms. Warm-up/clock/CPU variation prevents attributing apparent savings to filtering; these limited samples show no clear cost regression. Full gameplay performance remains unaccepted.
