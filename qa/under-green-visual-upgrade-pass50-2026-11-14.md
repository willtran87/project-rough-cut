# Under the Green pass 50 — authored practical-light composition

Previous goal turn: progress, completing the root-entry work and its verification. This pass implements district lighting direction and verifies its effects on materials, water and threats. Full 53-item scope and all seven whole-level release gates remain intact.

## Changes

- Added 17 named fixture profiles tied to authored locations rather than array-index color selection. Warm light reveals entrance bark, bunker strata, pump machinery and the keeper workplace. Cooler desaturated service lights mark the crossing, deep gallery, return passages and range. Individual power varies from 0.6 to 1.08; the keeper desk retains its original 0.6 power.
- Practical sources, visible glass and additive glow now share the same authored color. Lamp power also scales visible glass/glow, local humidity tint and the existing Joe shadow opacity. Previously the desk source used 0.6 power while its visible lens/glow and humidity contribution ignored that value.
- All 17 source positions, heights, 13m ranges and independent flicker clocks are unchanged. No extra lights, textures, geometry, shader variants, render passes, global exposure lift, camera-fill adjustment or gameplay changes.
- The profile helper rejects unknown fixture IDs at construction. Tests prove all 17 IDs are present exactly once in the actual scene.

## Evidence

Artifacts: `output/under-green/visual-upgrade-local/`.

- `pass50-direction/{hardware,software}`: 33 views each, including 12 matched before/after route compositions, six responsive views, flood, Q and Reduced Motion. Native 2560x1600, ordinary 1280x720 and phone 390x844/844x390 tested. Software desktop scene is 960x600 or 960x540, not native 2560x1600 detail.
- Nine source/lens/glow audits per renderer check all 17 actual instances at independent clock samples, pause and Reduced Motion. Color and intensity agreement errors below 1e-6; Reduced Motion stays at 0.72. Exact image equality after a camera-turn sequence demonstrates stable lighting at that fixture. Matched player state, source positions/ranges/clocks, draws, triangles, textures and program counts are unchanged in all 12 paired views.
- `pass50-dark/{hardware,software}`: 96 captures and 380 attack animation frames per renderer. All eight crossings have 29 applicable low/warning/surge/receding fixtures, with actual signal material references checked on both banks. Five districts cover full windup/cut/recovery sequences and critical poses. Maximum native blade-position error 1.47e-14m, hand error 9.52e-8m and foot error 1.38e-7m. Zero page/console errors.
- Low-light times are selected by actual lamp power/distance attenuation over 240 seconds. This remains a useful candidate heuristic, not an exhaustive final-pixel luminance minimum; color, normals, fill and occlusion are not part of the search objective. The attack sequences are controlled visual fixtures, not autonomous pursuit playthroughs.
- The 17-clock pure flicker audit rerun passes 240 seconds at 120Hz: bounded levels, maximum per-frame step below 0.008068 and steady Reduced Motion. Clock formulas are unchanged.
- Inspected native before/after gallery, deep gallery, range, bunker, pump and keeper-workplace compositions; native gallery/range cut and keeper preparation; software portrait crossing, bunker cut and spillway surge. Route edges, material differences and the blade remain legible in these reviewed dark views. Broader whole-level display/accessibility and Level 1 parity are not inferred.
- `pass50-client`: seven installed-client bursts, final gameplay at (0,13.064), shot6/state6 inspected. Initial five-second Preparing-button timeout recovered through subsequent input; process exited 0 and produced no error artifacts. No full human playthrough claimed.

The initial lighting-audit harness failed to inject its source probe into a saved CRLF file. Normalizing line endings in the tool route fixed the instrumentation; both completed final reports use that correction. No runtime defect was inferred from this test failure.

## Acceptance boundary

V28 is locally implemented: authored practical-light roles, warm focal areas, cold service intervals and legible material edges without raising global fill. Existing local V30-V34 behavior is retained with the new light power/color agreement. V11 route composition and V52 illustration/gameplay cohesion still need broader work; all remaining material, water, architecture, storytelling, camera and release-gate requirements remain open.

No collision geometry or simulation behavior changed, so the existing pass49 clearance evidence is retained rather than rerunning unrelated mesh audits. Resource-count parity is not a performance acceptance claim. Software rendering remains unqualified.


## Measured local cost

Six warm frames and 24 alternating GPU-fenced samples per fixture, native then software after other owned render jobs finished. Native scene 2560x1600; software scene 960x600. This measures completed fixture rendering, not ordinary-input FPS or startup.

| Renderer / view | Before median / P95 ms | After median / P95 ms |
|---|---:|---:|
| hardware / gallery | 15.5 / 16.7 | 14.8 / 16.7 |
| hardware / pump | 8.3 / 10.9 | 8.7 / 10.5 |
| hardware / range | 14.1 / 15.9 | 14.1 / 15.6 |
| hardware / keeper | 9.2 / 10.7 | 9.3 / 11.2 |
| software / gallery | 183.0 / 211.4 | 181.6 / 402.8 |
| software / pump | 124.5 / 130.5 | 127.6 / 131.2 |
| software / range | 194.8 / 329.8 | 194.5 / 270.6 |
| software / keeper | 112.1 / 135.6 | 113.9 / 135.4 |

All four paired budget views preserve draw/triangle/map/program counts and resolution. Timings are mixed, with small median changes; no general speedup or no-regression claim. Software remains far outside the required playable budget. Unchanged resource counts do not qualify performance.

All owned pass50 jobs are terminal. Initial probe failure90275 was corrected; successful direction15922/22799, low-light53853/71501, installedclient48058 and budget16329/32026 completed. Server4187 is retained. Browser temporary files were directed to the D-drive artifact store because C was low on free space; no user files or historical artifacts were deleted.

Final runtime/harness hashes match the snapshot made during verification and are retained in pass50-source/final-hashes.json. The native gallery was additionally inspected at original2560x1600 image resolution. Ledger31implemented/21in_progress/1pending, allseven release gatespending. No agents, commit or deployment.

The software gallery P95 rises from211.4ms to402.8ms in this run, despite its median falling slightly. This substantial tail regression is retained as unresolved evidence; it must not be described as a uniformly stable-cost change. The range tail moves in the opposite direction. These short samples do not establish the cause or sustained pacing, and the software performance gate stays open.
