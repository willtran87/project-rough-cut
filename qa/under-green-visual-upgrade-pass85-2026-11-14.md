# Pass85 — software shading cost experiments

Scope: performance gate of the full visual upgrade. Previous turn completed the flood finish and its verification. This turn investigates the remaining software render cost without reducing resolution, textures, lighting, geometry detail or gameplay scope.

## Rejected: full opaque depth pass

`tools/probe-under-green-depth-pass.cjs` routes an experimental scene into an isolated browser. Eligible opaque draws first populate depth using the original vertex shader and no color writes. The normal scene then renders against this depth. Transparent, alpha-tested, double-sided and special-depth materials are excluded.

Software at actual 960x600, four warm pairs and sixteen alternating samples per state:

| View | Baseline median ms | Candidate median ms | Canvas PNG equality |
|---|---:|---:|---|
| Gallery | 216.1 | 258.4 | Exact |
| Crossing | 190.6 | 228.4 | Exact |
| Keeper | 97.4 | 111.5 | Exact |
| Flood | 216.7 | 264.9 | Exact |

Rejected: the extra geometry pass costs more than the shading it saves. No runtime depth pass was added. Candidate gallery image inspected. Evidence: `output/under-green/visual-pass85/depth-software/report.json` and paired PNGs. Process reached terminal success.

## Rejected: per-fragment practical-light range guard

`tools/probe-under-green-light-range-guard.cjs` routes a shader branch before practical-light evaluation. Squared fragment-to-light distance is checked against the light's squared cutoff; only pixels within reach evaluate attenuation and the material response.

Software at actual 960x600, six warm pairs and twenty-four alternating samples per state:

| View | Baseline median ms | Candidate median ms | Canvas PNG equality |
|---|---:|---:|---|
| Gallery | 256.6 | 270.1 | Exact |
| Crossing | 170.6 | 181.3 | Exact |
| Keeper | 86.7 | 94.1 | Different |
| Flood | 186.6 | 197.3 | Exact |

Rejected: every measured median worsens, and the keeper image is not byte-identical. Keeper candidate inspected; the mismatch is not qualified as acceptable because the timing result already rejects the experiment. No runtime shader branch was added. Evidence: `output/under-green/visual-pass85/range-guard/software/report.json`. Process reached terminal success.

These local measurements are not release acceptance. Full software performance, matched Level 1 and the other whole-level gates remain open.

## Rejected: split every static batch by lamp coverage

`tools/probe-under-green-light-groups.cjs` partitions each existing spatial/material batch into groups whose original parts have the same conservative lamp-reach set. It retains every geometry attribute and lighting equation. This is routed source only.

Software at actual 960x600, six warm pairs and twenty-four alternating samples:

| View | Baseline median ms | Candidate median ms | Draws before / after |
|---|---:|---:|---:|
| Gallery | 213.4 | 233.0 | 665 / 1389 |
| Crossing | 246.3 | 242.9 | 515 / 1108 |
| Keeper | 134.2 | 128.9 | 107 / 154 |
| Flood | 297.6 | 310.8 | 684 / 1399 |

Average static sources decrease from 3.5905 to 2.9751, but gallery draw calls more than double. Triangle counts remain identical. Gallery/crossing canvas PNGs are identical. Keeper has one changed RGB pixel (maximum 13/255), flood one changed RGB pixel (maximum 10/255), at draw-order boundaries. Rejected because savings are inconsistent and the expensive gallery views regress. Evidence: `output/under-green/visual-pass85/light-groups/software/report.json` and raw canvas PNGs. Process reached terminal success. The next experiment restricts partitioning to broad opaque surfaces to avoid splitting fine root/prop batches.

## Selected implementation — combine compatible broad surfaces

A further experiment restricted light-set grouping to broad opaque materials. Keeping the old spatial cells still added roughly 300 gallery draws and gave only mixed tail results. The final implementation combines compatible broad-surface groups across those cells. Fine roots, metal hardware, moving objects and transparent effects retain their existing grouping. The practical-light binder independently checks the original part bounds for every omitted light. Native uses the original batches.

Runtime: new `web/under-green-light-groups.js`, called only on the software path in `web/under-green-scene.js`. All original parts are passed through exactly once; geometry attributes, texture detail, lighting equations and resolution remain. No per-pixel range branch or depth prepass is retained.

Final software moving-camera benchmark at actual 960x600, six warm pairs and 24 alternating GPU-fenced samples per view:

| View | Median before → after ms | P95 before → after ms | Draws before → after |
|---|---:|---:|---:|
| gallery | 302.5 → 280.9 | 397.1 → 370.2 | 658 → 797 |
| crossing | 274.8 → 259.1 | 312.3 → 323.1 | 527 → 646 |
| keeper | 140.0 → 129.6 | 168.3 → 149.0 | 108 → 121 |

All three medians improve by about 6–7%; gallery and keeper P95 improve, while crossing P95 regresses. This is a local measured reduction, not acceptable absolute software performance or whole-route frame-pacing acceptance. Programs increase from 213 to 227, with unchanged textures and submitted triangles. Startup and full memory costs remain unqualified.

Pure grouping checks pass eight cases: same-material cross-cell consolidation, conservative grazing-light margin, different-material separation, fine-detail batch identity, exact-once part retention, unchanged vertex bytes, unchanged input arrays and no-light surfaces. Source: `tools/verify-under-green-light-groups.mjs`.

The first full visual verifier attempts failed on a stale baseline assumption: they checked omitted lamps against a merged bounding box even though the current baseline already uses original part bounds. Both attempts reached terminal failure. Capturing those existing part bounds for both versions corrected the verifier; no runtime change was made in response. Final verification follows below.

## Final verification

- `tools/verify-under-green-surface-light-groups.cjs` passes on native and software, 31 paired states each, all raw framebuffer hashes identical. No page or console errors. Includes seven district/control views, six pressure/flicker times, three flood phases, actual E pump operation, release travel, Q/crouch, reduced motion and 2560x1600/1280x720/390x844/844x390 layouts. Actual large rendering is native2560x1600, software960x600.
- Geometry signatures preserve every original static triangle and its position/normal/UV/custom attributes: 377,670 native, 302,938 software. Part-bound checks contain 358,931 native / 316,932 software vertices across 7,668 / 7,635 original parts. Every omitted lamp lies outside the applicable original bounds.
- Disposal restores original materials and releases all 436 native / 732 software owned variants; no binding remains.
- Installed gameplay client completes twelve bursts, ready/playing at (0,15.24), elapsed3.0667, checkpoint0, no error artifact. Initial Preparing click timeout recovered through the action sequence. Final gameplay screenshot inspected.
- Native gallery and portrait pump, software flood and landscape pump, and installed-client gameplay were visually inspected. Pure grouping tests and syntax/whitespace checks pass.
- Both rejected shader experiments and all-batch grouping remain tool-only, based on frozen pre-pass source snapshots. Runtime contains only broad-surface grouping on the software path. Final runtime source snapshots and SHA256 hashes are recorded in `output/under-green/visual-pass85/final-source-manifest.json`.

No whole-level gate or art requirement is promoted. The complete53requirements/48refinements remain active. This pass preserves art while modestly reducing measured software shading cost; it does not complete performance, startup/memory qualification, matched Level1 or whole-route visual acceptance.
