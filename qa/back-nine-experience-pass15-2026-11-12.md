# Back Nine pass 15 — staff records, quiet sightings and garage framing

The previous goal turn restated the roadmap without authoritative implementation progress. This pass revalidated the worktree, recorded the completed pass14 course-layout work and continued the full 38-item objective. The goal is still active; this is not a completion claim for every row.

## Changes

- Three connected **Night Order 041** racks now appear at the maintenance shelter, night-range shelter and garage. The same Reed/Bell/Ward staff cards decrease from three to one to none, with no clock-out recorded. The two optional crew logs connect those physical details. The racks hang outside the shelter posts or against the garage back wall; no new ground obstacle, navigation sign, objective or interaction was added.
- A single optional occupied-cart sighting can occur at one of two existing closed maintenance bays. It uses Joe's actual high-resolution pixel-art model, sharing the original vertex buffers, materials and textures; only one independent skeleton is retained. Both sites are beyond the playable boundary, with no collision or AI actor.
- The encounter policy must allow an omen, Joe must be over42m away, the cart must be below11.5m/s, and the player must be outside attack/recovery/protected moments. The figure stages outside the camera and remains while viewed. Once seen, it disappears only after a sustained look away (or while already offscreen if a real attack supersedes it). There is at most one observed sighting per run. Brief glances reset the disappearance timer; pause and duplicate draws cannot advance it.
- Conservative whole-figure frustum bounds prevent a shoulder at the edge of the screen from popping away. No scenery raycasts run every frame. Inactive figures detach from the scene after preparation; sighting checks stop after the two bays are passed. Optional Joe subtitles yield to the sighting; essential messages and actual audio continue.
- The staff-paper atlas uses the existing pixel-surface shader and one512x1024 texture. Shared model textures remain unchanged; the other new texture is the small skeleton palette. No extra light, postprocessing pass, sound voice, particle system or simulation timer.
- Visual review found the garage entrance fixture filling the top of the old follow view. The camera now descends smoothly toward3.15m before crossing that fixture. Steering, heading, look-back, physical movement and garage activation rules remain unchanged.
- Final affected import/entry cache tag: `20261112-staff-story-4`.

## Verification

Artifacts: `output/back-nine-experience/staff-story/`; source before this pass is retained under its `baseline-source/`. The whole-goal baseline is unchanged.

- `verify-staff-unease.mjs`:29 checks cover safety priorities, no insertion into a watched seat, pause, duplicate renders, no in-view removal on attack, sustained versus momentary look-away, one observed event and no mutation of gameplay state.
- `verify-staff-story-browser.cjs`: hardware and SwiftShader, actual Q look-back and release at both bays, reduced-motion second sighting, pause/resume, subtitle suppression, all three record locations, and2560x1600/1280x720/844x390 presentation. Zero browser errors; no new buffers/programs/textures during sightings, disappearance or viewport changes.
- Scene-state visibility alone was insufficient: a pixel comparison caught the second figure mostly buried behind its seat (only5 changed software pixels). Its seated height was corrected. Final actual-render subtraction finds29 changed pixels at the software run's adaptive buffer and110 at the hardware buffer, with the face/upper body visible under the cart roof. Both rendered sites were inspected. The sighting remains deliberately subtle; these numbers do not prove human recognition.
- `verify-back-nine-story.mjs`, `verify-quiet-messages.mjs`, `verify-chase-garage.mjs`, `verify-chase-camera.mjs`, `verify-back-nine-choices.mjs` pass: optional log/repair behavior, priority/cooldowns, actual brake/use, both relay prerequisites, smooth camera approach, all five cart apertures/three foot gaps, seven route branches, late fatal impact followed by protected on-foot escape and unchanged navigation signature2693326411.
- `verify-chase-garage-browser.cjs`: circuit lamps, partial hold/cancellation, compact layouts, protected closing, score/latch and victory pass with stable resources. The final hold screenshot visibly retains all progress segments above the cart roof after the camera correction.
- `verify-chase-outcome-browser.cjs`: four actual arrival cases, saved/reloaded outcomes, on-foot ending, legacy save fallback, checkpoint retry and consecutive defeat variation pass; zero errors. No gameplay/sound/pathing change in this pass.
- Installed standard skill client through `verify-presented-client.mjs --back-nine --staff-record`: actual driving/steering/braking reaches the maintenance relay, saves checkpoint1, retains100 health and shows only the essential relay confirmation. Screenshot and state inspected.

## Performance and limitations

Final standalone counts remain20 hardware /25 software programs. Textures rise38→40. Preparation retains19 buffer batches and rises23→24 texture batches; maximum buffer batch1,810,704bytes and unchanged maximum texture batch8,391,211bytes/four maps. The original cloned paper material briefly caused another program; copying the actual pixel-surface hooks removed that unnecessary shader variant. The first sighting preparation also redundantly traversed all nine shared character meshes; a single proxy now warms only the independent bone palette, restoring the original19 buffer-batch count. First appearance still allocates no new buffers/programs/textures.

Paired960x540 SwiftShader ABBA blocks use96 moving samples per version and fenced GPU completion. Owned benchmark processes run serially:

| View | Baseline median / p95 | Current median / p95 |
| --- | --- | --- |
| Relay record |35.9 /41.0ms|35.9 /41.9ms|
| Foliage / actual mower, no sighting |49.0 /62.9ms|48.9 /65.0ms|
| Visible seated figure, final pose |28.0 /33.9ms|31.9 /34.0ms|

The first two views were measured before the isolated final seated-height/garage-eye adjustments; neither adjustment changes those views. The final sighting measurement includes the figure in all96 current frames: nine extra draws and18,970 triangles while visible. No runtime buffer allocations. The initial benchmark accidentally measured zero visible-figure frames; its result is retained as `initial-performance-no-sighting.json` and is not used to claim the feature is free. Final active comparison is `moving-sighting.json`.

Fresh-browser ABBA startup measurements are recorded separately in `startup.json`: baseline readiness5355/5464ms, current5543/5495ms (mean5409.5→5519ms, +109.5ms). Scene-build measurements were4951.6/4603.9ms baseline versus5104.4/5079.9ms current. The earlier redundant warm-up sample is retained as `startup-before-warm-dedup.json`; timing variation prevents a universal speedup claim, but the redundant buffer batch is demonstrably removed. Neither this feature pass nor the small timing differences above resolve the broader software frame-spike requirement. Natural sighting frequency, human recognition, connected-story interpretation, wider omen variety and full-course pacing still need the remaining audit/prepared later playtests.

## Next work

Keep all38 requirements. Continue controlled run variation, broader supernatural composition, full-route decision/lighting/audio recognition and run-over/runner/retry coverage, alongside measured foliage/mower/frame-spike work. Do not mark the remaining rows complete from their names or old tests. Human tests remain prepared, not conducted.
