# Level 1 dropped paperwork — 2026-11-14

Seven existing loose-paper clues now use the Field Log and Release Review designs from their associated stations. Two unfinished pencil checks, a handled fold, sparse marks and a connected ground-edge stain suggest interrupted work. The original positions, rotations and folded top silhouette remain. The paper has a thin closed underside and uses actual scene lighting, with no emissive fill or additional source.

## Implementation

- `web/course-dropped-paper.js`: one 512×320 nearest-filtered atlas, one opaque Lambert material, one mesh. Integer-pixel station typography is reused. There is no per-frame texture upload.
- `web/environment-guidance.js`: pixel-volume opt-in separates the seven sheets from the original BasicMaterial guidance batch. Other guidance and the legacy default retain their behavior.
- `web/scene-3d.js` and `web/index.html`: opt-in and import version. No game logic, AI, collision, route, lantern placement or light settings change.
- Original forms used 357 triangles, including raised ink bars; the closed printed forms use 112. Whole-view submissions are one draw higher and 245 triangles lower in every matched view. One geometry and one texture are added; warmed shader-program counts match the baseline.

## Evidence

Artifacts: `output/level-one-dropped-paper/`.

- `tools/test-course-dropped-paper.mjs`: 16 rotated placements / 256 triangles verify closed manifold edges, outward winding, nonzero triangle area, positive enclosed volume, original authored footprint/heights and UV containment.
- `tools/verify-course-dropped-paper.cjs`: 16 views per renderer before and after. All seven sheets, two longer approaches, three locations at 1280×720 and 390×844, and actual walking. High-resolution viewport 2560×1600; native scene 2492×1402, ordinary scene 1193×671 and portrait 379×833. Software fixture deliberately fixes landscape resolution to 800×450; portrait is 405×890. These software captures do not establish high-resolution software quality.
- Matched inventories prove world objects, obstacles, six stone covers, hedge geometry/occluders, lights and all 28 path lanterns unchanged. All seven paper anchors and all 32 paired player poses match.
- All 16 software current and 16 software baseline full-geometry/reference-restoration comparisons are pixel-exact. The native camera search restores native mesh visibility separately because native batches do not contain software packed-index metadata.
- Movement and pause/resume pass. Warm resources remain bounded over the checked frames: native 1018 geometries / 116 textures / 109 programs; software 743 / 116 / 120. Rebuilding disposes the new geometry, material and texture exactly once, then creates one paper mesh. No browser errors.
- Installed gameplay client: `tools/verify-presented-client.mjs --level-one --dropped-paper --high-resolution`, with and without `--native-renderer`, runs the installed skill client with its action payload and presentation fence. Both two-burst runs finish normally. Player goes from x−35/progress352 to x−34/progress350, with positive clearance. Final screenshots and states inspected. Native remains 2492×1402; adaptive software changes from 960×540 to 800×450.

The first fixed-north screenshot fixture hid sheets behind structures after its legal-position adjustment. It was replaced with saved legal standing viewpoints and geometry rays to the paper centers. No scenery or paper anchors were moved to obtain the images. An initial native reference call also failed because software-only index data was absent; the verifier now handles native visibility separately. Final native/software runs complete successfully.

## Visual assessment and limits

The lit crossing and release-station sheets now read as printed documents instead of flat polygon shapes. They retain the physical fold and take on the local warm or cool light. The service-maze copies are deliberately much darker, consistent with their surroundings; their small print is not expected to be readable at approach distance. Some paperwork sits partly beneath existing furniture, as it did before.

The review also exposes the adjacent flat, unlit scuff geometry. That needs a separate ground/material integration pass. Full environmental storytelling, objective aftermath, opening/reveal composition, software performance and whole-route artistic acceptance remain open. This is local progress on V01/V08/V09/V18/V19, not completion of the 35-item / V01–V21 goal.

## Timing

All timing processes finished normally. Medians of three blocks, in milliseconds:

| Renderer/method | Lit forms before → after | Dark forms before → after | Opening before → after |
|---|---|---|---|
| Native, separate loads | 8.5 → 7.9 | 6.0 → 7.0 | 9.0 → 11.3 |
| Software, separate loads | 90.7 → 68.6 | 98.9 → 62.9 | 142.7 → 95.8 |
| Native, same-world alternation | 15.1 → 15.0 | 16.1 → 15.5 | 18.8 → 19.2 |
| Software, same-world alternation | 41.1 → 38.3 | 49.5 → 54.5 | 101.5 → 101.0 |

`tools/profile-course-dropped-paper.cjs` builds the original guidance from the saved baseline alongside the current guidance, then switches visibility in before/after/after/before/before/after order. All other scene geometry, camera and source state stay fixed. Each block renders24frames, discards12warmups and includes full RGBA readback after gl.finish. The current cached moon-shadow map is shared. This measures isolated rendering, not gameplay FPS. The sequential test includes the ordinary scene update/presentation path and a one-pixel readback; the two methods are not interchangeable.

There are mixed changes and some large individual block outliers. The dark software view is slower in the aggregate. Retain the visible artwork improvement, with no speed or performance-neutrality claim; V21 and software fidelity remain open. Timing JSON and `timing-summary.json` retain the full evidence. All owned verification/client/profile processes are terminal. Nine pass-related source/tool snapshots and SHA256 hashes are saved under `verified-source/` and match the current files.
