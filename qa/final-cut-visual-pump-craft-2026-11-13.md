# Final Cut pump cabinet and feed — 2026-11-13

Status: verified progress on FV33, supporting FV27/FV31. Full 72-item goal remains active; 18 complete, 26 in progress, 28 pending. This is not whole-level Level 1 parity acceptance.

`web/final-cut-pump-hardware.js` replaces the plain cabinet and overlapping static/dynamic gauges with a formed service enclosure, return edges, barrel hinges, latch, recessed louvres, selective edge chips and staining. A 128px authored dial has tick marks, endpoint numerals, a separate needle, socket/stem and guarded indicator. Existing saved pump/water state owns the needle and telltale. The original lever and E interaction remain authoritative.

The disconnected rectangular pipe is now a continuous cylindrical feed from the cabinet to the x17 irrigation run. Six flange joints have paired plates, gasket seams and six bolts each; four supported locations ground the long pipe. The main run meets the existing manifold/nozzles. The middle-strip warning post was moved beside the pipe and given a mounting plate after screenshot review exposed their intersection. No simulation, collision envelope, trap trigger, input binding or saved-state format changed.

Static detail uses existing scene batches and materials. The instrument owns four geometries, two materials and one small dial texture; no additional light is introduced. Full teardown releases all seven owned resources exactly once and deletes the uploaded dial texture.

## Terminal evidence

- `verify-final-cut-pump-craft.cjs`: native final session33934 and software58202 PASS, 15 views each. Native uses actual2560x1600; software fallback960x600 at the same viewport. Also checked1920x1080,1280x720,844x390,390x844. Before comparison67682 PASS14 views (before addition of the wide view). First native36958 PASS preceded the final pipe/sign-support correction.
- Actual Enter leaves the valve closed; E opens it. The six-second fill changes needle/indicator, preparation alone does not win, pause pixels remain exact, and actual reload restores the charged state. Camera rotation warmup plus animated sampling retains native141 geometries/58 textures and software139/55.
- Inspected native front, full cabinet, oblique, rear, outlet joint, flange/support, charged and portrait views; software full-cabinet view; matched old front/outlet; final installed-client image; and final irrigation collapse image. Close portrait framing intentionally shows only part of a nearby world object; world navigation/look remains available.
- `verify-final-cut-arrival-browser.cjs --balls --crossings --out=output/final-cut/pump-craft/routes`: session56195 terminal PASS, three uninterrupted real-input direct/garage/drain routes, bank/open crossings, four heard ball redirects, pump/bell/physical collapse/road completion, zero captures/errors,77 screenshots.
- `verify-final-cut-irrigation.cjs --out=output/final-cut/pump-craft/irrigation`: final54978 terminal PASS22 images, actual pump operation, rising water, both collapse headings, four wheel origins, rupture/wet seats, reduced motion, exact pause and reload, residual flow and allocation stability.
- The irrigation test initially failed because its wheel expectations still used side±1.5/rear−1.6 instead of the current authored±1.83/−2.05 dimensions. It now calculates expected world positions from the actual wheel layout and rig pose. No wheel implementation was changed.
- A second legacy fixture failure counted a newly visible backdrop plane as an allocation leak (123→124 geometries). Test instrumentation confirmed no newly uploaded world geometry; including the backdrop exposed the existing PlaneGeometry. The test now warms existing backdrop planes before the allocation sample. Final132→132 geometries, no new uploads. Earlier terminal failed runs14785/89837/15570/81669 are not acceptance results.
- `verify-final-cut-pump-disposal.cjs`: terminal PASS seven owned resources, uploaded gauge texture alive before teardown/deleted afterward, each dispose event once, no errors. Initial test incorrectly included a shared cached material map; the final test follows actual ownership.
- Installed `web_game_playwright_client.js`, short story payload, session29446 terminal exit0. Fresh shot/state inspected: intro completed, playing at(−1.8880467,4.7372006),960x540, new pump statistics present, no error artifact. `openingSeen:false` is the separate playable arrival flag; the story reports `lastOutcome:completed`.

## Cost and remaining work

Matched native front diagnostic retains212 draw submissions; submitted triangles1529686→1535117. Warmed resource counts137→141 geometries and57→58 textures. The dial is128-squareRGBA8, approximately87kB with mipmaps. This is resource evidence, not isolated frame-time or full performance acceptance.

Finish damp service-room dressing, localized wear/contact, refuge-specific stored equipment, pavilion neglect and the full pump composition. Downstream manifold/effect-origin finishing remains with FV56. Broader material consistency, terrain, Joe/mower, atmosphere, story/UI and final Level1 acceptance remain open.

Matched comparison: `output/final-cut/pump-craft/comparison.html`. Seven source/test snapshots and SHA256 manifest: `output/final-cut/pump-craft/source/`. Server4187 and output junction preserved; no commits, deployments, deletion or agents. All owned browser/test jobs are terminal.
