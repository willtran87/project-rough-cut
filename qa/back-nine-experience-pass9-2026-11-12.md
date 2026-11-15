# Back Nine experience — pass 9, November 12, 2026

Scope: mechanical damage personality, directional impacts and cart wobble (items15–17), preserving the complete38-item objective. Previous pass was progress: accepted contact-synchronized foot audio plus rejected non-improving performance experiments. This pass inspected the current worktree before editing; no simulation movement/pathfinding/health rules were changed.

## Implementation

- Shared `cart-mechanics.js` derives suspension and panel cycles from collision-resolved `run.distance`, with smooth damage thresholds. Speed changes affect intensity without multiplying time into a discontinuous phase. Terrain scales vibration; existing steering lean and threat strain remain. Cart body motion stays separate from camera/hull motion.
- Damage now has a loose roof flex, visibly moving hood/battery cover, wheel wobble and critical-engine flutter. The engine effect is audible only: no forced health loss, random throttle cuts or new handling penalties. Existing seven cosmetic stages, deforming geometry, HUD health, repairs and eventual collapse are preserved.
- Loose-panel strikes share the model's travel cycle, consume missed/muted cycles and cease when a nonzero wheel speed produces no actual travel. Existing metal voice is reused. Wreck collapse panning now respects the player's look-back orientation.
- Centered front/rear hits no longer invent sideways camera roll. Existing directional jolt, fading rattle, speed loss, safe shove and Joe backoff remain.
- A broad geometry audit exposed combined steering/impact lean exceeding the hull (up to1.296m local half-width against1.16m). Apply body pitch/roll bounds after all influences, and keep the attached battery cover slightly farther inside the body before it breaks loose. Neither physical hull nor route clearance was enlarged. Collapse still detaches and settles normally.
- Versioned the affected entry imports and new shared mechanics module. Preserved unrelated chapter/settings edits.

## Verification

- `node tools/verify-cart-mechanics.mjs`:72,000 samples across6health values,4surfaces and5speeds. Pure/same-state stable, terrain and wear progression, no travel-phase jump from speed changes, pause/mode/foot suppression and centered/directional impact signs. Max authored suspension heave0.06168m, pitch0.01799rad, roll0.02295rad before bounded threat/steering/impact composition.
- `node tools/verify-cart-mechanics-envelope.cjs`:3,780 full-model samples,7health values ×4surfaces ×3steering directions ×9impact directions ×5ages. No vertex exceeds cart hull. Max|x|1.15728m vs1.16m; max|z|1.59125m vs1.6m. Full-speed sand/wet poses deliberately test an upper bound above their normal travel speed.
- `node tools/verify-cart-mechanics-browser.cjs`: hardware pass,639poses at60/30/15Hz, three damage levels, repeated draws and stable geometry update count. Root/camera unchanged by body wobble. Actual W/D driving remains responsive at15health. Reduced motion suppresses mechanical articulation.18hardware programs/36textures, no new buffer allocations, no errors.
- Software variant passed639poses before the final small presentation envelope refinement;23programs/36textures/no new buffers. Final envelope audit directly inspected actual vertices after the final clamp/tuck; final software rendering/regression evidence recorded below.
- `node tools/verify-cart-mechanics-audio.cjs`:9rate/speed fixtures. At4/8/14m/s,3/7/13rattle cues respectively, identical at60/30/15Hz. No duplicate, blocked-travel, mute/resume or repaired-cart replay.12voices.
- `node tools/verify-cart-damage-audio.cjs`: full offline damage→failure chain passes,3crunches,4rattles,4collapse cues,1ejection landing. Peak0.430, pause tail0,12persistent voices, no runtime audio allocations. Covers repair/retry, mute/late unmute and cue priority.
- `node tools/verify-heavy-impact.mjs`: eight angle/strength cases plus four boundary/obstacle cases, protection, brief decay and reduced motion. Shoves0.3544–0.64m; no obstacle penetration.
- `node tools/verify-heavy-impact-browser.cjs --software`: actual ram reduced speed10.53→6.4m/s, shoved0.63999m, entered Joe backoff, retained turning/escape, pause and in-game reduced-motion setting. No extra geometry buffers or render resources.
- `node tools/verify-vehicle-impact-audio.cjs`: directional mix passes, left impactRMS0.0712 vsright0.0114, bounded peak0.441, quiet pause tail, muted silence, one impact cue.
- `node tools/verify-red-night-damage.cjs --software`: five damage views, collapse/grounding, repaired parts and reduced-motion settled wreck pass;23/36 resources/no new buffers. Final rerun after the lean envelope also passed.
- `node tools/verify-cart-rumble.cjs`: legacy panic/solo-driving/steering/hull/camera/pause/reduced-motion/audio tests pass after updating fixtures to advance actual travel and use current settings/12voice budget.
- High-resolution2560×1600 driving and damaged close-view screenshots inspected. Dark pixel materials, bent roof, rear components and readable health remain.1280×720 and844×390 final views also inspected.

## Performance and final checks

Matched same-context software moving ABBA benchmark89347 completed (960×540,96samples/version per view):

| View | Median before/after (ms) | P95 before/after (ms) |
|---|---|---|
| Foliage |38.0 /38.9|42.0 /42.2|
| Wet lane |32.8 /33.0|38.9 /44.9|
| Visible mower |27.0 /27.0|35.9 /30.1|
| Damage/impact |26.8 /26.6|29.0 /29.1|

A focused wet-lane repeat37852 completed: median51.8/52.4ms,P9555.0/56.8ms,CPU P950.6/0.6ms. Ambient load varied materially between runs. Draw ranges are identical; triangle ranges identical except2triangles at one mower-view boundary. No new buffers. This supports bounded added work, not a broad speedup or fixed worst-case frame spikes. Keep item1 open.

Final checks completed: software damage20022 and ejection55687 passed after the final model envelope refinement;23programs/36textures/no new buffers, ejection minimum sampled height0.01167m. Installed client14429 completed and its final screenshot/state were inspected: cart reached x5.64,y66.87, maintained15health and responsive steering,8distance-driven panel contacts, no error artifacts. Hardware2560×1600, final1280×720 client,844×390 compact driving and intact/critical model views inspected; damage silhouette, health and routes remain readable. All pass9 handles are terminal. No human listening or playtest is claimed.

## Remaining full-goal work

Software frame spikes, complete route/landmark/world composition, barrier rules, lighting/beacon, enemy survival-audio/accessibility, controlled variation/supernatural/story beats, sparse dialogue and broader whole-course completion audit remain. Human gameplay/listening feedback is deferred and prepared, not claimed conducted.
