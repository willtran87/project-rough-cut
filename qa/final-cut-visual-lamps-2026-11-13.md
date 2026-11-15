# Final Cut industrial lamp construction

The full 72-item visual goal remains active. This advances FV12/FV13 and physical fixture coverage in FV70; it does not establish full Level 1 parity or complete any entire lighting gate.

## Implementation

- Five fixtures replace the old glowing boxes: two front headlights, two wing markers and the cab ceiling light. Each has recessed ribbed lens geometry, a reflector rim, metal cage, visor, perimeter housing, mounts, trunnions and corner hardware. Lens brightness varies in fixed bands with physical shallow ribs; no bloom/noise animation or added texture.
- Shells use the existing authored industrial finish. The two existing lens materials still consume rigLampState, preserving startup, hidden setup, last-350ms warning reveal and shutdown fade. The rear and sides of the fixture no longer glow like solid cubes.
- RIG_HEADLAMPS owns front fixture dimensions and body contact. Light origins derive from those same specifications, 30mm forward of the guard envelope, retaining the previous x±1.05/y1.72/z−2.72 beam positions. Wing bounds remain unchanged. Actual shell/lens meshes are registered for geometry audit. The cab housing now contacts the canopy underside at local y2.76.
- Six unique geometries, ten meshes, one new owned material plus two existing shared lens materials; 1,728 unique / 2,880 rendered triangles. No new texture. These are resource counts, not a performance acceptance claim.

## Verification

- `verify-final-cut-lamps.cjs`: hardware and software both passed 16 cardinal phase poses, actual fixture vertex bounds, lens variation, contact registration, shared origin offsets, four collapse ages through snapshot restoration, and pause. Both final passes also check 0/half/full beam reveal during the final 350ms warning at partial wing deployment. Final software front screenshot inspected (2560×1600 viewport, 960×600 internal render).
- `verify-final-cut-hero-materials.cjs`: hardware six views, real movement and five sizes pass with no browser errors or overflow, stable warmed geometry/texture counts. Native2560×1600,1920×1080,1280×720,844×390,390×844. Corrected the historical front camera from y59 (inside bank parapet) to clear y55.5. Inspected final native front/quarter and head/wing/cab close views. Close-up probes use the production scene/materials/lights with a diagnostic camera attached relative to the actual fixture.
- `verify-final-cut-rig-browser.cjs`: eight rendered poses, 122 actual contact entries, maximum excess <4.8e−8m. Pure rig suite retains 2,000 independently calculated contact comparisons. All32cardinal attack/escape cases pass. Pure startup/reveal/fade/save tests pass.
- `verify-final-cut-lighting.cjs`: actual floor pixel samples in all three shelters reject light crossing masonry; outside wall receives the beam; moving light origins/shadow projections remain synchronized. Pause freezes exact pixels. Reduced motion retains exact lamp positions/targets/projections/stats and masonry occlusion. Collapse reload reproduces pixels and projections; shutdown ends refresh. No browser errors.
- Updated the old reduced-motion assertion: whole-frame equality is no longer valid because newer reed wind geometry deliberately changes with the preference. Kept exact paused pixel equality and replaced only the preference comparison with physical-light equality and actual shadowed/unshadowed floor samples. No production lighting was changed to satisfy this test.
- Final `verify-final-cut-arrival-browser.cjs --compact --balls --crossings --out=output/final-cut/visual-timber/routes-final`: all3 uninterrupted input-driven direct/garage/drain routes pass, four heard ball redirects (1/1/2), bank/open crossings, pump/bell/collapse/road completion, zero captures/errors,20 retained images. Includes the new headlamp contact solids.

## Open staging issue

The legacy `verify-final-cut-reveal-browser.cjs` is NOT passing. Repaired its stale intro navigation, two-fixture selection (each now has shell and glass), and old constant moon/ambient expectations. It now fails on actual tall reed occlusion of the intended opening two-marker glimpse. The marker centers are at height4.49m, with the nearer reed hit around4.67m. The captured overlook view confirms no visible lamps. Do not cite an older report.json as current passing evidence. Reconcile the initial reveal composition with later ambush concealment; do not weaken or remove the reeds simply to satisfy the old view.

Exterior/floodlight fixtures, cab bounce, moving-beam art/scatter, initial reveal staging, and broader mower/character/environment/story/UI/Level1/performance work remain open. Software fallback has passed fixture state/geometry checks, but native desktop parity and complete frame pacing are separate gates.

## Final receipts

- Final installed skill client session12162 completed with exit0. Intro completed, ready=true, mode=final_cut_playing, player y4.7372; internal960×540. Final screenshot/state inspected and no errors artifact. It took several minutes under software rendering; no retry or restart was used.
- Final hardware36765 lamp portion and software66127 both pass16poses/3warning samples/4ending ages. The subsequent legacy reveal portion of36765 intentionally remains a failed check against actual reed occlusion, recorded above. Lighting22917 and fullroute11435 terminal success. No owned test jobs remain running.
- Ledger remains13complete/26in_progress/33pending. FV12/FV13/FV70 advanced; none of those broad gates is marked complete. All72 scope retained. About680MB free during the final run. No files deleted, no commits/deployment, existing4187server preserved.

## Opening staging follow-up

The marker occlusion recorded above is resolved in qa/final-cut-visual-opening-staging-2026-11-13.md. Only the initial parking position moved to the course side; no reeds were removed or lowered. Current hardware/software reveal tests and48later concealment views pass. The earlier failed run remains historical evidence of the issue, not current status.
