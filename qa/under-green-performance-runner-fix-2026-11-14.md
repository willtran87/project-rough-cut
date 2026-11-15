# Under the Green performance runner repair

November 14, 2026. Focused QA-tool repair; the broader visual-upgrade goal remains paused. No gameplay or renderer runtime code changed for this repair.

## Failure and repair

The boot module now imports `under-green.js?v=20261114-idle-screens`. The old Playwright route glob matched only the unversioned filename, so the production game instrumentation never loaded and the runner failed with `__underGreen is not defined`. The renderer export hook also depended on an outdated return-object prefix.

- Both module routes now match their exact filenames with or without query parameters. Hook code lives in `tools/under-green-soak-hooks.cjs`.
- Source markers are checked exactly once before launching the browser. Missing or duplicate markers produce explicit diagnostics. Startup requires both game and renderer instrumentation and verifies both routes loaded.
- The runner skips the opening cutscene before replay. It still uses the production page and `captureBuffer:false`, ordinary inputs, live AI and the normal fixed-step/RAF loop.
- Walking, wet walking, sprint and wet sprint all begin at the level entrance. Each tape is independently replayed against the simulation before the browser starts, checking outcome, position, time and water hits.
- Tape generation uses the requested FOV and aspect ratio, matching live pursuit observation.
- Reports record the current 2560-pixel hardware and 960-pixel software width ceilings. The analyzer reads this policy while preserving the old 1600-pixel hardware ceiling for historical reports without it.
- RAF sampling rejects nonpositive intervals when a queued callback timestamp precedes the post-GC clock reset. It continues excluding GC and long discontinuities from cadence samples.

## Verification

- Hook regression checks pass: versioned and unversioned modules, unrelated filenames rejected, current source instrumentation, missing/duplicate marker rejection.
- The actual serialized RAF callback passes checks for ordinary frames, negative/zero timestamps, GC, long discontinuities and completion. This timing guard was added during the hardware run; the full route run started with the preceding sampler revision.
- All 11 analyzer mutation cases pass, including changed route outcomes, slow rendering, the current resolution policy and invalid resolution rejection. These deliberately mutated historical fixtures are not new performance measurements.
- A 60-second SwiftShader smoke run at a 2560x1600 viewport and FOV 85 exited 0, with both hooks loaded and no console/page/replay errors. It completed no full route, so it verifies startup and sampling only; it does not qualify sustained stability or the frame-rate budget.
- The five-minute hardware run completed all four entrance-start routes, each matching expected outcome, position, duration and water hits. Both module hooks loaded once. Production context, requested viewport/FOV/resolution, audio, heap, event bounds and context health checks passed; no console/page/replay errors occurred.
- The full run correctly exited 1 on the existing strict resource plateau check: geometries rose from 580 to 581 after the first full route; textures stayed at 81 and programs at 218. This result does not establish a leak or identify its cause.
- Analysis also exited 1 and recorded both failed acceptance criteria. Warmed submissions averaged 57.37 FPS, but the slowest window was 53.26 FPS against the 55 FPS minimum. RAF p95 was 16.8 ms. Post-GC heap growth was 325,344 bytes, within the existing 5 MiB limit. No thresholds or warmup rules were relaxed.
- Actual reports and ending captures are under `output/under-green/performance-runner-fix/software-smoke/` and `hardware-soak/`. The smoke and full hardware processes have ended. The existing web server was preserved.

The runner repair is complete. The measured resource plateau and frame-rate failures remain separate runtime investigation work; this task did not resume the paused visual-upgrade goal or claim a performance gate passed.

## Reproduction

Run from the repository root with the existing local web server serving `web/` at `http://127.0.0.1:4187`:

```powershell
node tools/verify-under-green-soak-hooks.cjs
node tools/verify-under-green-soak-analysis.cjs
node tools/profile-under-green-soak.cjs --seconds=300 --viewport=2560x1600 --fov=85 --resolution=1 --output=output/under-green/performance-runner-fix/hardware-soak
node tools/analyze-under-green-soak.cjs --output=output/under-green/performance-runner-fix/hardware-soak
```

Use `--software` on both profiling and analysis commands for a full SwiftShader run. Short smoke runs do not satisfy the analyzer's four-route coverage and repeated warmed-sample requirements. Runner stability success alone is not frame-rate acceptance; the analyzer separately enforces the frame budget.
