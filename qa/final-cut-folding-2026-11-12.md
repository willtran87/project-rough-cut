# Final Cut folding clearance and contact cost

Physical clearance now includes both wings' decks, trim, reel housings, combs, lamps and hydraulic bars throughout deployment. `RIG_WING_PARTS` supplies the renderer and the clearance calculation. These solid structures stop at masonry even when the cutting assemblies are inactive. Raised cutters remain nonlethal to the player.

The clearance calculation rotates each part in its side/height plane, clips it at the wall's top, then tests the resulting horizontal footprint against the wall. A raised tip can pass above low masonry; its lower heel cannot pass through it. The round reel uses a conservative surrounding box for this structural test. The player damage shapes remain the prior chassis/wheel/active-reel shapes.

Deployment, folding, pass translation, turning, alignment and steering changes all check their proposed physical pose. A blocked deployment disengages instead of committing a pass. If a reel heel cannot lift beside a corner, Joe eases straight back at 0.8 m/s until it clears, then completes the fold and selects another pass. It uses actual translation, ordinary central-vehicle contact and inactive cutters. Captions distinguish backing, holding, lifting and alignment. No hidden relocation or forced player motion was added.

## Evidence

- `node tools/verify-final-cut-folding.mjs`: PASS. A folded reel clears 1.25 m and 2.35 m walls underneath it but meets 4.2 m masonry. A deck behind an inactive reel also blocks masonry. Raised damage remains inactive.
- Eight actual 10-second simulation recoveries at 30/60/120/144 Hz verify blocked deployment and a folding heel beside the real pump shelter. Every sampled pose is clear. Deployment aborts before entering a committed pass. Folding backs from y38.75 to approximately y38.18, completes and resumes in turn/alignment. No captures.
- Initial corner fixture was rejected because its lamp already intersected the wall. The corrected fixture starts fully clear at x20.13/y38.75. Another initial assertion tracked minimum y after the rig resumed its ordinary route; it now measures the backing interval only.
- `node tools/verify-final-cut-folding-browser.cjs`: PASS ten actual rendered poses (five deployment amounts, two headings) against four wall heights. Tests all 26 wing meshes, including triangle-edge intersections with the wall-top plane. Maximum containment excess is floating-point noise, approximately 1.03e-14 m. This verifies conservative containment, not exact round-cylinder contact.
- The browser test also advances the real corner recovery, checks its backing caption, and verifies resumed movement. Before/backing/recovered screenshots inspected. Four-size half-fold screenshots inspected at 2560×1600, 1280×720, 844×390 and 390×844. Close portrait view naturally crops the long wings; interface remains readable.
- `verify-final-cut-rig.mjs`: PASS eight groups, now including 2,000 seeded arbitrary yaw/steering comparisons with an independent world-space circle/OBB distance calculation.
- `verify-final-cut-rig-browser.cjs`: prior eight cutting/turning roll poses still PASS. Geometry audit now exposes 74 relevant meshes, including the newly registered structural parts.
- Main thirteen groups/seven full pilots and arrival six full pilots PASS. Three uninterrupted crossing browser routes PASS with zero captures and unchanged durations (126.767 / 126.107 / 127.314 s). The full browser routes ran before the final additional steering-pose guard and caption refinement; the final main rules, folding recovery, acting and focused browser checks cover those changes.
- Acting regression PASS: one actor, phase cycle, pause/restore and full dismount. Hand/foot errors remain below 0.001 m. Release checks PASS 70 referenced images/34.16 MB, 90 scenarios, no warnings.
- Installed web-game client final two-burst run completed after the final caption change. `output/final-cut/folding/client-final/shot-1.png` and `state-1.json` inspected: playing at 6.5 seconds, 68 draws, 21 geometries, 15 textures; no error artifacts. These ordinary movement bursts supplement the focused folding browser fixtures.

## Local contact timings

Removed repeated immutable shape construction and world-object copies from inner contact loops. Geometry remains unchanged; frozen shared templates cover straight body/cutting poses, while steering creates only the changing wheel shapes.

The retained pre-optimization report is `output/final-cut/folding/before-contact-cache.json`. Each profile warms up 500 calls and reports thirty batches of 200 calls; p95 is the p95 **batch mean**, not an individual-call tail latency.

| Component | Before mean | After final mean |
| --- | ---: | ---: |
| Nearby folding/masonry clearance | 0.280 ms | 0.046 ms |
| Nearby moving-player/rig sweep | 0.142 ms | 0.011 ms |
| Distant masonry broad phase | 0.0010 ms | 0.0010 ms |

These are local Node CPU microbenchmarks. They do not establish GPU completion time, frame pacing, supported-device FPS or allocation-free execution. Final measurements and pose reports are under `output/final-cut/folding/`.

The previous QA's folding/deck implementation gap is addressed by this pass. Conservative wheel/tread and reel housing envelopes, human fairness/listening, final art/sound and sustained hardware performance remain documented limitations. The full 72-item goal remains active and incomplete.
