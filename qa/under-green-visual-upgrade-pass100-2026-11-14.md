# Under the Green visual pass100 — gallery sediment and surviving render

Status: local art and functional checks passed. Software close-up regression remains open; draw-order diagnostic rejected. Whole-level upgrade remains active. The 53 requirements, 48 review refinements and seven whole-level gates remain intact. No completion status is promoted by this pass.

## Retained implementation

- Three unequal sediment fans join the east root, west seep and pillar to the existing floor. Four narrower saturated trails follow root/repair runoff and bend around the actual narrowing at y16. Twenty-four masks reuse the packed deposit texture; no new water contacts or movement modifiers.
- A broad, chipped lime-render repair interrupts the narrow east approach wall (x3, y16.4–19.7), with two exposed-brick windows and two descending seep marks. It adds 1,580 shell triangles plus 320 seep triangles. Existing materials, lighting and shaders are reused.
- Initial repair placement beyond the wide gallery's y16 boundary was corrected before acceptance. A short seep extended 2.9cm below the floor; raised its center 5cm. Both issues were found during verification, not waived.
- Floor shaders are unchanged. No new textures, lights, colliders, UI, checkpoints or gameplay code. Preserve E/Q, movement and current pursuit/water behavior.

## Evidence collected

- `tools/verify-under-green-gallery-render-geometry.mjs --output=output/under-green/visual-pass100/geometry`: six closed shells, five open plaster windows with solid brick backing. Every vertex of the new repair is ray-tested against the actual floorLayout walls. Passed.
- `tools/verify-under-green-gallery-sediment.cjs --output=output/under-green/visual-pass100/final-hardware`: 55 views; 2560x1600, 1280x720, 390x844 and 844x390; six flood times; 2,688 camera poses; 15 exterior sentinel probes; pause/reduced motion, crouch/rear and exact camera-return pixels. Passed, no page/console errors.
- Changed deposit bytes: 6,571, confined to the gallery; sand and footwear masks unchanged. Geometry outside authored wall-finishing bounds retains its exact fingerprint. Pump/keeper control pictures remain byte-identical. Paired player state, lights, texture counts and render dimensions match. Native program counts match; software compiles two extra existing-lighting variants as the static batch bounds change.
- Native approach/repair: unchanged draw count and +1,900 visible triangles. Crossing: +2 draws/+6,372 triangles because the extended finish changes the existing batch's culling extent. This cost is included in the pending budget comparison.
- Installed standard gameplay client, 12 bursts: terminal0, ready/playing, (0,13.192), checkpoint0, no error artifacts; final screenshot inspected. The initial 5-second Preparing-button click timed out, then menu inputs recovered. The client loaded before the final 5cm seep-only correction; final renderer checks include that correction.
- Inspected native approach/floor/repair/crossing/west apron, flood60 and compact/ordinary captures. Preserve this local improvement; broad scene craft and material pixel-cluster consistency still need work.

## Software verification and timing

- Final software suite: terminal0, 55 views, 2,688 camera poses, 15 opacity probes, unchanged unrelated geometry/masks/control pictures, no page/console errors. Actual targets 960x600, 960x540, 390x844 and 844x390. Inspected entrance, repair, flood60 and portrait captures. The first software suite failed an overly strict equal-program-count assertion; the repeated suite explicitly allows the measured two additional compiled lighting variants. No source was changed to hide that cost.
- Native paired GPU-fenced timings (baseline -> current median / p95 milliseconds): entrance25.7 ->25.8 /27.9 ->27.1; repair18.2 ->17.8 /19.5 ->20.0; crossing20.2 ->20.6 /22.0 ->21.9. These are local measurements, not whole-route qualification.
- Software paired GPU-fenced timings (baseline -> current): approach: 211.7->210.7 ms median, 215.6->214.4 ms p95; east-repair: 129.1->153.7 ms median, 133.9->159.8 ms p95; crossing: 194.9->194.3 ms median, 200.9->200.7 ms p95. The close repair is slower; absolute software cost remains unacceptable. A routed-only early opaque-plaster draw-order diagnostic finished with identical paired JPEGs at all three positions, but no meaningful timing benefit: current/early medians212.9/214.7,158.1/156.1,195.5/195.5ms. No runtime draw-order change was retained. Do not repeat this experiment without new evidence. All owned pass100 processes are terminal. Full-route art, matched current Level1, actor animation and whole-level performance are not established by this local pass. Source manifest is recorded in `output/under-green/visual-pass100/final-source-manifest.json`.

Final source hashes rechecked after every retained test. Ground material/shader function body matches the pre-pass source exactly. Removed109superseded preview/intermediate JPEGs (31.7MiB), preserving representative pairs, reports, masks and all final native/software evidence; manifest in `superseded-image-cleanup.json`. No unrelated output removed.

Storage follow-up inpass102:10packed deposit masks archived losslessly as `deposit-evidence.zip`, with verified SHA256 manifest before removing the original `.bin` files. Source, reports and image evidence retained.
