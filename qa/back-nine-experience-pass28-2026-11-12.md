# Back Nine experience pass 28 — readable route junctions

The previous goal turn restated the roadmap without implementation progress. This pass resumes the full 38-item scope, principally route readability (#5/#23/#24). Those requirements remain partially accepted: technical route connectivity and staged image comparisons do not prove first-time player recognition.

## Change

The five maintenance gates already had scraped jambs and wheel wear, but these cues appeared after choosing a branch. In ordinary chase views, several alternative entrances blended into turf. Added short, flush stone edge courses along the first/last 18 metres of the ten existing alternative paths. They use the existing stone texture/material and static spatial batches, follow the actual curved route, and stop short of intersecting lanes and standing water. They add no arrows, signs, lights, collision barriers, update loops, or audio.

`chase-junction-layout.js` builds a deterministic layout once; `chase-route-art.js` submits 400 opaque quads (800 triangles across the entire course). The route-art import cache tag is updated. Geography, vehicle/runner surfaces, Joe's navigation, controls, damage, music, ejection and comfort behavior are unchanged.

## Evidence

- `node tools/verify-chase-junction-layout.mjs`: 8,400 full-length samples stay clear of physical obstacles, remain within the real driveable corridor, avoid transverse markings through joining lanes and avoid standing water. Layout leaves COURSE unchanged and repeats identically. Navigation remains baked, signature2693326411, 4410 nodes.
- `node tools/verify-back-nine-choices.mjs`: all seven alternative driving routes complete; five cart apertures, three foot apertures and real mower detours pass. Relay-gated damage remains continuous. Actual fatal impact -> ejection -> foot gap -> garage completion with live Joe passes; checkpoint restores cart.
- `node tools/verify-chase-junctions.cjs` and `--software`: eight approach views at2560x1600,1280x720,844x390, each with/without only the added stone indices. 48 comparison pairs across both renderers; final screenshots inspected, including the high-resolution nursery/pump/dry-range/clubhouse/crossover views and compact range/service approaches. Existing shaders/textures remain20/40 hardware,25/40 software. No post-ready bufferData calls or page errors.
- Software comparison uses the same scene and alternating AB/BA ordering,64 pairs per view,960x540 internal rendering, and GPU completion fences. Reservoir median31.3->30.3ms,p9533.9->40.4; range27.9->28.1,p9537.7->38.3; service31.5->31.6,p9542.0->41.7. These are mixed tails with similar medians, not a performance improvement or proof that frame spikes are solved. Selected-index counts include hidden batches and are not visible triangle counts.
- Installed standard gameplay client run with ordinary keyboard actions, plus separate full-route Gamepad API input through normal controls. The initial generic keyboard fixture encountered the existing solid reservoir trailer and showed the recovery instruction; no pass-through or error occurred. The route-following client fixture is separately retained.
- Full fresh dry-range branch8 run completes in88.05s with both relays, repairs and logs. Eighty-eight seconds are simulation time, not elapsed rendering time. The cart naturally fails at78.83s near the garage and normal on-foot input finishes with live Joe. No health, grace or actor-position overrides after the normal fresh start. This is scripted route-following, not a human navigation/readability test. Two contextual Joe lines occur about52s apart, with essential threat messages correctly taking priority.

## Harness corrections and limits

The initial capture harness incorrectly treated Three's unrestricted drawRange.count (Infinity) as an iteration bound. Its owned browser/process was stopped after identifying that infinite loop, and the loop now clamps to index length. The software pass also needed to recognize the existing local-light material variant by its source material id. Both are test-harness corrections; no runtime behavior was changed to satisfy them. One shoreline stone was rejected after the dense layout test found an endpoint crossing the wet boundary; the runtime filter now considers full stone length.

Artifacts: `output/back-nine-experience/junction-readability/`; pre-change route-art and HTML snapshots are under its `baseline-source/`. `tools/audit-back-nine-route-views.cjs` accepts `--out=` to keep this run separate from prior evidence.

The full goal remains active. Software frame spikes/cold GPU stalls, broader encounter priority and pacing, all-district on-foot balance, attack/audio recognition, full-course barrier/landmark/lighting readability and optional omen variety remain open. Human playtests remain prepared for later, not claimed as conducted.

Final client check: the dedicated junction keyboard fixture moves from(18,162) through(15.07,168.56) to(5.96,181.31), remains driving with100HP/no hits and an empty banner. Both presented screenshots/state captures inspected. Source syntax checks and git diff whitespace checks pass (existing LF/CRLF notices only). All owned browser/test handles are terminal; local server remains available.
