# Sign lighting and placement study

This is diagnostic evidence; production objective signs are unchanged.

`node tools/inspect-course-sign-lighting.cjs` captures the existing sign material, a fully Lambert-lit face/frame, and a relocated opening sign. It uses the actual fixed lantern field and current scene. Final session74548 passed without page errors. An earlier preview loop incorrectly read an unlimited draw range after enabling clear navigation; that owned process tree was terminated, and the harness now disables the preference before extracting the finite range and explicitly rejects non-finite counts.

The fully lit Audit Bell board responds coherently to its existing station lantern. The same material on the opening board is unreadable: its nearest source is 4.6747m away, beyond the 3.25m lantern reach. Therefore merely replacing Basic with Lambert is rejected.

Moving the opening board from world(-2.5344,-6.4) to(-3.1344,-11.5) makes it legible under the second lantern pair and visibly integrates it into the scene. However the relocated mast lies within the branch path; this is not a production placement. It also needs route-direction and early-teaching checks before any adoption. Adding readable light must not relocate a physical board into a walking lane or change what its arrow promises.

Evidence: `output/level-one-sign-lighting/{before,lit,staged}-*.jpg`, `probe.json`. These are 2560×1600 diagnostic views, not responsive, motion, navigation or full sign-family acceptance. The probe mutates materials only in its disposable browser page.

Next work: solve source placement and sign construction together. Check a fully physical hooded sign light against existing-lantern placements outside the complete panel/mast walking envelope. Review every sign's front/reverse reading distance, the three path variants and navigation preference before replacing the production material. Retain28 path lanterns, ambient0.005 and the full visual ledger. Do not repeat the already-rejected material-only or in-path placement candidates.

Follow-up2026-11-14: the accepted opening-board solution is a shielded reading light at the unchanged original anchor. The other14 optional boards retain their previous material treatment. See level-one-opening-sign-light-2026-11-14.md for source, shadow, clearance, responsive and performance evidence. This study's rejected candidates remain reproducible from its captured objective-cues baseline.
