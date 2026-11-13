# Final Cut hero machine materials and tires

Full objective: all 72 items in `design/final-cut-visual-upgrade-plan-2026-11-13.md`. This is a partial hero-machine pass, not overall Level 1 parity or final visual acceptance.

## Implemented

- Replaced the previous generated boss atlas (repeated lettering, bolts and grille motifs across unrelated parts) with the existing authored industrial atlas, at 1.6 metres per material cell. The actual shared source is 1774 × 887; it is not a new 1024 texture. Paint, steel, enamel, rubber, brass and localized safety striping have distinct assignments.
- New `final-cut-machine-finish.js` supplies surface-local coordinates, clustered paint loss at manufactured edges, seam darkening, and oil near the rear filler caps/casing. No animation clock moves the texture. Three small dedicated identification plates carry the lettering. The radiator backing is dark and the canopy fascia is green.
- Bodywork tags every individual lid, hinge, shell face and fitting before merging, so edge wear follows that component rather than the bounding rectangle of the whole housing. The four original contact envelopes, geometry and 1,012 triangles remain unchanged.
- New `final-cut-tires.js` replaces the flat cylinders and transverse bars with rounded carcasses, recessed beads, 48 paired chevron lugs, six molding rings and 72 short shoulder ribs per tire. One geometry and one material are shared by all four wheel parents. Existing steering and roll transforms drive them. No new texture, collider or attack timing.
- Tire geometry contains 7,072 triangles per wheel (28,288 across four visible tires). This is a rendering cost, not a performance improvement claim. The authored rubber finish is intentionally dark; broad material and lighting tuning remains open.

## Verification

- `tools/verify-final-cut-hero-materials.cjs`: six unobstructed production-scene views (front, quarter, rear, hood, wheel, Joe), actual keyboard strafe/350 ms step, and five viewport sizes. Hardware renders 2560×1600, 1920×1080, 1280×720, 844×390 and 390×844 natively. Software initially renders 960×600 within the 2560×1600 viewport, then 960×540 on desktop, and native small viewports. Both pass without page/console errors or horizontal overflow.
- The same probe examines every new tire vertex: all four are registered with the original contact audit, stay within the authoritative wheel width/radial envelope, and share one geometry/material. Warmed repeated views retain stable geometry and texture counts. Reports are in `output/final-cut/visual-hero/accepted/report.json` and `software/report.json`.
- `tools/verify-final-cut-rig-browser.cjs`: eight actual rendered pass/turn/distance poses pass swept-planar bounds, with maximum excess below 4.8e-8 m. Reel widths remain 2.7/3.9 m. The audit now has 112 entries because each tire is a single merged mesh instead of 26 separate entries. No assertion was relaxed to accommodate the new geometry.
- `tools/verify-final-cut-bodywork.cjs`: five seated actions plus live, restored and reduced-motion collapse retain leg clearance; actual skinned triangles do not intersect the seat/back/support. Minimum housing separation is 0.384 m, restored geometry error zero. Four body meshes and one material remain stable.
- `tools/verify-final-cut-rolling-boss-browser.cjs --compact`: 14 sampled states through east/north rolling routes pass actual mesh position/yaw, wheel roll and steering, hand/foot contact, and pause checks. Atlas assertion now checks the actual loaded authored image width. Four representative screenshots retained.
- `tools/verify-final-cut-rig.mjs`: 2,000 seeded independent contact comparisons, headings, swept contact, raised-wing masonry, four update frequencies and concealment extent checks pass.

- Final `verify-final-cut-arrival-browser.cjs --compact --balls --crossings --out=output/final-cut/visual-timber/routes-final` passes all three input-driven direct/garage/drain finales, four actual heard ball redirects (1/1/2), bank/open crossings, pump, bell, physical collapse and road completion, with zero captures/errors and 20 retained screenshots. Existing output paths were reused; this report now describes the hero/tire source state.
- Installed skill client with `tools/final-cut-story-short-actions.json` exits 0, completes the intro, and moves to y=4.737 in `final_cut_playing`, ready=true, at 960×540. Final screenshot and state inspected; no error artifact. Source state includes the new tire statistics.
- Prior pending handles 17153, 51322 and 22232 were polled to terminal success before this pass; their results were not inferred from old files. All current test handles are terminal, including 68527, 92610, 39030 and 14447.

## Visual review and limits

Inspected native hardware quarter/rear/wheel views and software Joe view, plus the prior installed-client gameplay image. The mower is visibly industrial, with readable cutting banks, green bodywork, restrained warning strips and rubber/metal separation. Joe's face itself has not been changed. The unobstructed central-arena fixtures provide close art evidence that the reed-obstructed arrival camera cannot provide.

FV03–06, FV35–49 and final acceptance remain open. In particular: finish panel curvature and fenders; improve engine/axle/service construction; author further mechanical wear; add terrain-specific tire dirt; verify loaded tire radius/ground compression and rolling contact through the full ending; improve Joe's face, expressions, clothing and cab lighting. The current wheel rotation retains the established 0.84 m nominal radius while the tread envelope is approximately 0.913 m, so passing the legacy rotation test does not establish the final loaded-tire/contact requirement.

The three label planes are mounted a few millimetres proud of existing plates; they are decorative and are not included in the original contact-part audit. That audit does not prove every pre-existing boss decoration stays within contact solids. Motion screenshots and stable resource counts do not prove complete frame pacing, texture-memory budgets, or overall visual parity with Level 1. Those full gates remain active.

Existing representative output paths were reused to keep disk usage bounded. Other chapter files and the existing port 4187 server were retained.
