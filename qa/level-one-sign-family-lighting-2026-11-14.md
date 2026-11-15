# Level 1 optional sign-family lighting

Partial V08/V10/V19 progress. The full35-item/V01–V21 visual goal remains active.

## Result

All14 optional objective/navigation boards now have matching shielded reading fixtures. Eleven two-sided boards receive a fixture on each face; three directional boards retain a single front face/source. The25 lenses share one mesh, while300 hood/bracket/guard parts join the existing frame geometry. The opening board retains its original physical spotlight and shadow behavior. The optional boards and their new lenses remain controlled by Clear Navigation; default play still draws only the opening board.

`web/course-sign-family-lighting.js` evaluates finite, cone-shaped inverse-square illumination on each board's own Lambert face/frame material. Existing world lights still illuminate those materials. The material-local source matches an ordinary1.2-power,1.85m-range,1.4-radian spotlight with.22penumbra; larger exit boards scale source distance and power together. Panels have zero emissive contribution. Source centers/axes are static attributes; no new texture or per-frame buffer upload is needed.

This deliberately confines the reading illumination to the sign assembly. These25 sources are not world lights, do not spill onto nearby actors/scenery, and do not cast new Joe shadows. The opening spotlight still does. This limitation remains part of broader V10/V11 acceptance; the spotlight reference below proves panel illumination, not whole-world equivalence.

The existing atlas, lettering, arrows, state selection and sign anchors remain. Exit-header mounts move to their outside rails after ray checks found the original supports obstructing their rear reading beams. Gameplay collision and interactive destinations are unchanged.

## Verification

- `tools/verify-course-sign-family.cjs` and `--software`:26captures each, covering24legal gameplay views plus1280×720 and390×844. Desktop viewport2560×1600. Reverse exit headers are checked in isolation because the building/fence prevents a useful reverse gameplay view.
- Every optional sign face is rendered in isolation with its actual geometry/material attributes and compared against ordinary Three spotlights at256×192. All50native/software face comparisons differ by at most1/255. Sources off produce zero illumination in that isolated unlit scene, and restoring power returns exact pixels.
-1125reading rays per renderer reach their sampled panel points without frame obstruction. Initial shed/drain reverse mounts blocked6/4samples; moving the mounts to the outer rails resolves both. This samples the lettering area; it is not a claim that every hardware surface has a shadow solution.
- `tools/verify-course-sign-lighting.cjs --out=...` and `--software` retain the opening panel response,490unblocked lettering samples, exact cached-vs-fresh Joe shadows at four poses,15sign state progression, actual Audit Bell Use, key/valve/exit readiness, pause and warm resource stability.
- Rebuild checks prove exact-once disposal of the shared atlas, face geometry, opening shadow target and new lens geometry/material. The original sign-lamp unit checks also pass.
- Inventory comparison against the saved current baseline proves the28path-lantern coordinates, ambient.005 and11existing world lights are unchanged.
- Inspected native front/reverse Audit Bell, actual Field Log/Release Review, dark junction board, drain header, ordinary desktop and phone views; software junction also inspected. Phone text remains visible, with natural cropping of the very close outer sign frame. The original generic navigation marker near Field Log remains a separate visual refinement opportunity.

## Cost and remaining work

Optional navigation adds3600fixture-body triangles and50lens triangles; the two existing grouped frame/face draws remain, plus one lens draw (reported navigation batches7→8). Default batches remain3. Static sign attributes increase by1,274,056bytes. Native geometry resources971→972, textures107unchanged, programs104→106 in the all-sign fixture. No whole-level frame-rate or performance-regression claim follows from these counts.

Baseline source is `output/level-one-sign-family/baseline/objective-cues.js`. `all-native`/`all-software` contain family checks, `current-native`/`current-software` contain interaction/shadow/disposal checks, and `before-native` contains baseline captures. The initial material-only probe is retained separately; it showed insufficient existing light at several junction/exit boards. One probe fixture initially treated the lamp group as a mesh and was corrected before comparison captures.

Whole-route material/typography parity, source spill/actor shadows for optional fixtures, broader composition and software performance remain open. This does not complete V08,V10,V11,V19 or the full upgrade.

Installed web-game client:8bursts complete, first_hole,x13,progress24,travel34,noerrorartifact; final screenshot/state inspected. Default visibleSigns1/batches3 remain. Completed software frame average67.87ms/P9573.30ms at640×360 still misses the gameplay performance target; the baseline capture overlapped part of this run, so no causal before/after performance claim is made. All owned jobs ended.
