# Course-wide paired lanterns and deeper night

Revision: `20261108-course-lanterns`, served locally on port 4187.

## Changes

- Expanded placement from the opening path to all 12 authored path polylines. The resulting layout has 28 pairs / 56 ground lanterns, including the pond-side approaches, clubhouse, service maze, range, shed and drain approaches.
- Opening spacing remains 5.6 world metres; other paths use 6.8m. Both lamps stay 1.25m either side of the local path direction. A pair can shift up to 1.7m along a path to avoid scenery, with a minimum along-path separation. Pairs are omitted together where there is insufficient room.
- Branches share nearby pairs: centers remain at least 4.2m apart, and lamps from different pairs at least 2.2m apart. One short branch shares neighboring junction lights instead of receiving a duplicate set. The 48-pair ceiling is distributed round-robin across routes; the current scene uses 28. Existing path edges, blocking scenery and course bounds reject invalid placements.
- Ground lanterns use cached source shapes, 12-sided body/cap/glass, simple frame bars and 16-sided rings. This preserves their pixel textures, metal frame, handle and flame while reducing each from 1,488 to 576 triangles (61.3%). Total ground-lantern geometry is 32,256 triangles versus 14,880 for the previous ten lamps, rather than 83,328 with the old model repeated 56 times. Construction yields between small batches.
- The existing subtle flicker is unchanged: flame glass, halos, ground pools and the single nearby light share the envelope. Reduced Motion remains steady. Halo/floor rendering still uses two batches; no additional point lights, image downloads, particles or postprocessing passes.
- Darkened hemisphere fill .58 → .43, ambient fill .16 → .11 and moonlight 1.4 → 1.12. Darkened parallax sky/ridge/treeline and base/zone fog tints. Existing local lamps, floodlight responses, objective signs, parallax, fog distances and effects remain. Player movement, interaction, collision and Joe navigation are unchanged.

## Verification

- Hardware and software runs of `tools/verify-course-lanterns.cjs` pass: coverage beyond the opening and to the exit, paired symmetry, duplicate spacing, triangle budget, stable layout across split polylines, bounded flicker, stable timestamps, Reduced Motion, matching halo/floor values, and no first-use shader compilation or page errors.
- Pure network checks also pass the six-pair budget with later-route coverage, repeated-route deduplication and fully blocked route rejection.
- Screenshots inspected at 2560×1600, with additional 1280×720 and 844×390 captures. Exit signs and pathways remain readable; the new lanterns sit on the verges rather than across the walkable path.
- Release check passes 90 action scenarios and the unchanged 56 runtime images / 20.8 MB. Syntax and whitespace checks pass.

Evidence is under `output/course-lanterns-20261108`. The `baseline` directory preserves the previous five rendering source files only for the before/after comparison; it is not shipped with the game. Software frame pacing remains an existing limitation; these local samples are not a whole-game FPS guarantee.

Repeated software comparison used 24 frames per fixed camera, discarded the first eight, and compared matching adaptive resolutions (800x450 at the opening; 640x360 elsewhere). Median render-to-presentation completion was 83.3 -> 83.5ms at the opening, 66.5 -> 66.6ms at the range, and 66.5 -> 67.0ms at the exit. Other locations varied more between runs, including faster second-pass samples; no FPS improvement is claimed. Completion includes GPU-fence polling/presentation waits. Visible draw counts increased by 3–16 in the sampled views; triangle changes ranged from -3,328 at the opening to +5,944 at the range. The initial cumulative timing sample was noisy, so the matched-resolution measurements are the more useful comparison. Existing software-renderer long frames remain.
Normal installed gameplay client passed two iterations / 14 units with no error artifacts; ready first-hole state and final screenshot inspected.
