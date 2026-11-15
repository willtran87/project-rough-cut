# Level 1 body-attached spectral dissolve

This is a partial V17/V01 improvement within the full V01–V21 visual goal. The prior checklist-only turn did not implement an improvement; this turn revalidated the current source and replaced the actual screen-space ghost grain.

## Implementation

- `web/course-ghost-surface.js` supplies the Level 1 translucent shader with a bind-pose surface field. Broad 7/11/7-cell-per-metre islands control staggered dissolution; finer 24-cell-per-metre marks stay attached through the existing morphs, head rotation and wheel animation.
- The lower body and mower lose cohesion before the upper silhouette. Each island fades continuously rather than switching on/off. Peak presentation retains the existing spectral palette, directional form shading and atlas details.
- `web/ghost-joe.js` opts into the field only for `softFade`. Other chapters retain their original opaque dither branch. No additional geometry, texture, render pass, light, motion system or camera effect is introduced.
- Existing organic lanes, scheduler, interruption fade, pause, reduced motion and disable preference remain authoritative.

## Evidence

Artifacts are available at `output/level-one-spectral-surface` (a junction to this task's dedicated F: artifact directory; source files remain in the repository).

`tools/verify-course-spectral-render.cjs` renders the actual ghost GLB and production shader, with the pre-change source routed for comparison:

- 2560×1600 captures at alpha .15/.30/.52/.68, plus 1280×720 and 390×844 inspection views.
- Exact one-raster-pixel model translation at a fixed pose: original screen grain changes 2,418 native / 2,265 software channels by more than 1/255. New surface: zero changed channels and maximum difference zero on both renderers, after aligning the translated raster.
- Repeated frozen frames are byte-identical. Nine sampled fade levels have nondecreasing rendered energy. The earliest sampled new fade (.08) remains visually absent; onset is intentionally gradual.
- An opaque foreground plane fully occludes the ghost: covered renders with/without the ghost have identical hashes on both renderers.
- Muted opaque-dither ghost render hashes match the old source exactly on each renderer.
- One draw call and 5,648 triangles, as before. Warm geometry/texture counts remain stable through 24 changing poses. These are bounded fixture checks, not whole-level performance acceptance.

`tools/verify-course-spectral-surface.cjs` exercises natural scheduled sightings in the actual level. Native before/after and final software runs pass: first scheduled alpha .042, peak .462, .419m of root travel between those samples, uninterrupted sub-.1m position increments and sub-.06 opacity increments. Further checks cover retiring motion during a chase interruption, complete disappearance, pause, reduced motion and the apparition preference. Screenshots are aimed at the actual sighting and retain the game HUD/environment. Native 2560×1600 and phone views, and software 2560×1600 surface / 1280×720 / 390×844 gameplay views were opened and inspected.

`node tools/verify-course-ghost-motion.mjs` passes continuous travel, swept body/mower clearance, fixed anchors, player approach, pause, reduced motion and dissolve lifecycle checks.

## Limits

This does not accept all of V17. Distinct sighting identities, complete event composition, subtle distortion and the full route still need artistic review. The model's translucent internal overlap is retained and visible in close inspection. The overall game/software frame budget remains open; unchanged draw counts are not proof of unchanged GPU time. No ambient-light, lantern-count, Joe-beacon or mower-size changes are part of this pass.

## Installed gameplay client

The installed web-game client completed eight input bursts; final state is first_hole at x13/progress24/travel34. Final screenshot and state7 were inspected; no error artifact was produced. Completed software scene time averages173.09ms with P95216.5ms over120samples. CPU submission averages16.58ms and must not be reported as complete frame cost. This unpaired run does not establish the cause of the poor performance and does not pass V21.
