# Level 1 floodlight construction and haze — partial visual upgrade

The preceding list-only turn was no implementation progress. Revalidated current source and the terminal baseline fixture report, then continued the previously started floodlight craft. Full V01–V21/24-point scope stays active.

## Implementation and visual findings

The baseline fixture was a pole, beveled box and blank emitting face. `course-floodlight-craft.js` builds a slightly downward-tilted head with reflector cells, narrow bezel, rain hood, rear cooling fins, yoke/pivots, rear conduit, secured cable, closed junction box and bolted base. Static parts use the existing surface/chunk batches. Four lens materials remain independent and preserve the original material shader callbacks before adding the reflector pattern. No new scene lights or imported textures.

The inspected first candidate also exposed the existing five-step light haze as a solid-looking cone. `course-light-haze.js` supplies a128x128 clustered mask with mean alpha.07582 and reduced material opacity.075 (formerly.15). Pixel effects retain one instanced shaft batch and the same limits. Per-instance alpha now fades over8.5–12m, near the player over.55–1.5m, and through circuit power.2–.5. The shaft reaches beneath the lamp head; its lower edge dissipates before the ground. The underlying physical light positions/intensity and ground shading are unchanged.

The visible result is a more readable fixture silhouette and a much quieter beam. Front, rear, side and base still follow the intentionally low ambient lighting; hidden faces remain dark. The mask is a camera-facing approximation, not volumetric scattering. Wider light/shadow composition and the remaining atmospheric systems still need the full audit.

## Verification

- Pure haze test checks bounded deterministic masks, sparse coverage, monotonic/continuous visibility and power fades, and off/near/far endpoints.
- Focused native browser checks2560x1600 (actual scene2492x1402),1280x720,390x844; front/head/side/rear/base, dim/off/restored and distance views. Real D movement from(18,217) to(25.772,215.866), Escape pause/resume and reduced-motion fixture anchoring pass.
- All48 component meshes total1102triangles before the caller's beveled-base substitution. Every sampled vertex below2.4m remains within the original.48m-square base footprint. Head normal points downward. Counts are construction checks, not visual acceptance.
- Twenty camera changes keep warmed geometry/texture/program counts stable. Reset disposes each of the four lens geometries/materials exactly once. No runtime or shader errors in the native suite.
- Actual rendered lens luminance in the native outage regression is209.61 on,115.54 dim,0 off,209.61 restored. Independent circuits, pool/source/haze tint, same-timestamp failure changes, paused state and no new shaders during power changes pass.
- Source retains28 path lanterns and ambient.005. The four floodlights remain separate from those path lanterns.

Artifacts: `output/level-one-floodlight-craft/`. Baseline routes saved pre-change `pixel-world-props.js` and `pixel-effects.js`; other modules come from the current worktree. Focused fixtures use test-only deterministic setup. Gameplay startup is checked separately by the installed skill client.

## Renderer and cost receipt

Final software craft suite passes the same geometry, movement, pause/reduced, fade and exact-once rebuild checks with no errors. Its ordinary desktop screenshot was inspected. Both renderers show the more detailed fixture and unobtrusive haze. Software outage regression also passes: rendered luminance221.36/138.96/0/221.36 for on/dim/off/restored.

Native warmed memory changes from972 to976 geometries, textures remain103, compiled programs81 to83. Matched views add2–5 draws and roughly3240–10258 submitted triangles depending on view/shadows. Software warmed resources are716geometries/104textures/92programs. The larger haze mask replaces the existing mask, adding48KiB of RGBA texels without mipmaps; no new texture object or light. All counts stabilize over the camera-change fixture.

Serial paired timing runs use24 samples after10 warm frames, CPU submission through GPU-fence completion, and fixed960x540 software resolution. Native scene2492x1402: near median13.2→11.4ms, p95 15.2→14.3; farther median11.6→9.7, p95 12.9→12.4. Software: near94.8→92.0ms, p95 103.1→100.7; farther89.3→89.1, p95 99.5→94.0. These bounded samples show no observed regression; they do not establish a speedup or whole-level frame-rate acceptance. Software performance remains substantially below the desired play budget.

Eight final source/test SHA256 hashes are saved in `source-hashes.json`.

## Normal startup receipt

Installed `web_game_playwright_client.js` ran8iterations with actual Enter/arrow bursts and exited0. Final `shot-7.png` and `state-7.json` inspected: first_hole, ready, baked terrain, playerx13/progress24/travel34, no error artifacts. This client uses SwiftShader and adapted to640x360; average57.68ms/p9565.40ms. It establishes real startup/input evidence, not high-resolution or whole-level performance acceptance. Native fixture captures provide the high-resolution visual evidence.

All owned browser/test jobs are terminal. Server4187 remains available; no agents, commits or deployment. Next work is a current-state audit of the broader V01–V21 implementations and remaining composition/material/contact gaps. Older opening, water and player-craft QA files are useful pointers but are not current blanket acceptance.

## Remaining scope

V08/V10/V16 are partial. Full material density, compositions, vegetation, architecture, contact, characters, machinery, water, environmental story, UI/moments and extended-play/performance gates remain open. The renderer and test statistics are evidence for this change only.
