# Joe HD pixel-art experiment

## Current runtime candidate: real pixel-textured 3D model

The [model package](model/README.md) now supplies the default in-game Joe and mower: editable Blender source, a rigged GLB, generated material tiles and reproducible build scripts. The GIF experiments below remain separate historical animation drafts.

## Earlier revision: natural walk and restrained horror

`previews/joe-hd-push-walk-natural.gif` is the latest preview: twelve distinct generated drawings at 10 fps, a 1.2-second loop, native 362×362 cells. The detailed reference is `source_sheets/joe-hd-reference-v2.png` (1024×1536). The reference uses a lowered chin, intent stare and restrained closed-mouth expression. The mower has a compact engine, low stamped deck, sensible wheel proportions, a side chute and continuous handle/control cable. The stride has lower foot clearance and smaller leg poses than the initial exaggerated lift. This stays **animation-draft**, with one front-right view and generated-only drawings awaiting a manual gait/rigidity and edge cleanup pass. It is not a finished replacement for all of Joe's gameplay directions and states.

Run `node tools/prepare-joe-hd-draft.cjs --natural` to rebuild this version. Its alpha, cell-edge, unique-frame, GIF frame-count and loop checks pass; results are in `metadata/natural-preview-validation.json`. Source lineage runs from reference v2 to natural-walk-v1, background cleanup v2 and spacing cleanup v3. The generator returned 1086×1448 for the final sheet. Equal-cell exports preserve its pixels without synthetic interpolation or independently resizing limbs/props. The earlier eight-frame preview remains available for comparison. Full production validation still fails incomplete directional/action coverage; no game code or runtime assets were changed.

The actual generated wheel geometry still varies slightly between frames, some fine fringe pixels remain, and the walking feet are not yet fully locked to a world-space ground speed. The twelve drawings improve the motion spacing but do not prove physically correct locomotion. The quieter expression supplies horror without gore or changing Joe into a monster.

## Initial revision

**Status: animation-draft.** A generated reference and eight-frame push-walk preview, saved separately from the active game artwork. Created with the built-in image-generation tool; GIF encoded locally using FFmpeg because the available generator has no direct GIF operation.

- `source_sheets/joe-hd-reference-v1.png`: 1024×1536 detailed reference, original identity/outfit and red push mower preserved. Contains soft background light; use as a reference, not a clean runtime cutout.
- `source_sheets/joe-hd-push-walk-v2.png`: 1448×1086 transparent 4×2 source sheet. The requested 2048×1536 was not the size returned by the generator.
- `previews/joe-hd-push-walk.gif`: eight distinct generated drawings, 362×543 per frame, nominal 8 fps, approximately one-second loop. GIF timing rounds 125 ms to centiseconds. The native PNGs retain full RGBA; GIF has a reduced palette and binary transparency.
- `previews/frames/`: untouched equal-cell source extractions. No procedural limb warping, cloned filler frames, or synthetic motion added.
- `exploration/` and `sprite_sheets/`: 192×192 nearest-neighbor readability proofs only. These are not installed in the game.
- `prompts/`: exact reference, animation and cleanup prompts. The image generator used the previous generation as its next reference.

The new design gives Joe clearer hair, brows, eyes, stubble, shirt collar, knit cuffs, trouser folds, shoe soles, mower engine fins, chipped enamel and tire details. It follows the original office-clothes-and-push-mower identity; it does not use the old smooth renderer's unrelated ride-on model.

The initial animation sheet crowded cell edges. A second generated edit adds gutters and preserves the walking progression. Native exports remain on the generator's pixel grid. A fixed 4×2 crop is used, with no independent frame scaling or auto-trimming that could cause size pumping. In the preview the mower/body still change shape slightly between drawings and some red/yellow fringe pixels remain. A manual pixel cleanup and gait/rigidity pass are required. Pixel clusters are also more painterly than a strictly limited-palette sprite.

This has one front-right facing only. Before it can replace Joe in the 3D course, it needs consistent front/side/rear directions, stationary investigation/search/chase states, stable mower/hand anchors, clearer foot contact and loop continuity. That is why it is an animation draft, not a finished gameplay character. Generated action sources exist but have not received user approval; there are no hand-authored animation drawings or complete directional source boards.

## Validation

Run `node tools/prepare-joe-hd-draft.cjs` from the repository root (Sharp and FFmpeg required). Packaging checks pass: eight unique frames, real alpha and empty cell borders, all silhouettes within their cells, valid eight-frame looping GIF. Detailed bounds/hashes: `metadata/preview-validation.json`.

The full character skill validator is also run and saved as `metadata/full-package-validation.json`. It fails the complete enemy-production contract because this requested preview does not contain a full combat/directional animation set, UI icon or production metadata. It must not be interpreted as production-ready. The full command is recorded in `metadata/joe-hd.quality-report.json`.
