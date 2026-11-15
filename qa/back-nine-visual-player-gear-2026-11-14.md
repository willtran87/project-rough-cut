# Back Nine player boots and gloves

This is partial BV26 progress toward Level 1 character quality. The full 48-item goal remains active. Face, ears, body finish, cross-material pixel scale and whole-level performance are not accepted by this pass.

## Production change

- New continuous boot upper joins the rounded toe, instep, heel and ankle. Curved soles have shallow tread-side notches; laces, metal eyelets, curved toe seams, rear seams and pull tabs provide actual depth.
- Work gloves use continuous curled fingers, a fitted canvas back, wrist strap, thumb and restrained seams. Rejected the earlier separate knuckle shapes because they looked like beads.
- A shared four-quadrant atlas supplies leather, suede, rubber and canvas. Generated with built-in image_gen. Original: `assets/characters/player/back-nine-work-gear-v1.png`; exact prompt: `assets/characters/player/back-nine-work-gear-v1.prompt.txt`. Requested 2048 square; returned and retained 1254 square. Runtime PNG is byte-identical to the original; no artificial upscale. UVs stay within padded quadrants.
- Gear merges into the existing limb batches: 24 character meshes, 27 with the mounted light, 9 seated meshes. Actual runtime model rises from 16,310 to 22,438 triangles (+6,128), with one additional shared texture and the existing textured Lambert shader. This is not a zero-cost change.
- Terrain gait and ejection share an analytical sole-support envelope. A route test exposed up to 4.074 cm planted clearance when the slope-aligned sole was supported against world-Y. Corrected gait to support against the sampled terrain plane. This retains existing terrain samples and avoids per-frame geometry work.
- Scene loads the atlas alongside the existing cloth/face/hair assets. Owned material, map and preparation geometries have explicit disposal. Six relevant import-map entries use `20261114-player-gear-6`.

## Verification and rejected evidence

Evidence root: `output/back-nine-visual-upgrade/player-gear`.

- `geometry.json`: finite attributes, padded atlas coordinates, outward upper/sole ray hits, 1,040 pitch/roll support samples. Conservative bound gap at most 4.068 mm.
- `rig.json`: 2,184 actual ejection/recovery poses across sides, headings, speeds and reduced motion; lowest boot point 12 mm above flat support. Fifteen defeat poses remain at least 15 mm above support. Duplicate-time updates are stable; physical player data is immutable.
- `grounded-routes/hardware-grounding.json`: all 14 authored routes, 9,917 poses. Lowest actual geometry clearance 8.056 mm; highest planted clearance 12.012 mm. Original failed run retained in `routes`; tolerances were not relaxed.
- `accepted-native` and `accepted-software`: current model, normal chase and close inspection views, moon/beacon/headlight conditions, driver and running, 2560×1600 plus 1280×720 and 390×844. Close cameras inspect craftsmanship; they are not normal gameplay framing.
- Final headlight views are in `headlight-native` and `headlight-software`: the earlier vehicle position left the boots outside the real beam. The corrected fixture aligns the actual vehicle seven metres ahead; production cone/power are unchanged. The comparison audit substitutes these final views.
- `grounded-motion/report.json`: 7,560 actual poses at 15/30/60 Hz, stop/start/reverse/pivot and reduced motion on three terrain locations. Minimum clearance 1.889 mm, maximum planted clearance 14.035 mm, maximum support movement 2.134 mm; no unreachable targets or duplicate-time movement. Mounted light remains aligned; pause/resume and full restart retain checkpoint zero.
- First through third, final, complete, and `lights-native` folders are intermediate evidence. Original red/headlight fixtures moved lights after scene update and retained stale shadow state. Corrected fixture positions the actual vehicle before update; final red captures show real illumination. Baseline lighting is separately recaptured in `lights-before`.

`comparison.json` verifies 16 matched baseline/current physical states and native/software outcomes, with corrected vehicle-light fixtures. Draw counts and 35 programs are unchanged; textures increase from 55 to 56. Normal full-character views add 6,128 visible triangles; boot-only close views add 4,656. Six served modules match disk, import keys are unique, and the served atlas matches the original SHA256 `6c58b2e6379530a53407e66e9904d567d0f03ac2706df78b483426c1fa7f1102`. Accepted source and SHA256 manifest are retained beside the reports.

Installed standard client through `tools/verify-presented-client.mjs`, using `tools/fixtures/back-nine-player-motion.json`, passes on native and software renderers. Actual page images and state were opened. Both finish at player (20.82830292595025, 71.41017624022923), yaw .52, speed zero, both feet planted, checkpoint zero; physical outcome also matches the earlier accepted motion pass. No console error artifacts.

Short client timing: native 2560×1440 average 11.50 ms / P95 12.60 ms; software 640×360 average 95.42 ms / P95 123.30 ms. Software is visibly coarse and slow. Hardware and software timing under concurrent local browser work is diagnostic only; no isolated improvement or whole-level frame-budget claim.

## Remaining work

The new glove and boot silhouettes are substantially more coherent in the inspected views. Their finish reads under moonlight and the beacon; at normal chase distance these are restrained details. The player still needs a full head/body review beside Joe. The wide course views also retain sparse middle-distance composition and repetitive planting; this pass does not resolve those requirements.
