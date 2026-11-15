# Under the Green pass 41 — sluice sediment and material scale

Status: verified progress. The preceding list-only goal turn was no progress; this turn recovered the completed native budget report, inspected final artifacts, completed software timing and recorded the unfinished implementation. V37 is now locally implemented; full 53-item scope and all seven whole-level gates remain open.

## Implementation

- `under-green-gate-scene.js` restores the moving panel's machinery UV density using each material's declared physical span (627 source texels/metre). Original panel vertices and indices are unchanged.
- Ten irregular low sediment deposits sit on the moving lower crossbar, with six more at the floor beside the guide feet. Closed 12-sided, three-ring meshes have rounded slopes and varying outlines. Deposits use the existing dedicated mud albedo and independent wetness map, with local UVs so pigment does not slide during travel.
- One moving and one static merged mesh add 1,152 triangles and two draws. No new image textures or lights. The owned material is disposed with the gate; stationary geometry participates in the scene's physical audits. The gate-travel audit now includes all 380 actual moving sediment vertices, for 2,606 sampled points.
- Existing guide rollers, seals, polished tracks, corroded bases, roof pocket and synchronized lifting cables remain. The new deposits complete the accumulated-muck portion of V37; V02 remains partial for whole-level density/cohesion.

## Final evidence

- Pure geometry verifier: exact original panel geometry, doubled UV scale, 101 travel positions, unchanged cable endpoints, finite normals and manifold closed clumps. Static deposits leave the central travel channel clear and expose more than 40% of their vertices inside the visible wall faces.
- `pass41-visible/{hardware,software}`: 41 views and 41 full gate-travel audits per renderer; no mesh or box contacts. Front/rear, both guide feet, approach, raised/half/closed, actual E release, pause/resume, Q and Reduced Motion. Native 2560x1600; software 960x600 at the same viewport; additional 1280x720, 390x844 and 844x390 views. Zero page/console errors. Final native left-guide and software right-guide close views explicitly inspected in this continuation.
- `pass41-visible-clearance`: 1,379 dry-route frames and 106 actor/tool mesh audits; no intersections. This is dry-route geometry evidence, not full wet-chase or full-level release acceptance.
- Installed client `pass41-visible-client`: five iterations, final shot-4 and state-4 inspected. Ready/playing at (0, 8.84), normal gallery gameplay. Initial five-second preparing-button timeout recovered through subsequent actions; startup screen alone was not accepted as gameplay evidence.
- Native final budget was already terminal on recovery (no live verifier process, complete passed report); it was not restarted. Software job 55818 completed successfully. Each budget alternates 24 GPU-fenced samples after six warm frames per view.

| Renderer/view | Before median / P95 ms | After median / P95 ms |
|---|---:|---:|
| Native gate, 2560x1600 | 15.0 / 16.8 | 18.3 / 22.4 |
| Native guide, 2560x1600 | 10.3 / 11.7 | 12.7 / 15.8 |
| Software gate, 960x600 | 269.9 / 325.8 | 255.3 / 322.4 |
| Software guide, 960x600 | 114.3 / 124.7 | 115.4 / 128.7 |

Final resource samples: gate 428→430 draws, 347,810→348,962 triangles; guide 173→175 draws, 282,942→284,094 triangles. Texture count 59 and program count 132 unchanged. These small local runs do not prove whole-level performance; native regression is recorded, and absolute software time is unacceptable. No 60fps or cost-free claim.

## Corrections and artifact ownership

Initial deposits were buried at the old guide base centers and one crossed the central travel channel. Final deposits sit on the floor, shifted inward and outside that channel. An initial right-camera fixture was on invalid floor and was corrected. World-space staining was removed from moving mud to avoid texture swimming. Earlier `pass41-final`, `pass41-selected`, `pass41-budget`, `pass41-clearance` and `pass41-client` are intermediate; authoritative evidence uses `pass41-visible*`.

During this pass C: filled. Only this task's generated `output/under-green/visual-upgrade-local` directory was moved to `D:/CodexArtifacts/project-rough-cut/under-green-visual-upgrade-local`, with the original logical path recreated as a junction. All 815 files / 911,961,691 bytes were SHA-256 verified, with manifest at `D:/CodexArtifacts/project-rough-cut/under-green-relocation-manifest.json`. Existing evidence and the separate I: junction were preserved. No broad cleanup or unrelated file deletion.

No changes to controls, movement, pursuit, checkpoints, banners, navigation footprint or hazard simulation. Ledger: 27 implemented / 25 in progress / 1 pending, all seven release gates pending. Next: whole-network pipe connections, repairs, insulation and leak treatment (V38), while retaining remaining environment/material/route and full Level 1 acceptance requirements.
