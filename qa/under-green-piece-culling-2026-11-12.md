# Under the Green — software rendering and complete QA geometry

This pass addresses the measured wide-FOV software failure in review 40 and preserves the geometry-inspection guarantees in reviews 23/41. The previous high-resolution report remains historical evidence; its failed runs are retained.

## Delivered behavior

Under the Green's software renderer now uses the existing shared `createCourseBatchCulling` utility for its static construction batches. It removes only complete authored pieces whose bounds lie outside the view frustum. Original triangle order, materials, lighting, simulation and world layout remain intact. Hardware rendering retains its existing submission path.

The shared utility has an explicit `restore()` operation. It reconstructs the complete index stream through the same compactor and invalidates the prior camera cache. Under the Green calls it before static, camera, actor and view-obstruction audits. A clipping test cannot silently miss a wall because the last gameplay camera faced elsewhere.

The software frame-budget utility accepts a validated, copied list of resolution steps. Existing callers retain their original defaults. Under the Green adds a final step equivalent to the existing 50% software resolution: 480×300 for the 2560×1600 viewport. It is reached only after sustained slow completed frames. The native HUD remains unchanged, the player's resolution preference remains a ceiling, and sustained headroom restores higher detail. Cooldowns and projected next-step cost continue to prevent frequent size changes.

This is an explicit quality/performance tradeoff for software fallback. World text and edges become coarser at the lower setting; essential HUD text remains native. It is not a claim of native high-resolution scene rendering or physical-phone qualification.

## Verification

- Shared index compaction: existing 16/32-bit limits and 512 visibility transitions pass.
- Full-mesh restoration: 48 cull/restore/same-camera recull cycles preserve complete QA geometry, packed offsets and simulated GPU index contents. Restoring an already-full mesh causes no redundant upload.
- Frame budget: existing warmup, cooldown, overload, recovery and no-pumping cases pass unchanged. Added cases prove the custom floor, restoration through all steps, rejection of invalid policies, and isolation from later mutation of the caller's array.
- Actual software rendering: 72 views at full requested resolution and another 72 at the existing half setting. Six authored positions, FOV 45/58/85, and 2560×1600, 1280×720, 844×390, 390×844 viewports. Full versus culled images have zero changed bytes, including after the real QA restoration path and resuming at the same camera. Stationary views upload no new index values.
- A root-pillar face outside the final camera view still produces two expected clearance contacts after restoration. All 2,494 registered pieces are available to that audit.
- Inspected half-resolution full-page screenshots at all four viewport sizes. The keeper danger signal, bank, water, destination and native HUD remain visible; the junction's chevron and dry onward landing remain distinguishable. These emulated-size captures do not establish real touch ergonomics or human recognition speed.

Evidence: `output/under-green/piece-culling/browser.json`, `output/under-green/piece-culling/half/browser.json`, and their full-page screenshots. Tests are `tools/verify-course-culling-restore.mjs`, `tools/verify-under-green-piece-culling.cjs`, and `tools/verify-software-frame-budget.cjs`.

## Performance evidence and rejected alternatives

Light-only culling did not show a dependable improvement and was not integrated. Matched full/piece-culled comparisons preserve pixels, but short timings are noisy. The diagnostic probe is retained in `tools/probe-under-green-light-culling.cjs`. An early fixture restored raw indices without resetting packed offsets; its timing report is retained as `geometry/pre-restore-fix.json` and must not be used as acceptance evidence. The corrected probe compares pixels again after all switches and now uses the real restore operation.

Piece culling at the old adaptive floor completed all four production-loop routes with stable 280 geometries, 55 textures, 21 programs and 16 audio voices. The warmed average improved to 27.83 submissions/s, but the run still failed at least one 24-FPS window. That failure remains in `output/under-green/piece-culling/soak/`.

The final five-minute run with the additional adaptive step **passes** the unchanged warmed budget. It averaged 32.95 render submissions/s, with every warmed window between 24.31 and 38.28, RAF p95 16.7 ms, all four route outcomes unchanged and no page/context errors. Actual viewport/FOV/preference were 2560×1600/85°/1; the software scene adapted from 960×600 to 480×300. Geometry/texture/program counts remained 280/55/21, audio remained at 16 voices, and post-GC retained heap changed by −267,704 bytes. GPU queue depth stayed at most one. Evidence: `output/under-green/piece-culling/adaptive-soak/software-analysis.json` and raw samples beside it. The final full-page gameplay image was inspected.

The first two pre-warmup windows were 23.07 and 22.01 submissions/s. They remain in the raw report and are not represented as meeting the warmed 24-FPS threshold. This pass qualifies the defined warmed workload, not all cold-start performance.

The existing render-quality integration suite passes ordinary resolution UI changes, saved preference merging, unchanged simulation/HUD bounds, and all four viewports. The settings help now explains that the chosen resolution is a maximum and may adjust on slower devices; the 390×844 settings capture was inspected. The installed standard game client passes two forward-movement bursts: final state ready/playing at 7.03 seconds, lesson crossed, zero water hits. Its latest gameplay screenshot was inspected. All processes from this pass are terminal.

## Remaining scope

Actual integrated-GPU/mobile devices, cold-load constraints, longer thermal sessions and human comfort remain unqualified. Other outstanding review items, including live-Joe recovery envelopes and unfamiliar-player sessions, remain in the implementation ledger. This rendering change does not close them.
