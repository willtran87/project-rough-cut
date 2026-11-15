# Joe pixel model — November 6, 2026

Historical first-version results. The [subsequent polish pass](joe-pixel-model-polish-2026-11-06.md) supersedes the geometry counts, direct transitions and four outstanding sculpt items below.

## Delivered

Default pixel-volume gameplay now loads an actual 17-bone Joe and rigid walk-behind red mower. ImageGen supplied material atlases; a reproducible Blender script authored the meshes, UVs, rig and baked animation. The live Blender connector was unavailable, so the installed Blender CLI built the asset in a separate background process. Editable source and runtime GLB are retained.

Body heading and placement follow existing gameplay state. Walk phase and four wheel rotations follow distance traveled. Hands stay attached to the handle. Planted idle and cosmetic search/inspection/chase head poses use existing state. Movement, collision, AI, navigation and parallax rules were not changed by this model pass. The original sprite remains the loading/error fallback and explicit `?joe=sprite` comparison.

## Automated and visual evidence

- `node tools/verify-joe-model.cjs`: six check groups pass; actual GLB load, 17 bones, all-angle geometry, heading/position independence from camera, 12 sampled gait phases, stable hands, distance-driven wheels, stationary idle, non-accumulating head pose, scene reload, desktop/touch captures; no browser errors.
- `node tools/verify-joe-preview.cjs`: viewer walk, idle, pointer orbit and turntable pass at 2560×1600, 1280×720, 844×390 and 390×844; no page errors.
- `node tools/verify-quality.cjs`: 16 groups pass.
- `node tools/verify-spatial.cjs`: 12 groups pass.
- `node tools/verify-pixel-3d.cjs`: ten groups pass, including physical geometry, model heading, mechanisms, parallax and comfort behavior.
- `node tools/verify-release.mjs`: passes its existing image/reference and 90 action-scenario checks. Its image byte total excludes the new 7.77 MB GLB; model loading is covered by the dedicated browser test. `git diff --check` passes.
- Installed web-game Playwright client completed `web/test-actions/next-pass-onboarding.json`; final screenshot inspected. This onboarding image alone is not close-up model evidence.
- Final studio oblique and rear views inspected, along with earlier game angle/phase captures. Corrected knee twist, unreachable leg targets, wheel-axis errors, accumulated head overlays, UV wrap seams and initially exaggerated hair geometry during implementation.

Evidence folders: `output/joe-model/acceptance`, `output/joe-model/studio`, `output/joe-model/client`. Model build report: `assets/enemies/joe-hd/model/build-report.json`. Final source geometry: 34,745 triangles, 17,923 vertices, zero unweighted vertices. Runtime grip error in the final captured report is approximately 0.00000034 meters (test threshold 0.005 meters).

## Short rendering comparison

`node tools/profile-joe-model.cjs`: three five-second requestAnimationFrame samples per representation at 1280×720, Chromium on RTX 3090 through D3D11, no recorded video. Same pixel-volume course, nearby walking Joe, three course positions. The fixture holds simulation and manually renders to isolate presentation cost; it does not measure complete gameplay or input latency.

Both representations: 16.7 ms median. Sprite p95: 16.7 ms; model p95: 16.7–16.8 ms. Each had one frame over 50 ms in the first sample and none in the other two. Model adds 51 submitted draw calls and 69,488 submitted triangles including shadow passes at these endpoints. Frame intervals are refresh-limited and do not establish equivalent GPU headroom. Full results and GLB hash: `output/joe-model/performance/report.json`.

## Acceptance limits

The real model works in the game, but the first sculpt does not yet match the original illustration's polish. Face likeness, hair silhouette, collar and shoulder transitions remain art-review items. Walk/idle are the implemented clips; state changes switch directly and there is no full authored action/facial animation set. The generated textures are detailed pixel materials; this is not proof of final stylistic acceptance. Human testing remains deferred as requested. No physical mobile or sustained performance qualification, deployment or commit was performed.
