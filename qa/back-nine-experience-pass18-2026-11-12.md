# Back Nine experience pass18 — runner clearance through escape passages

The prior goal turn restated the 38-item list without changing authoritative state: no implementation progress. This turn revalidated the course, reproduced an actual control defect, fixed it and verified the current runtime. The full goal remains active; no human playtest was conducted.

## Defect and correction

The runner used a rotating square for feature/vehicle contacts while static clearance used a fixed .32m radius. Turning near a fence could put a corner inside it by less than half a millimetre. Every subsequent swept move then started overlapping and stopped at t=0, including movement away from the fence. The runner could remain stuck indefinitely despite the visibly clear foot passage.

Reproduced at x=-33.76177,y=769.44247 near the garage service gap, and when backtracking through the range gap. The old browser runtime moved **0m** during a one-second W input at this pose. This did not require Joe: pursuit-free runs also stalled.

`web/vehicle-contact.js` now treats a living runner as a round .32m ground footprint against oriented feature/vehicle rectangles, including the mower's separate body and deck shapes. Contact normals retain their orientation for swapped arguments. Cart/mower SAT hulls and sweeps remain unchanged. No fences were widened, no obstacles removed, no movement speed increased and no grace period added. The existing sweeps still prevent crossing walls, wrecks or cutting decks.

`web/back-nine.html` maps vehicle-contact.js to `20261112-foot-clearance-1`, so existing installations receive the fix.

## Verification

Artifacts: `output/back-nine-experience/foot-clearance/`. Its baseline-source snapshot preserves the pre-change contact module; before-routes.json and software-before-browser.json reproduce the defect. Source hashes record the verified files.

- `node tools/verify-runner-passages.mjs --baseline`: 48 actual-input simulations across all three authored foot passages, both directions, 30/60Hz, pursuit-free plus Joe 12/20/30m behind. Before: 38 completions, eight persistent snags, two actual catches.
- `node tools/verify-runner-passages.mjs`: same matrix after correction: **46 completions, zero snags, zero feature penetration**, and the same two dangerous close reverse-approach catches. The garage reverse approach with Joe only12m behind remains lethal; passing through a narrow gap is not immunity. Assertions explicitly preserve those catches rather than making all scenarios invulnerable. Navigation bake/signature2693326411 unchanged, zero fallback edge checks.
- `node tools/verify-runner-footprint.mjs`: 12,960 heading-invariance/contact-symmetry cases; **8,000 cart/mower hull and swept-pose comparisons exactly match the saved implementation**; 12 fast runner sweeps still stop before a thin fence, mower or cart.
- `node tools/verify-runner-passages-browser.cjs` and `--software`: actual W input clears the previous snag by4.8838m in one second. All three complete live-Joe passages at2560x1600,1280x720,844x390. Mouse remains ignored, Q preserves heading, pause freezes state, reduced motion works. Inspected hardware/software screenshots, including gate approach, exit, compact rendering and standard-client movement.
- Browser resources: **20 hardware /25 software programs,40 textures,1,114 buffer uploads unchanged,12 audio voices**, no console/page errors. These allocation checks are not a frame-time improvement claim.
- `node tools/verify-runner-controls.mjs`: steering, look-back, fence sliding, camera clearance, warned locked charge/recovery and comfort beacon pass.
- `node tools/verify-chase-senses.mjs`: finite evidence-based searches, concealed movement, release/reacquisition, priority and physical cover pass. Range cover still yields8.65s hidden,8.33s searching and4.52s relief.
- `node tools/verify-back-nine-choices.mjs`: all five cart gates/three foot passages, mower detours, seven driven branches, actual late fatal ram→protected ejection→foot passage→garage completion→retry pass.
- `node tools/verify-vehicle-contact.mjs`: nine physical vehicle collision/recovery/escape checks pass.
- `node tools/verify-chase-runover.mjs`: seven repeated physical rams, front/rear/side death contacts,2.4s death sequence and protected ejection pass.
- `node tools/verify-chase-variation-routes.mjs`: **64 full live-Joe routes complete;42 cart finishes and22 on-foot finishes**, seven encounter patterns; minimum surviving cart health4,75.45–86.73s. No warning/pathing/collision changes.
- `node tools/verify-chase-breakdown-clearance.mjs`: **1,401 legal cart placements** produce safe ejections with at least five tested ways to move2m; four real fatal collisions recover control; wreck cover still buys2.38s and Joe navigates around it before catching a stationary runner.
- `node tools/verify-cart-ejection.cjs --software`: ejection poses, grounding, asymmetrical bracing, actual collision/landing/audio, control return, pause, reduced motion and responsive captions pass; no resource growth/errors.
- Installed client via `node tools/verify-presented-client.mjs --back-nine --foot-gap --url http://127.0.0.1:4187/back-nine.html?test --click-selector '#primary' --actions-file tools/fixtures/back-nine-foot-gap.json --iterations 2 --pause-ms 250 --screenshot-dir output/back-nine-experience/foot-clearance/standard-client`: inspected page/state0/1. Ready, driving on foot, y774.33 then780.92, full movement, no errors;960x540 software canvas.

All owned test processes were observed terminal. Local server retained. Other chapter work was preserved.

## Remaining acceptance

This resolves an actual movement/reliable-route defect under#6,#19,#21. It does not close whole-course on-foot balance, landmark recognition, wreck connectivity, software frame stability or the remaining rows. The distinct narrow paths are visible in the reviewed views, but broad route-choice recognition still needs full-course review and later human feedback. Existing ground classification treats some paved foot paths as rough; review visual/physical surface consistency before changing speed/audio balance. Continue remaining software profiling, route/lighting/spatial-audio/retry and restrained omen acceptance. Do not repeat death-camera polishing without new evidence.
