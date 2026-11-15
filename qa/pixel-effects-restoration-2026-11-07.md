# Original effects adapted to the 3D course

The effects use existing gameplay events and evidence. Movement, collision, Joe's navigation, detection and horror-event timing are unchanged. The implementation is in `web/pixel-effects.js`, with a read-only state bridge in `game.js` and integration in `scene-3d.js` / `parallax-scene.js`.

## What returned

| Original effect family | 3D adaptation |
| --- | --- |
| Mowing trails and player tracks | Ground-aligned, depth-tested marks at the actual evidence coordinates and headings, using the original turf texture. Nearby marks receive priority within the pool; the simulation retains its full evidence history. |
| Ground fog and horror surges | Small, nearest-filtered wisps anchored to world cells, zone tint and the existing surge envelope. Clear Scenery reduces their strength. |
| Mower wake, directional beam and shockwaves | Low wake patches follow Joe's actual heading and motion; a sparse ground wash and expanding ripples communicate his search/chase direction. Solid scenery occludes these cues. |
| Wind, ambient motes and moths | A shared fleck pool follows current wind direction/strength, with moths around powered floodlights. |
| Cold breath and footfall debris | Brief near-camera breath in cold zones; grounded wet, sand, mud and grass fragments derived from existing ground-response records. |
| Spectral figures and peripheral scares | The original Shadow Joe illustration becomes a depth-tested apparition at a fixed world position for the event's lifetime. Existing authored spectral positions also remain atmospheric; they never become colliders or detection targets. |
| Joe flashes and course tears | Existing `joe_flash` events create a short world apparition. `course_tear` events create restrained pixel interference at the screen edge. No camera teleport, shake or scene slicing is added. |
| Chase and concealment feedback | A small pixel overlay supplies low-opacity pressure edges and concealment grass accents, keeping the center action lane and native HUD clear. |
| Cloud moonlight, zone grade and light failure | Actual 3D cloud positions modulate moonlight subtly; zone/surge state colors fog; existing light failures dim world lighting while the HUD stays readable. |
| Impact and mower particles | The existing 64-instance debris pool now uses surface-specific proportions, spin and lifetime decay. It retains the actual simulated trajectories and adds no draw call. |

This is an adaptation of the original cues to the 3D presentation, not a reactivation of the old screen-space renderer. In particular, full-screen scare imagery and displacement become localized, world-grounded or edge-only feedback.

## Limits and accessibility

| Pool | Software | Hardware |
| --- | ---: | ---: |
| Ground evidence | 80 | 160 |
| Mist, mower wake and breath combined | 10 | 24 |
| Wind, moths and footfall fragments combined | 24 | 56 |
| Mower ripple slots | 3 | 3 |
| Directional wash | 1 | 1 |
| Apparitions | 1 | 3 |

The new world effects use at most six additional draws. Transparent double-sided planes use a single pass. Frustum/distance checks limit submitted instances. At a stationary view, updates are limited to 12 Hz on software and 24 Hz on hardware; camera and preference changes refresh immediately. The overlay is a 256×144 CPU-backed canvas below the native HUD, repainted only when its quantized appearance changes. It requires no scene readback, blur pass or extra WebGL render target.

Small masks are generated once; turf textures are shared with the ground material. Actual instance-color/material layouts are included in protected preparation, so rare effects do not introduce a new shader layout at first use. Scene replacement removes private buffers, textures and the overlay's resize observer.

Reduced Motion freezes decorative movement and suppresses scare imagery. Scare Flashes controls transient apparition/interference events. Pause freezes the world effects and hides the screen overlay; Map and briefing screens also hide it. Existing atmosphere-density and Clear Scenery settings control decorative intensity. Ground evidence remains available even when decorative density is zero.

## Verification

`tools/verify-pixel-effects.cjs` exercises both hardware and SwiftShader: evidence and cue rendering, event types, stable apparition anchors, preferences, Pause/Map behavior, rendering without gameplay-state mutation, pool limits, viewport anchoring and scene disposal. An isolated framebuffer check confirms that the original-art apparition changes over 27,000 channel values in open space and changes **zero** behind an opaque wall. It is not merely an assertion about a material setting.

Visual evidence covers 2560×1600, 1280×720, 800×600 and 844×390 touch. Reports and screenshots are in `output/effects-restoration/`.

`tools/profile-pixel-effects.cjs` alternates effects off/on/on/off within one warmed SwiftShader process. It measures 24 GPU-completed moving scenes per batch after four warm-up frames, including dense evidence, full decoration, wind and a fog surge. Final results after softening the turf marks:

| View | Effects off, median | Effects on, median | Scene draws off → on |
| --- | --- | --- | --- |
| Dense opening | 83.9 / 83.7 ms | 83.6 / 84.4 ms | 243 → 249 |
| Border | 100.2 / 100.0 ms | 100.2 / 100.5 ms | 126 → 128 |

These are roughly unchanged within host variation, not evidence of faster rendering or sustained device qualification. The pre-existing software frame-budget failure remains open.

Fresh, separate-process software course entry after menu assets: ready 9.27 → 9.74 s; first GPU-completed scene 9.55 → 10.10 s; worst loading-frame gap 250 → 267 ms. This pair shows a small startup cost (~0.55 s), not an improvement. Compile/upload preparation measured 589 → 534 ms, so the elapsed difference cannot be attributed solely to shader compilation. This test does not measure uncached network navigation. Ordinary two-second movement remained comparable (48.0 → 48.4 course units); original object anchors and Joe geometry match the task-start baseline.

RTX 3090 / D3D11 moving samples at 1280×720 retained shadows and original texture detail: 60 submitted scenes per view, median 16.7 ms at both opening and border, p95 16.7 / 16.8 ms, no samples above 50 ms. This is a short local sample, not a sustained all-device guarantee.

Regression results: gameplay intelligence 9 groups (including 29 approaches), quality 16, Joe animation 5, pixel world 10, preparation lifecycle 5 and render queue 6 all pass. Release checks validate 90 action fixtures with no warnings or failures; runtime image inventory remains 55 images / 17.94 MiB. JavaScript syntax and whitespace checks pass. Human feel and sustained physical-device qualification remain prepared for later.

The installed web-game client completed three final input sequences: 586 submitted scenes, 28 course units travelled, ready state and no error artifact. Its final screenshot and state were inspected. The effects used five draws, with a maximum recorded CPU update of 0.8 ms. Readiness is 56/57: only the existing software `gameplay_frame_budget` gate fails (GPU-completed scene average 81.12 ms, p95 95.60 ms, approximately 12 FPS). Full-page captures at 2560×1600, 1280×720, 800×600 and 844×390 touch verify HUD/overlay placement separately from the client's canvas-only screenshots.
