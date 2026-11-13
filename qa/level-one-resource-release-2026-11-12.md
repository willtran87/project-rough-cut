# Level 1 rebuild resource cleanup — November 12, 2026

Fixed persistent GPU texture allocations when Level 1 replaces its world,
including changes between Night Order variants. Same-variant retries normally
reuse the world; this is not a claim that every retry previously leaked.

## Cause and change

- Joe's nine skinned body meshes share one skeleton. The model released its
  geometry, materials and surface maps but omitted `Skeleton.dispose()`.
  One 12x12 bone-data texture remained allocated after each world replacement.
  Model cleanup now deduplicates and disposes owned skeletons, including loaded
  models discarded through the existing cancellation path.
- Hardware rendering also retained the directional moon light's shadow target.
  Its two 2048x2048 textures outlived the world. World teardown now disposes
  remaining light shadows. The mower beacon already owns and disposes its
  shadow resources before the general world traversal.
- Models, animation, light settings, shadows, controls and rendering quality
  are preserved. Scene/Joe import cache versions were advanced.

## Before/after evidence

`tools/probe-course-texture-lifecycle.cjs` instruments the actual Three texture
registration and checks live GPU allocations through the renderer. It records
current material, uniform, skeleton and light ownership. The diagnostic retains
CPU references deliberately; it is a GPU lifecycle test, not a JS heap test.

| Renderer | Before, four completed worlds | After, four completed worlds |
|---|---|---|
| SwiftShader | 106, 107, 108, 109 textures | 106, 106, 106, 106 |
| NVIDIA RTX 3090 / D3D11 | 106, 109, 112, 115 textures | 106, 106, 106, 106 |

Initial software probe 13207 and hardware ownership probe 87997 finish normally
and identify the retained textures. Final software 30707 and hardware 2959
finish successfully with no prior-world orphan textures or count growth.

## Variant, animation and visual checks

- Hardware 26456 and software 91622 complete six production variant changes:
  Standard Review, Eastern Exception, Closing Shift, then the same sequence.
  They call the real round reset with each variant, letting the normal scene
  key replace the world. Every world UUID is fresh; no forced renderer reset
  substitutes for these variant transitions.
- Every run retains 106 GPU textures, a newly allocated functioning skeleton,
  and a mower grip error below 0.005 world units. All three returning variants
  match their first scene-target pixels exactly on each renderer.
- Joe's bone texture changes during subsequent walking animation. Actual
  keyboard pause/resume and W movement work after the replacements.
- Screenshots captured at 2560x1600, 1280x720 and 390x844. Hardware high-resolution
  and ordinary views and software portrait were inspected: Joe, mower, beacon,
  shadowed course and danger feedback render after rebuilding.
- Hardware interrupted-loading run 52371 passes: two worlds are replaced while
  preparation is active and Joe's bone texture is already GPU-allocated.
  Subsequent completed worlds retain the same 106 textures and no old orphans.
- Software interrupted-loading run 29152 also passes both cancellations and
  the following full rebuild, with the same stable allocation counts.
- Successful runs report no page or console errors. Runtime syntax checks pass.
- Installed presented client 78290 exits 0 after two ordinary arrival input
  bursts. Latest page and selected state inspected: first_hole, tee, movement
  recorded and readable arrival/goal feedback. No error artifacts. Readiness
  remains 56/57 with only `gameplay_frame_budget` failing. Evidence:
  `output/course-texture-lifecycle/standard-client/`.

Evidence: `output/course-texture-lifecycle/` contains the original `probe/`,
`hardware-before/`, `software-final/`, `hardware-final/`, both `*-exercise/`
directories and interrupted-loading reports.

## Remaining scope

This closes the specific rebuild texture growth discovered in the batching
pass. It does not qualify frame times, JS heap behavior, long hardware sessions,
human comfort or complete-route fun/fear/comprehension. P9 and the full Level 1
implementation goal remain active. All owned process handles are terminal.
The existing server is retained; no commits, deployment or other-chapter edits.
