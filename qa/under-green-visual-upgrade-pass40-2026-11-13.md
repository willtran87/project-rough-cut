# Under the Green pass40 — low-light hazard and attack review

Status: verified progress following pass39 progress. V32 locally accepted across the earlier independent-source work, pass38 source/glass/glow agreement and this encounter review. No runtime lighting values or gameplay behavior changed. Full53-item goal remains active; seven whole-level release gates remain pending.

## Evidence

- New `verify-under-green-dark-readability.cjs` searches240seconds of actual independent lamp clocks at20ms intervals. Candidate exposure is selected by summed source power/distance attenuation at the hazard or actor location. This is a low-light candidate heuristic, not a measurement of absolute minimum final-pixel luminance: source color, surface normals, fill and occlusion are not in the search objective.
- All8crossings have29applicable state fixtures: low/warning/surge/receding for6cyclic hazards, low/warning/surge for pump return, low/surge for pump outflow. Each uses its actual schedule and actual bypass state. Both banks' actual material references match the correct red/amber/green symbol, including danger during recession. Cameras are on collision-valid floor. Visual review confirms signal shapes remain prominent against the dim surroundings; near-bank markings can lie below these forward-facing views, so this is not full bank-composition acceptance.
- Five actor locations cover gallery,bunker,pump,range,keeper. Each has five critical attack poses at its sampled low-light moment, then a complete2.47second authored windup/cut/recovery sequence at30Hz while actual light clocks advance through the selected time.76frames per location,380per renderer. These are controlled visual fixtures, not autonomous chase playthroughs; the player remains fixed and Joe's authored phase/age are set explicitly.
- Rendered blade endpoints agree with the collision segment to under1.5e-14m in native samples; hand error below9.52e-8m. During every sampled sweep the blade remains raised. This avoids accepting a cached lowered carry pose as attack evidence. Body, face and blade remain separable in inspected dim frames, including bunker sequence and range spray background.
-96native/96software views, zero page/consoleerrors. Native rendering2560x1600, software960x600 in2560x1600viewport;1280x720,390x844 and844x390 crossing/attack views included. Pause preserves lamp values, actual ReducedMotion control yields a steady attack view. Inspected native critical-pose montage, all29crossing overview, full-size lesson surge, final bunker motion strip and portrait attack; software bunker midcut and spillway surge. Other complete frame sequences are retained as evidence for further motion review.
- `verify-under-green-flicker-contracts.mjs`: all17clocks sampled over240seconds at120Hz. Values remain within.16–.96, maximum frame step.008068, ReducedMotion fixed.72 at every sample, sources have distinct phases. Existing broad slow dips/recoveries retained; no synchronized strobe introduced.

## Findings and acceptance

The current lighting meets local V32 cue-readability criteria in these authored encounter views. Critical signal shapes remain readable during low illumination; actual scythe preparation/cut/recovery retains a visible blade silhouette. Combined with pass38's exact lens/glow/practical-source agreement and current bounded independent-clock audit, V32 is implemented locally. No additional brightness or emissive edge was needed.

This is not a guarantee for every display, every camera placement or combined gameplay load. Full matchedLevel1, motion/responsive, hazard states, clearance, performance, accessibility and district-identity gates remain open. No new performance measurement is needed for this verification-only pass; existing poor software performance is unresolved. No geometry/control/checkpoint/simulation/banner changes. Installedclient pass39 remains the latest gameplay smoke on unchanged production code; this pass does not claim a new client run.

## Artifacts and corrections

Authoritative final evidence is `output/under-green/visual-upgrade-local/pass40-final/{hardware,software}` with report.json,fixtures.json,motion.json and96images each; pass40-source contains flicker audit,11source hashes and both verifier snapshots. Initial pass40-readability is exploratory and superseded: it used a weak weapon-property check, then a corrected check briefly confused the string phase label with numerical pose. Final tests read run.joe.weaponPose explicitly and passed. No production defect was inferred from that test error.

All owned jobs92503,79415,51152,40632terminal. Server4187 retained. Ledger26implemented/26in_progress/1pending; full53requirements retained.
