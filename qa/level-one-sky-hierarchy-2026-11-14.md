# Level 1 sky hierarchy — 2026-11-14

Partial V03/V04/V16 progress toward the full 35-item/V01–V21 visual upgrade. The moon and bright blue cloud edges competed with the practical-lit playable scene in opening, service and range views. Level 1's pixel-volume renderer now opts into a restrained sky profile.

## Implementation and appearance

- Sky-dome vertex colours retain full horizon colour below normalized height0.08, smoothly approaching0.55 linear intensity above0.65. This gradient is attached to the dome, independent of camera orientation.
- Moon material colour is multiplied by0.48, cloud colour by0.5. These are linear material factors, not claims of a matching percentage reduction in displayed sRGB brightness.
- Original artwork, pixel sampling, dimensions, silhouettes, parallax positions, cloud opacity/coverage, wind motion and nightfall progression remain. World lights/exposure/fog, 28 symmetric lanterns and Joe are unchanged. This adds no geometry object, texture or draw call by construction; only an attribute on the existing dome.
- `courseSky` defaults false. Only Level1 pixel-volume rendering opts in. Default shared skies are tested against the pre-change module.

Opened and inspected high-resolution opening, service and sky views, software range/phone and both installed-client movement captures. Moon/cloud highlights recede while the horizon still outlines the trees. Large black foreground areas remain a broader composition/readability issue; this local pass does not establish full pixel-art or atmospheric acceptance.

## Verification

`node tools/verify-course-sky-hierarchy.cjs`, with `--before` and `--software` variants, captures12views per run across2560×1600,1280×720 and390×844. Native actual output2492×1402; software fixture uses a fixed0.625 budget. All four runs exit0, without browser errors.

All24matched view pairs have byte-identical isolated physical-world colour buffers, exact world/light/lantern inventories, camera/resolution, draw counts and submitted triangles. A50-frame independent sky fixture checks rotation, cloud motion, pause, reduced motion and nightfall. Default old/current sky pixels match exactly; opt-in sky has lower aggregate brightness and unchanged cloud-coverage/motion values on both renderers.

Movement, pause/resume,12warm-resource turns and scene rebuild pass. Warm textures114/programs109native or120software remain equal. Native geometry resource counts1016before/1017after; software781both; no growth across checked turns. Do not equate renderer allocation counts with newly added scene geometry.

Installed develop-web-game client via `verify-presented-client.mjs --level-one --stone-courses`: two real input bursts perrenderer, first_hole x−2/progress233→x−5/progress237. Native2492×1402/software800×450; page1/state files inspected, no error artifacts. Client sessions88556/23676 and browser sessions41268/59786/75605/88055 all exit0. The first native candidate used an equivalent direct module import; later verifier isolates old/current imports under dedicated test routes.

Evidence: `output/level-one-sky-hierarchy/`, including baseline sources, before/after screenshots/reports, comparison.json and clients. Full scene composition, material/pixel-density acceptance, actor motion and software performance remain open.

## Timing and provenance

Sequential process84646 completed with exit0 after all owned functional/client browsers finished.12warmframes,3groups of12measured frames, including presentation and one-pixel GPU readback; native2492×1402/software800×450. Median of group medians (ms):

| Renderer | View | Before | After |
|---|---|---:|---:|
| native | opening | 7.4 | 8.2 |
| native | service | 8.0 | 8.4 |
| native | sky | 6.8 | 7.5 |
| software | opening | 96.9 | 93.8 |
| software | service | 91.1 | 75.5 |
| software | sky | 111.5 | 87.7 |

Native costs increased0.4–0.8ms in these fixtures. Software measured lower but varied substantially, including a532.9ms baseline tail; these results do not establish a general speedup or acceptable gameplay performance. Software still fails the intended frame-rate bar. Six source files/hashes are preserved in verified-source. Full35-item/V01–V21 goal remains active.
