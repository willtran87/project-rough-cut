# Back Nine shelter construction — 2026-11-14

Partial progress toward BV21 architectural depth and BV37 fixture construction. Neither broad requirement is complete; the full 48-item goal remains active.

The practical-light pass exposed exterior slate on the undersides of both relay roofs. Each now has 28 fitted timber boards with narrow joints, 12 sloping rafters, connected wall plates/tie beams/ridge, post sockets and fasteners, gutter troughs/brackets/downpipes, and a suspended hood around the existing light. Existing timber/metal material batches are reused. Production changes are confined to `web/back-nine-architecture.js` and its import version in `web/back-nine.html`.

Geometry checks: 1,666 upward samples intersect the timber roof/frame, and 126 horizontal passage rays at player/camera heights remain clear. The first test incorrectly required timber to be the first hit even where the existing metal conduit crosses overhead; the final test checks timber coverage behind fittings separately from passage clearance. All sampled roof rays hit timber. Relay foundations are flat in the authoritative terrain model.

Native baseline/current and current software: nine matching views each, including both relays, approach/interior/exit/reverse/gable, reduced motion, 2560×1600, 1280×720 and 390×844. Screenshots inspected: boarding replaces visible slate, connected beams remain above the camera, and narrow layouts retain the path and HUD. Source material/detail direction compared with the saved Level 1 service-building reference. These shots do not establish whole-level parity.

Native count changes: +288–1,176 visible triangles, zero additional draws in most views and one in the second-relay views; programs remain 36 and textures 57. No new shaders, textures, lamps, simulation changes or per-frame update work. Software still has pre-existing lower resolution and vegetation-lighting differences; no performance improvement claimed.

The first standard-client invocation omitted `--back-nine`, leaving startup unprepared. Its `client-native`/`client-software` directories are invalid acceptance evidence. Correct invocations use `--back-nine --practical-lights --high-resolution`, the installed skill client via `tools/verify-presented-client.mjs`, two iterations of `tools/fixtures/back-nine-windbreak.json`, and separate `accepted-client-*` directories.

Acceptance results and measured client timing are recorded in `output/back-nine-visual-upgrade/shelter-craft/comparison.json`. The audit compares physical state fields across all nine views and both input runs, verifies current served architecture bytes/import uniqueness, and archives sources/tests/evidence hashes.

Remaining: individual shelter weathering and richer fixture glass/reflector treatment, broader architecture and district composition, woody vegetation, encounter framing BV44, camera BV46, and combined-load software fidelity/performance. The roof pass alone completes none of those larger requirements.

Final acceptance: all nine baseline/native/software physical-state comparisons pass; pause freezes the run and UI restart restores relay progress to zero. Both actual-input clients finish at (1.606224015981739,306.5428922631389), speed 7.2 m/s, relay 1 online, with no browser errors. Native final canvas 2560×1440 average 11.78 ms / P95 12.80 ms; software 640×360 average 82.19 ms / P95 108.20 ms. Both final images inspected. Timing at different adaptive resolutions is not a comparative performance claim.
