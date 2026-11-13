# Final Cut opening parking and boarding staging

This resolves the initial reed-occluded marker issue found in the industrial-lamp pass and advances FV50/FV70. The full72-item visual objective remains active; it is not final Level1 acceptance.

## Changes

- Shared OPENING_RIG places the first parked mower atx24.6/y26, 5.4m on the course side of its former location. The two raised markers and unfolding banks are visible from the overlook. Later ambush positions, reed geometry and collision, warning times and cardinal routes remain unchanged.
- Joe walks diagonally from the existing equipment-bay entrance to the same step-relative boarding alignment at the new parking location. He turns for0.8s and gets0.6s to finish planting both shoes before climbing. This avoids a72.7mm foot snap exposed by the changed approach direction.
- The first standing transfer retains the lower planted-shoe pelvis support when one foot is on a12mm paving lip, then transfers load smoothly through the first step. This removes the secondary4mm root-height mismatch without loosening contact checks. Actual maximum joint movement across the turn/climb boundary is2.683mm over0.2ms; the existing limit remains5mm.
- A standard cutting pass records its actual starting x at commitment. The position-driven acceleration profile now accepts that origin; the opening covers54.6m, starts at rest, accelerates at2.4m/s², peaks7.2m/s, cuts all three first-strip sectors and brakes atx−30. Ordinary60m passes retain their original behavior. Ambush motion is untouched.
- Arrival motionVersion4 migrates version1/2/3 walk/climb/startup progress from their historical timings, reconstructing old feet at the new parking location. Current saves preserve exact planted and unfinished-swing support. The chapter save version remains1.

## Evidence

- Hardware reveal browser pass:12captures, actual input through intro/look/E-use, two physical unblocked markers, increasing lamp/wing spread, paused illumination, completed-reveal reload and four viewports. Native2560×1600 two-marker/full-width captures inspected. Report: output/final-cut/reveal/hardware/report.json. This ran before the final0.6s settling and uneven-support refinements; final behavior also has pure-clock, lifecycle and full-route coverage below.
- Reed sightline pass: all48 comparisons remain pixel-identical with the hidden rig shown versus removed, across four cardinal directions, near/far, lateral positions and standing/crouch. No reed geometry or shader edits. output/final-cut/visual-reeds/sightlines/report.json.
- Drive rules: eight original60m directional runs plus four actual54.6m opening runs at30/60/120/144Hz, bounded2.4m/s² acceleration, correct distance/end point, all3sectors cut and full-speed trap arrival. The opening test accounts for the phase change occurring inside a coarse simulation frame and checks its analytic within-frame distance/speed rather than assuming an exact end-of-frame zero.
- Transfer lifecycle: all joints stay below5mm across five phase boundaries; actual pause, reload/resume, reduced-motion UI and four viewports pass. Corrected boarding diagnostic camera to follow the new parking position and added current intro navigation after reload. output/final-cut/transfer/lifecycle/report.json.
- Actual skinned geometry/support sweep:322boarding/exit poses, zero contact intersections/support failures; maxfoot IK error2.7e−7m. output/final-cut/transfer/current/report.json. Native boarding view inspected; initial face/clothing remain dark, so this is physical continuity evidence, not character-art acceptance.
- Ground rules:15arrival/ending/late-gate/opposite-wreck runs at30/60/120Hz preserve zero planted-support drift, bounded reach/lift and exact current foot saves. Version2 fixtures now use historical walking duration; version3 mid-walk and climb migration tests preserve progress and round-trip exactly after conversion. Legacy completed startup remains ready.
- Pure arrival: three valid starts, indefinite safe observation, real Use, protected rail, six walking/sprinting simulation completions. Reveal state tests and32cardinal contact/escape cases pass.
- Final full browser routes: direct/garage/drain each complete by real input, four heard ball redirects total, bank/open crossings, pump/bell/collapse/road, zero captures/errors and20retained images. output/final-cut/visual-timber/routes-final/browser.json. Includes final turn settling and transfer support changes.

Software reveal and installed-client final receipts are appended after their live processes finish. Do not infer their success from older files. Remaining work includes initial character illumination, engine/hydraulic and Joe art/acting, exterior/flood fixtures, ground/refuge/effects/story/UI and matched Level1/performance gates.

## Software receipt

Final software reveal72993passed12captures/fourviewports with noerrors. Inspected2560x1600viewport marker shot (960x600internal) and390x844portrait deployed view. Internal dimensions are distinct from capture dimensions. Installed client82907is currently running; no restart.
