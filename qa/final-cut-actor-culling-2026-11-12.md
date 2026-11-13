# Final Cut — conservative actor culling and renderer experiments

November 12, 2026. Progress on FC64, with visibility/lifecycle evidence supporting FC08/FC50/FC58. The full 72-item goal remains active.

## Production change

Joe's nine visible skinned meshes previously disabled frustum culling. They submitted 18,970 triangles even when the whole actor was behind the camera. `web/final-cut-actor-culling.js` now supplies one conservative world-space sphere around the animated actor root. Every mesh tests that sphere against the frustum passed by the renderer, including shadow-camera passes. It does not set global actor visibility, freeze animation, skip simulation or use the model's unsafe bind-pose bounds.

The 2.5-metre bound scales with the largest absolute world-scale component and updates after IK/parent changes. It is intentionally generous: small portions of Joe remain drawable near screen edges. The change allocates no textures, geometry or render targets. Bounds must be revalidated if the actor asset, scale or animation envelope changes.

## Final verification

The expanded hardware suite passes **480 actual-skin poses**: 122 boarding/dismount samples, dense arrival and full road motion samples, and eight cab/traction-loss poses. Each pose checks 14,244 weighted vertices. The largest sampled root-to-vertex distance is **1.804635 m**, leaving approximately **69.5 cm** inside the 2.5 m bound.

Hardware and SwiftShader each pass **144 exact framebuffer comparisons** across boarding, dismount and ground poses, twelve camera headings and four viewport sizes (2560×1600, 1280×720, 844×390 and 390×844). Every comparison matches the uncullled complete framebuffer byte-for-byte, with shadow refreshes enabled. Visible and partly visible Joe remain present; offscreen cases save nine draws and 18,970 triangles. Representative desktop, landscape and portrait captures were opened and inspected.

Both renderer paths also pass actual Escape pause, browser reload, and eight seconds of real coda simulation while Joe is offscreen followed by a look back. His pose advances normally and matches the uncullled result when visible again. No page/console errors occurred.

Completed render plus full-frame readback uses warmed off/on/on/off blocks, twelve samples each, without another owned browser test running concurrently. Actual buffers are 1280×720 on hardware and 960×540 on SwiftShader:

| View | Hardware off → on median pair (ms) | Software off → on median pair (ms) |
| --- | --- | --- |
| Overlook | 4.0/4.0 → 3.9/3.8 | 180.4/181.9 → 177.5/178.2 |
| Shelter exterior | 3.5/3.4 → 3.2/3.3 | 107.2/105.8 → 102.3/104.5 |
| West woodland | 3.1/3.1 → 2.9/2.9 | 61.9/61.3 → 58.0/57.9 |

This is roughly 0.15–0.2 ms saved on hardware and 3.1–3.7 ms on software in these offscreen views. The visible boarding view keeps identical draw/triangle counts; its software timing drift is not attributed to culling. Large absolute software costs remain unresolved. These measurements do not establish sustained FPS or a supported device tier.

The final installed-client run completed two bursts. Latest screenshot and state were inspected: playing at 6.52 seconds, Joe boarding, the offscreen actor bound tracking his world position, two allocated shadow maps and no error artifacts. The ground-level course, rail, rough, pump and scoreboard render coherently. This does not establish first-time orientation or sustained frame performance.

## Experiments deliberately not shipped

The following are isolated browser-instrumentation experiments. Their production renderer changes are not installed. Each uses completed render plus full RGBA readback in normal/variant/variant/normal order at five views: overlook, shelter interior, exterior, west woodland and collapse. Warmup work is drained before timed samples. These are local comparisons, not sustained gameplay frame rates; host load varies substantially between runs.

| Experiment/tool | Result and decision |
| --- | --- |
| `profile-final-cut-depth.cjs` | Depth prepass preserved pixels but was substantially slower in every view. Rejected. The first recorded run used the initial prototype; a subsequent test-only fix preserves dynamically replaced materials, but that revised prototype was not rerun and is not production evidence. |
| `profile-final-cut-opaque.cjs` | Front-to-back object sorting gave no dependable gain and changed 189 channels at a collapse overlap. Rejected. |
| `profile-final-cut-spot.cjs` | Early squared-distance light rejection preserved pixels but gave no reliable gain and sometimes cost more. Rejected. |
| `profile-final-cut-shadow-cache.cjs` | Reusing identical static maps reduced some work, especially in the west view, but cannot replace necessary updates while the source moves. The existing production invalidation remains. |
| `profile-final-cut-shadow-batch.cjs` | Shadow-only merged architectural geometry preserved all sampled pixels and removed 8–10 draw calls, but timing was broadly unchanged. Added proxy complexity/buffers were not justified; rejected. |
| `profile-final-cut-actor-cull.cjs` | Conservative whole-actor culling preserved all sampled pixels, removed nine draws/18,970 triangles in four offscreen views and saved roughly 2–3 ms there. This motivated the production per-mesh frustum implementation and its stronger pose/edge/lifecycle checks. |

Artifacts are under `output/final-cut/depth-profile`, `opaque-profile`, `spot-profile`, `shadow-cache-profile`, `shadow-batch-profile`, `actor-cull-profile` and `actor-culling`.

## Remaining scope

Software rendering remains unqualified. The savings here do not solve the much larger full-scene cost or establish a supported frame budget. No renderer resolution, foliage density, light/shadow cue or visual asset was reduced by this production change. Continue broader profiling with current-state baselines, and continue the missing composition, reveal, art/acting, audio and human first-time acceptance work across the complete backlog.
