# Final Cut Joe material consistency

Progress toward FV03–06, FV45 and FV48; preserves the completed local FV47 lighting work. Full 72-item implementation remains active. This is the material baseline, not completion of facial artwork, expressions, clothing wear or overall Level 1 parity.

## Changes

Final Cut previously converted the riding GLB to plain Lambert materials, losing the Level 1 character treatment. `final-cut-joe-finish.js` now applies the same blue collar tint, face-to-skin blending, perceptual color correction, direct-light-dependent edge response and 48-step lighting palette. The face blend uses the model's original red vertex channel and the same local-position skin projection as Level 1. Texture sampling remains nearest with mipmaps. No source pixels, mesh vertices, skinning, animation, gameplay, lamp power or detection state changed.

The adapter owns nine replacement materials and six unique texture objects. Seven named mapped materials use those six sources; collar and trousers share an embedded image. Replaced originals are disposed; scene teardown now stops Joe's mixer and releases the replacement materials, textures and shared skeleton texture. The scene exposes finish metadata in graphics state.

## Evidence

- `tools/verify-final-cut-joe-reference.cjs`: all nine body material names/source colors and seven named embedded-map hashes match Level 1. Riding face coordinates differ by less than 1 mm from the reference bounds. Its 1,097 face vertices include 381 intermediate blend weights and both zero/one endpoints. This validates shader inputs, not equivalent facial geometry: Level 1's face mesh has more vertices.
- `tools/verify-final-cut-joe-finish.cjs`: final native, software and saved-before reports each pass 26 views with no console/page errors. Views cover normal encounter distance, close front/side/rear, shirt, boots, turns, walking, boarding, aftermath and three additional rig headings. Five viewport sizes: 2560×1600, 1920×1080, 1280×720, 844×390 and 390×844. Native uses each actual size; software uses 960×600/960×540 at desktop and native compact dimensions.
- Actual keyboard strafe and exact paused-image comparison pass. Hand/foot errors remain below 5 cm across all captured poses. Warmed texture/geometry counts are stable. All body materials remain non-emissive.
- `pose-parity.json`: all 26 native before/after actor state objects and mesh vertex counts are identical, including positions, IK targets, errors, action and transfer state. Native warm resources remain 149 geometries/69 textures in both runs. The shader introduces no new mesh, light, image or draw.
- Native and software lifecycle tests find seven uploaded texture handles (six body textures plus the skeleton texture), all live before actor release and all deleted afterward.
- Native cab-light regression: eight direction/phase states, pause/reload/reduced motion, fixture attachment and four ending ages pass. The measured face patch gains 18.04 brightness levels when cab lighting is present; hand patches gain 2.72 and 3.28. These are local sampled gains, not whole-face exposure or full-level readability acceptance.
- Inspected the final native face/encounter, matched side pair, software face and compact portrait. The blue shirt, more consistent neck/face treatment and lit facial planes are visible. The existing facial expression and broad clothing artwork still require further authoring.

Artifacts: `output/final-cut/joe-finish/`. All owned jobs are terminal on final source.

- `routes/browser.json`: all three uninterrupted direct/garage/drain routes pass, with four heard ball redirects, zero captures/errors and 77 screenshots. Includes actual E record collection, pump/bell operation, physical collapse and road completion.
- `sightlines/report.json`: all 48 rig-visible/rig-hidden pairs are pixel-identical across the cardinal approaches, near/far offsets and standing/crouched views. All casting-light shadows refresh between the paired renders.
- `cab-lighting-software/report.json`: all eight direction/phase and four ending states pass, including pause/reload/reduced motion. Face gain is 17.29 levels; grips gain 3.40/3.95. Both renderer tiers retain real lamp response and state-dependent shutdown.
- `client/`: installed client exits 0; fresh screenshot/state inspected, ready/playing at (-1.8880467,4.7372006), actual 960×540, nine materials/six unique maps/one face blend and no error artifact. It covers intro progression and real keyboard movement; dedicated close-view tests cover the material appearance.
- Five final source/test hashes match the snapshots. Software warm resources are 149 geometries/66 textures. No frame-time improvement or software budget acceptance is claimed.

The embedded face image was extracted unchanged to `source/face-embedded.webp` for inspection. It already contains detailed pixel artwork and a fixed smirk; future expression work must preserve its UV registration and identity. A lighting change alone cannot supply the missing expression states.

## Remaining work

FV45 still needs authored eye/brow/cheek/mouth/stubble refinement; FV46 needs distinct state-driven expressions. FV48 still needs deliberate garment folds, wear and complete pixel-density review. Existing coarse neck/garment transitions are not accepted as final artwork. The full machinery, terrain, facade, effects, story/UI and performance scope remains. Resource stability is not sustained frame-time acceptance.
