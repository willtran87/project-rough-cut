# Back Nine: irregular flooded-turf margins

Partial BV12 progress. The former opaque sheet ended in a conspicuous circular seam. Flood water now retains its opaque submerged-turf core and fades through an irregular translucent margin, exposing the dry grass/path underneath. The margin uses the existing world-attached basin variation, so it stays fixed during camera movement. Actual gameplay captures show the hard ring replaced with a gradual wet-to-dry transition.

`web/back-nine-flood-shore.js` supplies the shoreline shader and a CPU coverage counterpart. `back-nine-irrigation-art.js` uses transparency with depth testing and no depth writes; the underlying dry-turf discard radius is reduced to 0.62 of the physical flood radius. This remains inside the fully opaque core with a safety margin. Geometry, flood timing, collision, sprinkler motion and water extent are unchanged. The HTML import map versions the changed module and its new dependency. Each zone still uses one sheet and one material shared by all three zones, with no extra texture or draw.

## Verification

- `node tools/verify-back-nine-flood-shore.mjs`: 101,101 opacity samples verify continuous monotonic fading, irregular margins, opaque coverage over discarded ground, and zero opacity at/outside the real boundary. All 5,198 sheet vertices remain on shared terrain. Dry-state restoration and disposal pass.
- `node tools/verify-back-nine-irrigation-art.mjs`: trajectories, impact bounds, normal/boosted pressure, culling/mask restoration, pause, reduced motion, dry restoration, retry and resource disposal pass.
- `tools/verify-back-nine-flood-shore.cjs` captured three wet/dry zones, normal/rotated/boosted heads, pause, reduced motion and responsive views. Baseline/current native and software reports all pass with no page/console errors. Viewports: 2560x1600, 1280x720, 390x844. Actual current native main buffer: 2560x1440. Images inspected, including the other two zones and phone view.
- Twelve matched native views retain identical draw, triangle, shader and texture counts (31 programs, 53 textures). Two of three dry images are byte-identical; no claim that every dry capture is pixel-identical. See `resource-comparison.json`.
- Installed skill client, via `tools/verify-presented-client.mjs`, used real forward input for two 60-frame bursts with the irrigation fixture. Current native, current software and baseline software all end at exactly (-12, 234.9955556), 11.8m/s, wet surface, 100 health, still driving; no error artifacts. Final screenshots/state inspected. Native retains 2560x1440; current software uses 800x450, baseline software 640x360. These adaptive-resolution differences do not prove a speed improvement.
- Fixed 960x540 software profile: 24 post-warmup fenced draws of the same boosted flood view. Baseline median/p95 80.6/107ms; current 85.3/108ms. Extra translucent margin work has a measured median cost in this sample (~5.8%). This is a single static-view measurement, not sustained gameplay or whole-level performance acceptance.

Evidence: `output/back-nine-visual-upgrade/flood-shore/`. `--before` routes the saved baseline irrigation source; `--flood-shore-baseline` provides the equivalent installed-client comparison. Source snapshots and SHA-256 manifest accompany the evidence.

## Remaining scope

BV12 remains in progress: broader water/contact presentation and lighting acceptance remain. Physical wetness is still circular and switches with the authoritative sprinkler state; this is shoreline art, not fluid simulation. BV48 remains open because software rendering still loses considerable detail and fails a sustained high-fidelity frame budget. Terrain/bunker joins, varied rough/dead turf, purposeful maintenance compositions, static grounding and actor craft remain in the full 48-item objective. This pass does not establish whole-level parity with Level 1.
