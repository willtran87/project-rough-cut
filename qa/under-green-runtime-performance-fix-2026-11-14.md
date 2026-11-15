# Under the Green geometry and frame-rate repair

November 14, 2026. Addresses the two failures measured after the performance runner repair. The broader visual-upgrade goal remains paused.

## Causes and changes

The geometry increase was the existing fixed `Scythe masonry contact flecks` pool. Live upload tracing identified its first GPU geometry upload at 56.10 simulation seconds on the wet walking route, after the dry route had finished. This was deferred first-use allocation, not repeated geometry creation. The pool now submits a zero-index preparation draw behind the loading screen, with visibility and draw range restored afterward. The real pool's geometry and instance attributes are allocated before an impact can use them.

The fixed-view CPU profile identified `insideWetPolygon` as the largest named application hot spot. Spray droplets and water contacts repeatedly tested detailed outlines of every shallow pool. `shallowWaterHeight` now caches exact bounds for the ten static authored outlines and skips polygons that cannot contain the query. Queries within those bounds still use the original polygon test, preserving edge semantics. No texture, effect density, resolution, lighting, collision or gameplay rules were reduced.

Runtime changes are limited to `web/under-green-wet-ground.js`, `web/under-green-strike-debris-scene.js` and the preparation call in `web/under-green-scene.js`.

## Verification

- All 94,617 shallow-water queries match the original full scan, including every authored vertex/edge midpoint and probes a billionth of a metre to either side. The local three-pass query benchmark improved from 17,381.5 ms to 429.3 ms (40.5x); this is a focused query benchmark, not a whole-game FPS claim.
- Existing wet-ground, channel-shore and recessed-shore tests pass, including flood precedence and wet/dry footstep contacts.
- Nine framebuffer comparisons match exactly: seven district/puddle views at 2560x1600, plus a crossing at 1280x720 and 390x844. Saved captures were visually inspected.
- An actual first-impact browser check produces six fragments with geometry count unchanged at 581.
- The installed develop-web-game client completed ten bursts through loading, the intro and forward gameplay, with no error artifacts. Final gameplay screenshot inspected.
- Full production hardware soak and analysis both exited 0. All four entrance-start routes matched independently verified outcomes, positions, durations and water hits. Every stability and frame-budget check passed at 2560x1600, FOV 85, requested resolution 1 and `captureBuffer:false`.

| Measurement | Before repair | After repair |
| --- | ---: | ---: |
| Warmed rendered submissions/s | 57.37 | 59.82 |
| Slowest warmed window | 53.26 FPS | 59.52 FPS |
| Required minimum window | 55 FPS | 55 FPS |
| RAF p95 | 16.8 ms | 16.7 ms |
| Slowest initial window | 52.76 FPS | 59.83 FPS |
| Warmed geometry count | 580 to 581 | 582 throughout |
| Warmed textures / programs | 81 / 218 | 81 / 218 |

The loading preparation can upload scenery visible to the initial loading camera as well as the effect; the absolute geometry count is not a geometry-reduction claim. The repaired behavior is no further first-impact allocation during play. Post-GC warmed heap growth was 188,504 bytes, below the unchanged 5 MiB threshold; audio, event history, context health, view/resolution and error checks all pass. Loading readiness was 9.125 seconds versus 9.258 seconds in the earlier run, without a cold-cache claim. All owned test processes ended; the existing server remains intact. The three changed runtime files and runner/analyzer hashes stayed unchanged during acceptance.

Diagnostic artifacts are under `output/under-green/runtime-fix/`: `baseline/` contains fixed-view CPU/upload diagnostics; `live-baseline/` identifies the deferred pool; `shallow-query.json` records query equivalence/timing; `visuals/` contains exact framebuffer comparisons and the first-impact check; `client/` contains installed-client snapshots; `hardware-soak/` contains the final raw report, analysis and ending capture. The before comparison comes from `output/under-green/performance-runner-fix/hardware-soak/`. Diagnostics are separate from production FPS acceptance.

The drive filled during validation. Twenty older Under the Green JSON reports were losslessly compressed using Windows LZX, with SHA-256 verified before/after. No reports were removed. Records are in `compressed-reports.json`.

## Reproduction

With the existing server at `http://127.0.0.1:4187`:

```powershell
node tools/verify-under-green-shallow-query.mjs
node tools/verify-under-green-runtime-visuals.cjs
node tools/profile-under-green-soak.cjs --seconds=300 --viewport=2560x1600 --fov=85 --resolution=1 --output=output/under-green/runtime-fix/hardware-soak
node tools/analyze-under-green-soak.cjs --output=output/under-green/runtime-fix/hardware-soak
```

No acceptance thresholds, warmup rules or expected route outcomes were changed for this fix. Results qualify this local hardware workload only; software gameplay smoke coverage does not establish a software frame-rate budget.
