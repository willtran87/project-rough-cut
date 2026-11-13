# Joe: pixel-textured game model

Rebuilt body/face candidate, integrated in the default pixel-volume scene. This is a real skinned mesh and rigid mower. `tools/build-joe-model.py` reshapes pinned MakeHuman CC0 anatomical data in Blender and fits generated pixel material maps. The established mower silhouette is retained with added mechanical detail. No image-to-3D service was used.

- Editable source: `joe-pixel-rig.blend` (Blender 5.1).
- Runtime: `web/assets/models/joe-pixel-rig.glb`, 14,590,884 bytes including textures.
- 17 bones, 71,551 source vertices, 141,248 triangles, six Blender mesh objects, 27 runtime material primitives. Zero unweighted vertices; the builder refuses to export unweighted geometry.
- `PushWalk`: 1.2-second loop, 37 sampled keys, 0.74193548-meter stride cycle. `PlantedIdle`: a breathing cycle played over 3.6 seconds, with stationary feet and grip. Runtime uses a 0.28-second start blend and 0.38-second stop blend, speed hysteresis and eased head poses. Pause freezes these updates; reduced motion suppresses decorative breathing.
- Four separate wheels have radius metadata and rotate from traveled distance. Hands maintain their mower grip across the sampled cycle.
- Generated face/skin/knit/trouser and enamel/engine/leather/hair atlases are preserved here; original prompts are in `../prompts/model-*.txt`. `face-albedo-v2.png` and `wool-fine-v1.png` replace the earlier face and oversized knit map. Both new maps are 1254×1254; exact prompts are `../prompts/face-albedo-v2.txt` and `../prompts/wool-fine-v1.txt`. The collar reuses generated woven twill with a blue-gray runtime tint. Nearest magnification and stepped lighting preserve crisp material detail.
- Anatomical source data, license and pinned file hashes: [anatomy/README.md](anatomy/README.md). Head/eye topology and connected torso/pelvis garments replace the old loft/tube construction. The browser needs only the exported GLB.
- Current refinement: forward pushing posture with lowered chin, broader jaw and lower inner brow, facial material continued around cheeks, looser chest/sleeves and waist folds, open office collar, tapered gripping fingers, knuckles and correctly placed thumbs. The rig rest pose follows the sculpt while wrist and foot anchors remain unchanged. Existing pixel maps are reused.

## Rebuild

From the repository root, with the existing web-game skill's Sharp installation available:

```powershell
node tools/prepare-joe-model-textures.cjs
& 'C:/Program Files/Blender Foundation/Blender 5.1/blender.exe' --background --python tools/build-joe-model.py
```

The script builds a fresh background scene and overwrites these generated model outputs. Blender coordinates are Z-up, +Y-forward; GLB is Y-up, -Z-forward. Geometry is authored in meters. Runtime course positions use the existing .16-meter scale and .72 X correction; the model itself is not scaled a second time. Runtime heading uses authoritative effect heading minus PI/2.

Serve `web/`, then open `/joe-model-preview.html` to orbit, zoom, walk, pause, use the turntable, or select Face for a close-up. The game uses the same module and GLB. `?joe=sprite` provides the previous directional actor for comparison. It also remains visible while the model loads or if loading fails.

## Verification and limitations

Run `node tools/verify-joe-model.cjs`, `node tools/verify-joe-preview.cjs` and `node tools/verify-joe-polish.cjs` against the local server on port 4187. The latest record is `qa/joe-natural-2026-11-06.md`; earlier versions are documented separately in `qa/joe-body-face-rebuild-2026-11-06.md`, `qa/joe-pixel-model-polish-2026-11-06.md` and `qa/joe-pixel-model-2026-11-06.md`. Preparation lifecycle checks: `node tools/verify-render-preparation.cjs`. Rendering comparison: `node tools/profile-joe-model.cjs`.

The body/face rebuild adds anatomical lips, eyelids, ears, a nose profile, a connected sweater and trouser pelvis, fine worn wool, fitted cuffs and a cut V-neck with folded office collar. Skin UVs on hands are continuous. Walk/idle blending remains intact. This remains a stylized interpretation of the reference, with no complete authored enemy action library or facial rig; exact likeness and artistic acceptance are not claimed. The source illustration still has more deliberate expression, posture and cloth folds. Human testing remains prepared for later, and physical mobile/sustained performance is unqualified.

Previous mower/finish pass: cropped sides expose the ears, swept quiff relief, fuller cheek/chin planes, firmer brow/jaw, paler blue woven collar, looser torso and elbow gathers. Mower additions use rigid geometry for mount bolts, rolled edges, adjuster grips/notches, starter badge and cord, fuel-cap ribs, filter pleats, spark plug, ignition lead and fuel line. Existing hand anchors, wheel radii and gait are retained.

The course prepares shader variants, texture uploads, shadow materials and geometry buffers before simulation resumes. Static geometry batching uses typed chunks and yields between batches. Preparation and scene replacement are cancellation-aware. The directional Joe remains the failure fallback. Loading still takes time; see the QA record for measured limits.

Previous likeness pass: thirteen shallow, overlapping scalp-following locks and a continuous lifted base form a combed-back quiff. Lowered inner brows, slightly narrowed lids and asymmetric mouth corners give a restrained smirk. Shoulders move forward/down with the rig rest pose; dense-surface sculpting adds curved waist folds, compressed sleeve folds and trouser gathers. The V-neck gets fitted knit edging. The named FaceBlend vertex-color layer is explicitly exported and consumed as a face/skin material mask; it is not a vertex tint. Skin fallback samples rest-space coordinates so it follows the rig without stretching the facial atlas down the neck. The browser shader implements this blend; Blender retains the editable mask and source textures. Existing mower geometry/materials match the prior GLB exactly.

Current natural-shape pass: a single continuous hair surface replaces the separate raised strips. Ten irregular scalp-following guide curves sculpt shallow swept relief, with continuous strand UVs and an off-center forelock. Jaw widening, brow projection, lid lowering and mouth-corner offsets are reduced. Shoulder caps slope lower and upper sleeves have less padding. Broad, tapered diagonal waist folds and localized inner-elbow compression replace sharp full-width ridges and circular sleeve rings. Existing textures, face/skin blending, gait, mower and rendering preparation remain in place.


### Distant runtime mesh (November 7)

`tools/build-joe-lod.py` imports the original GLB in headless Blender and exports `web/assets/models/joe-pixel-rig-lod.glb` (1,314,492 bytes). The runtime uses 22,598 triangles at distance versus 141,248 nearby, with 27 matching mesh primitives and the same 17-bone rig. Material slots preserve matching, but duplicate texture images are omitted: the runtime reuses the original pixel materials and animations. Switch out beyond 14 m, return below 11 m. Original GLB and editable source are unchanged. Verification: `tools/verify-gameplay-intelligence.cjs` and `qa/gameplay-intelligence-2026-11-07.md`.
