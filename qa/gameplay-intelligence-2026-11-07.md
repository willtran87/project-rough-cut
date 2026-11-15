# Gameplay intelligence and performance — November 7, 2026

Local implementation, not a deployed release or human acceptance. Movement speed, collision scale, aiming controls, original close-up Joe model and authored pixel textures remain intact.

## Gameplay changes

- Joe estimates a bounded intercept from confirmed visible motion, then falls back to remembered evidence when sight is lost. He checks a finite, directional search pattern and returns to patrol with an eight-second director relief interval.
- Routes use the actual 2.2-unit mower clearance. A corner waypoint is retained until the next segment is clear, preventing early corner cuts and oscillation.
- Director patrol changes no longer teleport Joe or choose a destination from the hidden player's position. He follows an authored patrol destination through normal movement; fresh sight/sound can interrupt it.
- Map exit plans show actual access requirements, distance to the next required point and current filing time. Key ownership changes the advice. Route selection restores game focus.
- Shot previews explain the real landing surface/lure modifier and identify bank shots. Victory retry coaching recognizes the run's tactic and suggests another one; mastery targets remain visible.

## Rendering changes and visual preservation

- Static props now share materials across tint variations, preserving tint as vertex color. Animated station mechanisms, completion ink and lamps remain independent. Existing spatial chunks still cull.
- Joe keeps all 141,248 runtime triangles nearby and uses 22,598 beyond 14 m, returning below 11 m. The distant asset is a real 27-mesh skinned model with the same 17-bone rig, original pixel materials and animation state. Its 1,314,492-byte GLB omits duplicate textures. Offscreen Joe drawing is culled conservatively.
- Shadow maps reuse duplicate frames and refresh immediately for movement/mechanisms, with stationary animation sampled up to 30 Hz. The sealing door is keyed separately because the course clock pauses during sealing.
- The 3D path skips unused legacy atlas rasterization/cache priming and prototype ground generation. Legacy/failure paths retain decoded source images.
- Hardware retains full requested resolution, shadows and illustrated parallax. Detected software renderers use a 960×540 cap, no dynamic shadows, 36 m far clipping, matching 18–34 m fog and a cheaper surface projection. Textures and nearby geometry stay intact; HUD remains native resolution.

## Verification

`tools/verify-gameplay-intelligence.cjs`: nine acceptance groups, including 29 collision-clear obstacle approaches, bounded prediction, sight-loss memory, finite search, relief, no director teleport/hidden retarget, fresh-contact interruption, route selection/focus, previews/coaching, LOD transition, preserved grip and a missing-LOD fallback that retains the original model. No browser errors.

Existing regressions: encounter refinement eight groups, quality/movement sixteen, Joe animation five, pixel-world/parallax ten. Rendering-preparation lifecycle passes: held simulation, Pause/resume, first active render, primary-model fallback and cancellation/rebuild. Release check: 90 action fixtures and 55 image assets / 17.94 MiB, no warnings/failures (image total excludes model files).

Visual checks at 2560×1600, 1280×720, 800×600 and 844×390 touch. Evidence lives in `output/gameplay-intelligence/`; pixel-world and preparation reports are also retained in their tool output directories. The pixel-world resolution assertion now checks the deliberate software cap; full-resolution hardware is checked separately.

## Performance evidence and limits

Measurements are short engineering samples, not target-device qualification. `profile-gameplay-intelligence.cjs` collects 60 real RAF intervals per view with deterministic simulation time. The moving variant changes camera position and yaw each frame. No video capture runs during these samples.

- RTX 3090 / ANGLE D3D11, 1280×720 with shadows: moving opening and border samples both median 16.7 ms, p95 16.7–16.8 ms, max 16.8 ms, zero intervals above 50 ms. CPU submission p95 8.3/5.5 ms. Held-camera samples were also 16.7 ms median. This does not prove the same performance on lower-end GPUs or a full uninterrupted run.
- Forced SwiftShader remains slow and variable. Initial complete configuration: opening/border 1,155/529 draws and 926,186/594,564 triangles. Final fallback: 218/90 draws and 255,214/99,472 triangles; CPU submission p95 5.9/6.7 ms. Final displayed-frame median 149.9/116.7 ms, p95 399.9/483.3 ms, max 3466.5/699.9 ms. The original sample was median 216.6/233.3 ms and p95 466.8/283.4 ms. Work is reduced but frame pacing is **not resolved**; the fallback also changes resolution/shadows/draw distance, so this is not a pure batching comparison.
- Startup CPU sampling identified ~2348 ms in image-bitmap materialization before removing duplicate/unused raster work, ~256 ms afterwards. This is a sampled function cost, not total startup time. Latest primary-model preparation test: ~5.96 s loading, first/max active CPU submission 13.9 ms; worst loading frame ~917 ms. Loading is protected but still has visible stalls. Failed-primary fallback: first 22.8 ms, max active 23.6 ms.

The installed skill client completed three iterations with 12-second pauses. Final state: ready, 293 spatial frames, 14 course units moved, no console-error artifact, 56/57 readiness checks. Remaining failure: `gameplay_frame_budget` under forced SwiftShader, reported p95 render 200.8 ms / max 1666.7 ms. Earlier iterations captured preparation and are not gameplay performance evidence.

The initial before snapshot did not include the then-unchanged Joe module. The profiler refuses to rerun `--before` without that matching original file, rather than silently mixing current LOD loading with historical renderer sources. The recorded original JSON remains the source of the baseline above.

Human feedback remains prepared for later. Open validation: perceived pursuit fairness, tactic discovery, route comprehension, actual input comfort, LOD visibility during motion, long-run pacing, lower-end hardware and software rendering. No commit or publication performed.
