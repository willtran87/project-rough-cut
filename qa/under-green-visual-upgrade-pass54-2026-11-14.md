# Under the Green pass 54 — timber and secondary roots

Previous goal turn: progress through six fresh native environment captures and a revised authoritative review. This pass implements the next observed gaps. All 53 original requirements, 48 review refinements and seven whole-level gates remain in scope.

## Changes

- Generic sawn timber now shares the existing 1254-square keeper timber image/texture at four metres per repeat (313.5 source texels/metre), replacing the old 128px procedural grain at two metres. No additional image downloads. The scene owns the shared texture; keeper art borrows it and disposes only its own document/sole textures.
- Grain follows the physical long axis of beams, rails and framing before batching. Cylindrical handles use physical circumference/length UVs. Existing explicitly authored UVs are retained. Bunker shoring now uses sawn timber instead of the living-root bark map.
- All 53 former generic-wood offshoots use the existing root bark, separate wetness and tapered/ridged geometry: 27 hanging ceiling stems, six gallery branches, 12 bunker fans and eight shaft roots/branches. Short roots share the main-root material and spatial batches. The radius compensates for the profile's maximum width; ceiling stem bends remain above 3.7m and the lowest gallery branch vertex is 3.2378m. Their total geometry is 2,544 vertices/3,710 triangles; this is replacement geometry, not the net scene increase.
- No collision, movement, pursuit, flood, interaction, checkpoint or banner logic changed. E/Q and existing camera behavior are retained.

## Verification

- Final paired browser suites: `pass54-verified/hardware` and `pass54-verified/software`, 25 views each. Native target 2560x1600; software desktop target 960x600. Additional viewports 1280x720, 390x844 and 844x390, plus actual crouch/Q and flood fixtures. No page/console errors. Each renderer checks 512 camera poses; all clear.
- 341 named unaffected scene meshes have identical position/index hashes and world matrices before/after. This excludes root/wood/shoring batches whose membership or geometry changes. New roots have finite UVs/normals, vertex shading and preserved bark UVs. The keeper/structure/shoring texture identity is shared as intended.
- `verify-under-green-timber-uv.mjs`: 12 long-axis face checks, cylindrical physical mapping and 28 representative root placements pass. Existing root-geometry verifier passes 138 roots, 15,933 vertices, 32 collars and 1,869 seams.
- `pass54-clearance`: dry-route replay completes; 1,379 sampled frames and 106 rendered actor/scythe geometry checks, no intersections or hand/foot failures. This is not a new exhaustive wet-route/human playthrough.
- Installed develop-web-game client: seven bursts, terminal exit 0, final ready/playing at (0,8.84), final screenshot/state inspected. Initial five-second Preparing-button timeout recovered through later menu input; no error artifact. Evidence: `pass54-client`.
- Inspected native before/after overhead roots, bunker shoring, range wall and final native signal view; software gallery branch and portrait shoring views; final client image. Range wall fixture does not expose the exterior fence clearly, so it is not claimed as direct fence-grain visual acceptance.

An initial native offshoot capture showed an unlit red symbol despite the paired baseline's lit symbol. A fresh direct scene capture and the final paired suites show the red lens correctly; explicit ray visibility and screenshot pixel checks now verify the visible lens. Final native baseline/current pixel matches exactly at [209,93,64,255]. No signal code changed, and the original discrepancy is retained under `pass54-timber-roots`; its cause is not established. Whole-level hazard/motion acceptance remains pending. A first attempt at the pixel probe failed because the raycaster lacked its camera for sprites; the probe was corrected and both final suites pass.

## Remaining scope

V02–V06 and V14 remain partial. This pass improves neighboring material consistency and minor-root craft; it does not establish complete material variation, wet-lighting composition or parity with Level 1. Ledger remains 32 implemented / 20 in_progress / one pending, all seven gates pending. Next priorities: selective wet highlights and dark-value separation, pump/keeper composition, remaining root tangles and broad material variation. Software performance remains a separate unresolved requirement.

## Native rendering cost

Six warm frames and 24 alternating GPU-fenced samples per view, after other owned render jobs ended. Native target 2560x1600. These are controlled fixture-render times, not ordinary-input FPS.

| View | Before median / P95 ms | After median / P95 ms |
|---|---:|---:|
| Gallery | 14.6 / 17.3 | 14.3 / 16.5 |
| Pump | 8.5 / 10.4 | 8.4 / 10.3 |
| Range | 13.4 / 14.5 | 12.8 / 15.3 |
| Keeper | 9.7 / 11.5 | 9.6 / 12.5 |

Medians remain close/slightly lower; range and keeper P95 increase 0.8/1.0ms. No general speedup or regression-free claim. All four fixtures upload one fewer texture; program count increases 144→150. Draw calls fall by one to four. The full 53-root replacement adds 1,270 triangles, while visible triangle changes depend on batching/frustum membership and can exceed this in some inspection views. Evidence: `pass54-budget/hardware/report.json`.

## Software rendering cost and closure

Same warm/sample procedure, software960x600, after native benchmark completed.

| View | Before median / P95 ms | After median / P95 ms |
|---|---:|---:|
| Gallery | 197.8 / 243.1 | 200.0 / 275.7 |
| Pump | 84.8 / 104.3 | 85.4 / 104.7 |
| Range | 211.0 / 258.3 | 212.3 / 256.5 |
| Keeper | 125.2 / 185.4 | 127.2 / 200.6 |

Software medians increase0.6–2.2ms in these fixtures. Absolute frame times remain far beyond a playable budget. This is a bounded local cost measurement, not performance acceptance. Evidence: `pass54-budget/software/report.json`.

All owned jobs terminal: initial suites15545/44107; corrected suites57945/36772; failed probe15590; dry clearance20002; installedclient54889; nativebudget86347; softwarebudget83397. Direct signal probe also ended. Runtime hashes match `pass54-source/verified-runtime-hashes.json`; final hashes retained. Server4187retained. No commit, deployment, deletion, delegation or goal completion.
