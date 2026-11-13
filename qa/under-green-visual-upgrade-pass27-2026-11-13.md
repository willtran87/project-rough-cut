# Under the Green pass 27 — Joe's practical-light shadow

Scope: V30, a moving shadow in selected lit encounters. This is a floor projection in three authored bays, not whole-level wall shadows or full Level 1 visual/performance acceptance. All 53 requirements and seven release gates remain in scope.

## Implementation

- Project the real nine skinned body meshes and five articulated scythe meshes from the actual practical lamp onto open floor receivers at the entrance, spillway landing and bunker bank. Geometry, skeleton and bone data are shared with Joe; there is no second animation or proxy silhouette.
- One black, depth-tested material and an 8-bit stencil union prevent overlapping limbs from multiplying darkness. Receiver margins fade inside the masonry footprint. Opacity follows the existing lamp flicker, distance, spatial fade and a short onset; Reduced Motion uses the existing steady lamp response.
- Eligibility uses the same conservative visibility rule as Joe's unseen movement, plus explicit speed/pace guards and lamp-to-Joe sight clearance. Hidden or fast Joe has no projected shadow. Each new run resets onset exposure. No new gameplay, sound, banner or control behavior.
- No shadow map, render camera, render target, light or sampled texture is added. There are 14 extra draws and 19,762 triangles when active, zero shadow draws when inactive. Two shader variants cover skinned and rigid geometry. The requested stencil attachment has a logical 8 bits per pixel (3.91 MiB at 2560×1600); actual incremental driver allocation may differ because depth/stencil can be packed. Texture counts alone do not establish zero memory cost.

## Verification

- Pure projection/eligibility test: 20,419 floor receiver samples and 2,520 projected positions at 30/60/120 Hz. Receiver samples stay on real floor, outside solid obstacles and channels. Existing unseen-pursuit and 242 attack-acting interruption tests pass.
- Final browser suite adds actual Q key lookback and new-run reset to walking, windup, sweep, recovery, flood, absent/fast/hidden/outside cases, pause and Reduced Motion. Actual source/copy skinned world positions are compared at five vertices per mesh in every active screenshot; maximum error is zero in retained runs. This is a sampled pose check, not an exhaustive vertex proof.
- Final reports both pass: 32 native and 32 software views, with no page/console errors. Native target sizes 2560×1600, 1280×720, 390×844 and 844×390; software desktop targets 960×600 / 960×540 while responsive targets remain 390×844 / 844×390. Final native rear-glance/bunker and software rear-glance captures were visually inspected, along with the earlier native phone and software bright-entrance captures.
- Before/after behind-wall screenshot comparisons verify the shadow makes no pixels visible through the opaque wall. The budget test's deliberately disabled stencil control visibly over-darkens overlapping projected limbs, proving the normal union is effective. Normal shadow adds no brightened pixels and stays within its opacity bound, allowing 8-bit quantization.
- The initial opacity assertion decoded sRGB canvas values before estimating blend alpha. The direct RGBA8 canvas path blends the already encoded output; the corrected verifier measures in that space and requires nonempty samples. Intermediate failed runs are diagnostic, not acceptance evidence.

## Measured local cost

Sequential, isolated render-plus-GPU-fence measurements; six warm pairs then 24 alternating off/on pairs per bay. These include polling/scheduling overhead and are local observations, not universal performance guarantees.

| Renderer / bay | Off median / p95 ms | On median / p95 ms |
|---|---:|---:|
| RTX 3090, 2560×1600 entrance | 11.2 / 12.9 | 12.1 / 16.9 |
| RTX 3090, 2560×1600 spillway | 7.5 / 11.1 | 8.1 / 12.9 |
| RTX 3090, 2560×1600 bunker | 8.9 / 13.7 | 8.9 / 12.1 |
| SwiftShader, 960×600 entrance | 132.9 / 135.1 | 136.9 / 146.0 |
| SwiftShader, 960×600 spillway | 91.9 / 95.1 | 96.1 / 99.1 |
| SwiftShader, 960×600 bunker | 112.0 / 114.0 | 115.2 / 117.2 |

Software absolute frame time remains unacceptable. The full-level performance gate stays open. The selected-bay shadow is bounded and uses the real animation without additional texture storage; it does not solve the larger renderer cost.

## Artifacts

- `output/under-green/visual-upgrade/pass27-final/{hardware,software}/report.json`: final functional/visual receipts.
- `output/under-green/visual-upgrade/pass27-budget-final/{hardware,software}/report.json`: measured cost, stencil control and pixel checks.
- `output/under-green/visual-upgrade/pass27-source/final-hashes.json`: runtime source hashes and final copies.
- `output/under-green/visual-upgrade/pass27-source/final-occlusion.json`: exact before/after RGB equality behind the wall on both renderers.
- Earlier `pass27-refined` captures remain useful comparisons; final receipts take precedence.
- Installed web-game client: `pass27-final-client`, five bursts, terminal exit 0. Final screenshot/state inspected: ready, playing at (0, 8.84), 960×540, no error artifacts; Joe is absent and the projected shadow is correctly inactive. The initial 5-second click timed out while Preparing; later input reached gameplay. This verifies the smoke route, not startup-latency acceptance.
- All owned pass27 jobs are terminal; five recorded runtime source hashes match the verified worktree. Ledger: 22 implemented, 29 in progress, 2 pending; all seven gates remain pending.

Next requirements: dark-value/material separation V34, comfortable vignette/bob V53, all partial environment/material/architecture work, and all seven whole-level gates. No completion claim for the full goal.
