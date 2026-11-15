# Level 1 clubhouse landmark lighting

Scope: V04 composition, V07 selective interiors and V10 local lighting. The full 35-item / V01–V21 upgrade remains active. This pass does not accept the whole route, transitions, material art or performance.

## Evidence and change

The prior natural-input route completed at the shed with all three checks, the key and no browser errors (`output/level-one-route-composition/baseline-walk/route.json`; process13043 exited0). Its opening, clubhouse-crossing and Dead Green captures exposed weak separation between structures and the surrounding darkness. Optional navigation was enabled by that route tool, so its signs are not evidence of default navigation clutter.

Matched clubhouse approach captures showed six similarly bright windows surrounded by a nearly black facade. The existing warm point source was at `(14.4,2.4,-50.4)`, inside the west wall. It now sits just above and beyond the central upstairs sill at `(13.88,2.42,-51.5)`. Colour, intensity5, range7 and decay2 are unchanged. This is an approximation of warm room spill; it does not add aperture-masked emission or new source shadows.

The 51 existing perspective rooms now have fixed, building-relative light strengths. The west upstairs room and front-door glazing remain full strength; neighbouring rooms and other wings are dimmer. Strengths never depend on camera distance, elapsed time or frustum visibility. Glass sheen remains independent of interior brightness. Both workshop windows retain strength1, their previous art and their geometry.

All original room attributes, indices, models, object placements, obstacles and lantern anchors are retained. One extra scalar vertex attribute describes room brightness. No geometry, texture, material, draw or light is added. Ambient, hemisphere and moon intensities remain .005/.035/.14; all28 path lanterns remain symmetric. The cache versions propagate through index, scene, pixel-world-props and pixel-buildings.

## Verification

- `tools/verify-course-landmark-light.cjs`: nine views per version/renderer. Four clubhouse approach angles, opening, Audit approach,1280x720,390x844 and landscape restoration. High-resolution viewport2560x1600 renders2492x1402 natively; ordinary desktop1193x671 and portrait379x833. Software fixtures use800x450 landscape and405x890 portrait.
- Native before12830 and current57521, software before5737 and current94462 all exited0. Every software full-geometry comparison and restoration is pixel-exact. No browser errors.
- `tools/compare-course-landmark-light.cjs` verifies18 matched before/current pairs: exact world inventory, obstacles, lanterns, camera poses, resolution, draw/triangle counts, old room attributes and indices. Exactly one light changes position; every light's type, power, colour and range is unchanged. Report: `output/level-one-landmark-light/comparison.json`.
- Room levels, in windows:1.0×2, .55×2, .32×7, .22×2, .12×17, .055×19, .045×2. All four vertices of each pane agree. Workshops remain1.0.
- Actual keyboard movement from `(55,302)` to `(61.431,304.973)` retains clearance. Pause/resume, reduced-to-normal motion and rebuild preserve occupancy. Twelve warm moving frames do not grow geometry/texture/program counts. Old room geometry and material each dispose exactly once; replacement has the identical light-strength buffer.
- Native landscape images before and after the portrait round trip have identical SHA256 `AE1EECF30DBE59A1F8901E199D09BD4A5FE6C14EB6BB5C81AD98EFEB187FBE90`. A lower reported draw count on restoration was cached shadow rendering, not missing geometry; no culling change was made.
- Installed gameplay client via `tools/verify-presented-client.mjs --level-one --landmark-light`: native32872 and software63866 exited0. Two input bursts each, first_hole, position65/302 to74/303, clearance4.38 to4.54, no error artifacts. Final page images and states inspected. Native2492x1402; the software client adapted to640x360, so software high-resolution fidelity remains unaccepted.
- Initial previews3199/80927 failed because the proposed south camera intersected existing cover. The test now selects a nearby clear standing point deterministically; geometry and collision were not altered for the fixture. Preview72155 then passed.

## Visual assessment

The crossing now reveals the existing timber divisions, weathered plaster, masonry and roof silhouette around a restrained warm focal point. Dimmer neighbouring rooms stop competing with that feature. Darkness remains between landmarks. Both desktop and phone views keep the occupied room readable; portrait naturally crops the wider facade.

Selected hardware/software approach, responsive, opening and final client images were inspected. Evidence is under `output/level-one-landmark-light/`. This does not establish full-route composition, refined pixel clustering on every existing surface, contact/shadow parity or completed reveal sequences. The next substantial work remains the opening/landmark progression and broader scene hierarchy, followed by the remaining full ledger requirements.

## Rendering-cost observation and receipt

Sequential process40601 finished0. Each pose discarded12 warm frames, then measured three24-frame blocks through presentation plus a synchronizing pixel readback. Median of the three block medians, milliseconds:

| Renderer | Crossing before → after | West before → after | Opening before → after |
|---|---|---|---|
| Native |10.0 →6.8|8.7 →5.4|18.2 →8.1|
| Software |275.7 →154.4|270.3 →210.0|140.6 →138.9|

These are separate-load observations, not a demonstrated speedup. Background tools `profile-windbreak-growth.cjs` and `verify-final-cut-reed-sightlines.cjs` were live at the end of measurement, and individual blocks varied materially. This pass adds only a scalar room attribute/multiply and moves one existing source; the large timing changes cannot responsibly be attributed to it. Full software performance and display fidelity remain open. Detailed samples are in each renderer/version's `timing.json`.

All owned preview, verification, client, comparison and timing processes are terminal. Nine source/tool snapshots with SHA256 receipts are stored in `output/level-one-landmark-light/verified-source/manifest.json`. No other-chapter runtime file was changed by this pass.
