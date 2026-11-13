# Under the Green visual upgrade - pass 21

V44 (scythe silhouette and surface detail) is locally implemented. The full objective remains all 53 requirements and seven release gates. This pass does not claim Joe's clothing/dampness, attack-weight sequencing, contact effects or ghost dissolution are finished.

## Final weapon

Replaced the shared noisy environment materials with editable, code-authored pixel masters: 256x1024 worn timber, 1024x512 forged steel, a separate steel specular mask, and 128x256 dark wrapped grips. Grain follows physical shaft length, including continuity across its sections. Quiet metal fields have sparse forging scratches and socket oxidation; the first more regularly striped treatment was rejected after screenshot inspection.

The blade now has a 49-vertex curved silhouette, rounded inward from the shared coarse outline with a retained sharp tip. A 2 mm edge is beveled into the 18 mm spine, including the underside and closed perimeter. The old white edge cylinders are gone. Fitted socket bands and peened rivets provide close detail. All five materials are non-emissive; metal catches the existing practical lights. No new light, collision range or hand-grip location was introduced.

Five merged rigid material meshes replace 13 weapon meshes. The ghost's existing walking-pose bake consumes the same revised geometry and retains its one draw. The owned scythe material/texture resources dispose with the actor. No changes to pursuit, controls, timing, checkpoints or event banners.

## Authoritative verification

- `tools/verify-under-green-scythe-finish.cjs --output=output/under-green/visual-upgrade/pass21-final/hardware`: PASS, 21 before/after views. Actual native 2560x1600, plus 1280x720, 390x844 and 844x390. Front, side, rear, close, windup, mid-cut and follow-through; paused actor stability and a natural scheduled ghost also verified. Zero console/page errors.
- Same command with `--software` and `pass21-final/software`: PASS, 15 views, actual 960x600 rendering at the 2560x1600 viewport. Zero console/page errors. This is software compatibility evidence, not native sharpness or frame-time acceptance.
- Each final art run exercises 449 authored windup/sweep/recovery samples at 30/60/120 Hz. Maximum staged hand error 9.22e-8 m, foot error 1.38e-7 m. These validate the weapon refit, not a new attack animation or perceived weight improvement.
- `node tools/verify-under-green-moving-clearance.cjs --dry --output=output/under-green/visual-upgrade/pass21-final-clearance`: PASS, 1,379 replayed route frames, 106 actual actor/weapon mesh audits, no intersections, maximum foot error 2.42e-7 m. A simulation-driven rendered replay, not a human playthrough.
- `node tools/verify-under-green-scythes.mjs`: PASS, shared blade within hit capsule and camera comfort bounds.
- Installed develop-web-game client: PASS, five screenshot/state pairs, no error artifact. Final shot/state 4 inspected: intro finished, playing at (0,16.52), actual 960x540, final scythe metadata present. `output/under-green/visual-upgrade/pass21-client/`.

The final hardware follow-through, front/mobile, close, windup/mid-cut, ghost and software front views were visually inspected across the refinement. Final curved follow-through is in pass21-final; earlier pass21-scythe and pass21-scythe-accepted directories document superseded intermediate silhouettes and are not final acceptance evidence.

## Costs and scope

Matched front-view counters: 146 to 138 scene draws; 170,232 to 170,704 triangles; 75 to 79 resident texture objects; 131 programs unchanged; both 2560x1600. Other matched views also reduce eight draws. Four owned maps add about 6.83 MiB of estimated RGBA8-plus-mipmap storage. These are allocation/count measurements, not an isolated timing or startup benchmark. Full-level performance and memory gates remain open.

V02/V03/V05/V06 have more local weapon evidence but retain their broader unfinished scope. V42/V43/V45/V46/V47 remain pending. Ledger: 15 implemented, 30 in progress, 8 pending, all seven release gates open. Next: Joe's character materials and local dirt/wetness, ghost internal shading/dissolution, then the remaining environment and full-level comparison/profiling work.

Final production files and visual verifier are snapshotted and SHA-256 recorded in `output/under-green/visual-upgrade/pass21-source/final-hashes.json`. Baseline actor/scythe source is preserved there under original filenames. No generated image service was used for this pass: the editable pixel masters are authored in `web/under-green-scythe-art.js`.
