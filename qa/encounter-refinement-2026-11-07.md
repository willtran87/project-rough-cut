# Encounter refinement — November 7, 2026

Implemented the recommended first batch: differentiated check outcomes, readable Joe reactions, a quieter danger HUD, physical side-boundary continuity, and a bounded close-escape opportunity. Movement scale, collision hulls, player acceleration, paths and pixel-art assets remain unchanged.

- Bell: immediate check and loud investigation, with Joe planting/orienting before advancing. Field log: existing quiet 1.6-second hold versus immediate loud stamp retained and tested. Release: a valid distant golf-ball investigation now permits a silent signature without replacing or extending the distraction; otherwise existing cart/hedge retreats apply. Prompt and commitment preview reflect the actual outcome.
- Joe: new-state investigation/pursuit orientation pauses (.45/.24 seconds); stronger inspection/search/pursuit head poses, simulation-driven. Same-state announcements cannot extend the pause. Grip and walk/idle blends preserved.
- HUD: danger owns one status/direction and one instruction. Incidental captions, banter, payoffs and optional choices yield. The immediate close warning overrides hold/aim guidance; completed sealing still wins. Caption preference controls the direction label.
- Close escape: unobstructed proximity under 12 course units triggers .65 seconds of mower pause/capture grace, once per engagement. Capture resumes at the existing 8.2-unit threshold. Rearm requires eight continuous seconds beyond 42 units, unseen, outside chase/search. No automatic player displacement or new button.
- Border: 88 fixed sagging rope spans connect existing side posts; no additional collision hulls. Woodland and routes remain fixed in world space.

## Verification

- `tools/verify-encounter-refinement.cjs`: eight passing groups, zero browser errors. Real Use/choice inputs, quiet cancellation, silent/loud release and invalid diversion cases, no signal extension, close escape movement/Pause/expiry/reuse/rearm, pose grip/freeze, edge movement, both shed and drain victory flows.
- `tools/verify-quality.cjs`: 16 passing groups, zero browser errors. An initial cold-start route failure was caused by its harness issuing movement before scene readiness. The harness now waits for actual scene/model preparation; both ordinary-input opening routes pass.
- `tools/verify-joe-polish.cjs`: five passing groups, zero browser errors. Maximum hand-position error about .000018 scene units. Blend continuity, rapid reversals, duplicate rendering, Pause, idle wheels and reduced motion pass.
- `tools/verify-release.mjs`: syntax/assets/90 action-fixture parses pass, 55 runtime images, 17.94 MiB, no warnings. These are fixture validity checks, not 90 executed runs.
- Screenshots inspected at 2560×1600, 1280×720, 800×600 and 844×390 touch; danger instructions stay inside the stage and away from touch pads. Release prompt, woodland rope and Joe inspection screenshots inspected. Artifacts: `output/encounter-refinement/`.
- Installed web-game client: completed two iterations, gameplay screenshot/state inspected, assets loaded and no console-error artifact. The concurrent software-rendered run passed 56/57 readiness checks; `gameplay_frame_budget` failed. This is recorded, not treated as a pass.
- Final isolated installed-client repeat also completed two iterations in gameplay with zero asset failures/console-error artifacts and 56/57 readiness checks. The remaining failure is still `gameplay_frame_budget` (reported p95 render work 252.6 ms). This client explicitly forces SwiftShader; isolation did not resolve the software-renderer limitation. Evidence: `output/encounter-refinement/isolated-client/`.
- Isolated hardware RAF samples at 1280×720, five seconds per view on RTX 3090/D3D11: service, clubhouse, shed and border median 16.7 ms; p95 16.7–16.8 ms; worst 33.5 ms (border), zero frames over 50 ms. Simulation was held during these rendering samples. This does not establish sustained gameplay, software-renderer, mobile, or lower-end hardware performance.

Human playtests remain prepared, not conducted. The .65-second escape window, diversion strength, cue comprehension and perceived fear/fun still need real player feedback. The guide has been updated for these comparisons. No commit or deployment.
