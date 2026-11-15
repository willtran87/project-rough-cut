# Vehicle craftsmanship follow-up

The golf cart now has curved sheet-metal wheel arches, roof ribs/gutters, inboard mirrors, seat seams and armrests, clearer rear reflectors, hood trim, a maker's badge, a strapped service case and rolled rain cover. Joe's industrial mower has matching rolled fenders with reinforcing strips, patched/riveted engine armor, bonnet cooling slots, hydraulic hose unions, gripped access steps, radiator crossmembers, cage mounting plates, a towing eye and a bent/clamped exhaust outlet.

All additions use the existing pixel surface materials, lighting and material batching. Nothing changes the simulation, steering, ram recovery, alarm rules or navigation. The first hull check caught the towing eye outside the rear collision boundary; it was moved inward before final verification.

## Rendering cost

| Model | Original triangles | Updated triangles | Meshes before/after |
| --- | ---: | ---: | ---: |
| Golf cart, including driver | 4,768 | 5,988 | 17 / 17 |
| Mower, including Joe | 27,150 | 28,654 | 40 / 40 |

Hardware and SwiftShader comparisons across seven close-up/gameplay views show identical draw-call counts before/after, still 16 programs and 34 textures. No lights, audio sources, transparent passes, runtime animations or image assets were added. Preparation remains 14 paced batches, largest 2,094,984 bytes. Validated baked navigation remains active.

A short sequential SwiftShader sample (48 frames per view, 960x540 internal render, 2560x1600 viewport, update/draw plus GPU completion fence) measured:

| View | Median before/after | p95 before/after |
| --- | ---: | ---: |
| Driving | 39.9 / 40.5 ms | 43.9 / 46.6 ms |
| Pursuit | 33.0 / 33.8 ms | 40.5 / 40.8 ms |
| Wet lane | 44.1 / 44.8 ms | 51.7 / 53.6 ms |

Additional geometry has a small measured cost; this is not a performance improvement or proof of identical timing. Software-rendering tail spikes remain. Samples were run sequentially to avoid concurrent graphics load.

## Verification

- `node tools/verify-vehicle-contact-browser.cjs`: six physical contact scenarios pass; all actual rendered vertices remain within unchanged collision hulls, including cart roll/impact pose. Impact feedback, Reduced Motion and resource stability pass; no browser errors.
- `node tools/verify-vehicle-detail.cjs` and `--software`: unchanged mesh/draw/program/texture counts, active navigation bake, seven before/after views and no browser errors. The script requires this pass's baseline snapshot under `output/vehicle-detail/baseline-source/`.
- Close-up cart front/rear, mower front/rear and ordinary driving/pursuit/wet-lane screenshots inspected at 2560x1600. Ordinary 1280x720 and small 844x390 views inspected; HUD and vehicle framing remain intact. Close-up cameras are test-only; gameplay camera is untouched.
- Installed standard gameplay client executed two drive/steer/brake/rear-view bursts. Presented screenshots and state inspected.

Evidence: `output/vehicle-detail/{hardware,software}.json`, before/after screenshots, `standard-client/`, and `output/vehicle-contact/browser.json`.
