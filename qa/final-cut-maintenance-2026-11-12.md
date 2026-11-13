# Final Cut — readable trap explanation at the pump

Added a permanent load-limit diagram inside the pump shelter. It depicts the bypass feeding the low swale, a heavy machine sinking into saturated turf and the raised stone path remaining above the water. It states that the bypass stays open. This advances FC16/41; first-time comprehension and the full chapter remain unproven.

The authored SVG is shared by the physical wall sign and the recovered-record journal. The world version is decoded before readiness and baked into the existing static sign atlas. Four mounting fasteners use the existing metal batch. The journal includes descriptive alt text and the existing readable prose explanation; its availability follows the existing load-limit/groundskeeper evidence. Taking the paper copy does not remove the permanent wall sign. No new interaction, gate, save field or gameplay requirement was introduced.

An actual pump-view capture revealed that the old oversized “BYPASS → NURSERY” sign obscured the clue and much of the shelter. It is now a small cabinet nameplate. The wall diagram's header and machine illustration are visible over the cabinet during Use; stepping to its side exposes the full diagram. The uninterrupted route verifies that this inspection position is reachable through ordinary movement.

## Verification

- `verify-final-cut-maintenance.cjs` passes in D3D11 and SwiftShader, three groups / thirteen captures each, zero browser errors. Explicit fixtures isolate real pump Use, separate record Use, retained wall art, paused journal inspection, frozen simulation and actual save/reload. These fixtures are not full playthroughs.
- Inspected 2560×1600, 1280×720, 844×390 and 390×844 captures. The world board is readable when inspected. Portrait world framing crops part of a close board and permits free look. The portrait journal fits its width and provides a larger prose equivalent for small diagram labels; short landscape layouts scroll vertically.
- `verify-final-cut-arrival-browser.cjs --replay=0 --overlook-start --maintenance --out=output/final-cut/maintenance/route` completes one original-plan bank route through normal Gamepad API handlers. It earns the pump, collects the physical record, walks to inspect the wall diagram, lures the rig, triggers the actual trap and exits: 132.4177 simulated seconds, zero captures, zero throws, ten captures and zero browser errors. A completed-result fixture unlocks Replay before the run; no live route placement or mutation is used. This remains a map-aware scripted chapter run, not a human or full-campaign playtest.
- Installed develop-web-game client runs and inspected screenshot/state evidence are under `output/final-cut/maintenance/`. The final verification is in `client-verified/`.

The first maintenance test used the wrong diagnostics shape (`evidence.loadLimit` instead of top-level `loadLimit`); that assertion was corrected. Final tests use the actual current diagnostics field. Earlier sign placements and the enlarged nameplate were rejected after visual inspection. No failed intermediate run is counted as final evidence.

## Overlook composition study

Before this change, `inspect-final-cut-composition.cjs --lateral` measured actual scene intersections from seven hypothetical horizontal camera positions. The current initial eye exposed zero of 36 sampled near-ground swale points; lateral positions exposed at most two. Pump roofs, rough, the bank wall and a sign produced the recorded occlusions. A wider balcony was rejected.

The same tool without `--lateral` tested four eye heights at three horizontal positions. Raising the hypothetical central eye from 6.52 m to 10.32 m exposed seven points; at 11.52 m, eleven. The resulting images still showed a small, fragmented patch of distant terrain. These are camera-only studies over the current geometry, not rebuilt terraces: a taller structure's own parapets, access and traversal were not implemented or validated. A larger tower was not justified and was not shipped.

Artifacts: `output/final-cut/composition/{sightline-study,height-study}.json` and candidate images; `output/final-cut/maintenance/{hardware,software,route,client-verified}/`. The study does not satisfy FC04. Shelter walls, overlook dimensions, route geometry, rig behavior and all other gameplay rules remain unchanged by this pass.

Remaining: genuine overview of the swale and next refuge, full dogleg/landmark composition, bent maintenance signage and stronger environmental story along the routes, human solution inference/fun/fear/listening, supported physical devices, full campaign and sustained performance qualification. The original 72-item goal remains active.
