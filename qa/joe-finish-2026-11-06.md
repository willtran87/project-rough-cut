# Joe finish and first-use rendering preparation

Local implementation for the request to refine Joe's face/body, add mower detail and fix the first-use rendering hitch. No deployment or commit.

## Art

- Face: firmer jaw and brow, fuller cheek/chin planes. Existing high-resolution generated pixel maps and anatomical topology remain in use.
- Hair: cropped sides expose the ears; a raised, swept front and stronger relief replace the lower helmet-like outline.
- Clothing: paler woven blue collar, looser torso envelope, stronger diagonal waist folds and elbow gathers. Wrist/foot anchors and the existing walk/idle animation contract remain unchanged.
- Mower: deck bolts and slots, rolled edges, height-adjuster levers/notches/grips, engine fasteners, starter badge/cord/pull, spark plug and ignition lead, fuel line, filter pleats, fuel-cap ribs and small edge wear. The deck, wheel centers/radii and hand contact locations retain their established shape and placement.
- Rebuilt editable Blender source and runtime GLB: 67,631 source vertices, 133,756 triangles, 17 bones, six Blender meshes, 27 runtime material primitives, zero unweighted vertices, 13,804,360 bytes. GLB SHA256: `01b33be679e797f7a8520cbe24dcb7a25c85112c8718bcbed0f36d982b76252e`.

Before/after asset, builder and identical-camera captures are retained under `output/joe-finish`. Portrait, profile, full-body and mower close-up images were inspected. The high-resolution game pass uses 2560×1600; the viewer also covers 1280×720, 844×390 and 390×844. This is a further interpretation of the reference, not a claim of exact likeness. No new image generation was used in this pass.

## First-use work

The instrumented baseline identified synchronous shader first-use reflection/compilation as the main cause of a roughly one-second first draw. Preparation now compiles the actual offscreen color variants and custom depth/shadow variants, uploads textures in short batches, waits for shared-material variants and spreads uniform reflection across frames. Parallax materials are included. A final warm draw allocates visible geometry buffers and the shadow framebuffer before simulation resumes.

The preparation helper uses the pinned Three r187 program inspection API as well as `compileAsync`; verify it if upgrading Three. Shader error diagnostics remain enabled. Asset visibility and model readiness are delayed until preparation succeeds. Failed model loads keep the directional fallback. Replacement scenes cancel stale work; temporary shadow targets and attached depth materials are disposed.

Static world geometry batching now retains typed chunks, copies directly into the destination attributes and yields between records/batches. This removes large temporary JavaScript number arrays and reduces long loading intervals. The game polls a lightweight preparation flag instead of constructing diagnostic scene statistics every simulation update. Pause/controller polling remains available while gameplay time and movement are held.

## Measurements and limits

Chromium 148, RTX 3090, ANGLE D3D11, 1280×720. Performance runs are isolated from other browser jobs; they hold simulation to measure rendering, not sustained gameplay or input latency.

- Previous first sample: model maximum frame interval 1,066.6 ms, sprite 416.7 ms. Original report is archived under `output/joe-character-refinement/performance.json`; detailed baseline trace is `output/joe-finish/hitch-before.json`.
- Prepared active rendering: three five-second samples per representation, median 16.7 ms, maximum 16.8 ms, no intervals over 50 ms. See `output/joe-model/performance/report.json`.
- Separate lifecycle test: first active model render submission 13.8 ms; failed-model fallback 11.7 ms. Both stay below the 100 ms regression gate.
- Loading is **not stall-free**: model preparation took about 2.9 s in that lifecycle fixture, with a largest preparation-frame interval of 633.4 ms and a 138.2 ms warm draw. Before the geometry batching changes that interval was around 2 s. These figures include loading activity and test interactions; they are not gameplay frame times. Asset decode, scene construction and driver allocations remain loading costs.
- Mobile hardware and sustained performance remain unqualified. Human playtests remain prepared for later.

## Verification

- Preparation lifecycle: held simulation, pause/resume, first active submission, failed GLB fallback and replacing a scene while preparation is pending.
- Model: 17-bone load, camera-independent geometry, 12 gait samples, distance-driven wheels, planted search idle and rebuild recovery.
- Animation polish: start/stop blends, rapid reversals, frozen paused pose, stable grip and reduced-motion idle. Maximum sampled grip error approximately 0.0000144 m against the 0.005 m gate.
- Viewer: orbit, turntable, walk/idle and face/full-body controls across desktop and mobile viewports.
- World and controls: pixel-volume/parallax acceptance and perspective navigation regression, including movement/release, mouse/controller/touch look, ball motion, interactions and pause selection. Asynchronous fixtures explicitly await renderer readiness.
- Installed web-game client onboarding and actual screenshot/state inspection; release validation reports 90 action scenarios and no failures. Its 14.49 MB image inventory excludes the GLB; model size is reported separately above.

Reports live under `output/joe-finish/preparation`, `output/joe-model`, `output/pixel-3d/acceptance`, `output/perspective/acceptance` and `output/joe-finish/client-final`.
