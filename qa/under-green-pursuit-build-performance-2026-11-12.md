# Pursuit build performance — November 12

Fresh qualification after dry-route steering, short evidence-led searches, close-cover repositioning, guard behavior, and bunker-bank scenery. The preceding goal turn made runtime progress; this turn supplies current-build sustained evidence and identifies the next gameplay investigation.

## Five-minute production runs

Hardware and software runs were sequential. Each used the real update/render/audio/HUD loop at viewport 2560×1600, FOV 85, requested resolution 1, and `preserveDrawingBuffer:false`. Independently verified ordinary-input tapes drive live Joe through walking dry, walking wet, sprint and checkpoint 3. Enemy positions are not replayed. Established thresholds are unchanged.

| Measurement | RTX / ANGLE D3D11 | SwiftShader fallback |
| --- | ---: | ---: |
| Warmed rendered frames/s | 59.98 | 30.88 |
| Slowest warmed window | 59.92 | 28.38 |
| Required minimum window | 55 | 24 |
| RAF p95 | 16.7ms | 16.7ms |
| Slowest initial window | 59.61 | 29.45 |
| Ready time | 1.506s | 1.245s |
| Warmed post-GC heap range | 15.91–16.78MiB | 17.69–18.74MiB |
| Final minus first warmed heap | −537,000 bytes | −468,640 bytes |

Both runners and analyzers pass. All four route outcomes match time, position, mode and water-hit count: 75.983s dry, 77.433s wet, 51.500s sprint, 20.983s checkpoint; each has zero water hits in these tapes. Resources stabilize at 290 geometries, 56 textures, 21 programs and 16 audio voices. Event/telemetry bounds pass, software GPU queue stays within one outstanding frame, and there are no context losses or console/page errors.

Actual scene resolution is 1600×1000 on hardware and settles at 480×300 on software beneath its 960×600 ceiling. HUD remains at native viewport resolution. Both ending screenshots were opened: keeper controls and relief feedback remain visible; software scene text/details are visibly coarser. These views do not establish every-sign/mobile readability.

The three software initial windows are 31.94, 29.45 and 31.33 frames/s. This run meets the same floor during initial traversal, but it does not prove the earlier first-use variability fixed or identify its cause. No renderer/startup policy was changed in this pass. Cold caches, slow storage/network, physical mobile/integrated GPUs and hour-long thermal behavior remain unqualified.

## Source identity and reproduction

Artifacts: `output/under-green/pursuit-build-soak/`, with raw reports, analyses, ending captures and before/after content hashes. `snapshot-under-green-build.cjs` records every web and asset file plus the profiling harness. The initial snapshot contains 1,068 files; the final snapshot contains 1,070. Fourteen changed/added files belong to concurrent work outside the current 79-file local Under the Green JS/CSS dependency graph. No measured dependency, asset or profiling harness file changed. Bare import-map names are excluded from the graph but every web file remains in the wider content snapshot. This is not a clean-repository or idle-host claim.

```powershell
node tools/profile-under-green-soak.cjs --seconds=300 --viewport=2560x1600 --fov=85 --resolution=1 --output=output/under-green/pursuit-build-soak
node tools/analyze-under-green-soak.cjs --output=output/under-green/pursuit-build-soak
node tools/profile-under-green-soak.cjs --software --seconds=300 --viewport=2560x1600 --fov=85 --resolution=1 --output=output/under-green/pursuit-build-soak
node tools/analyze-under-green-soak.cjs --software --output=output/under-green/pursuit-build-soak
```

Hardware session 78983 and software session 3161 both exited 0. No test process from this pass remains live. Existing server and unrelated work are preserved. No game runtime changed during this pass, so an additional installed gameplay-client run is unnecessary; actual production gameplay was measured and captures inspected.

## Next gameplay evidence

The old 144-case balance report remains a failed historical artifact, not current qualification. Replayed its failed crouch/offset-8.5 pair against current code: fixed dry policy is caught at 32.533s; fixed wet policy is caught at 63.117s with three water hits. Neither hangs now. The cue-responsive policy from the same initial state completes in 42.650s with zero hits, using actual rear observations, pace changes and dry choices at both range outlets. This establishes an available responsive route, not an unavoidable-loss judgment or broad balance acceptance.

Retained inputs and outcomes: `cautious-route-followup.json` and `cautious-reactive-followup.json`. Next refresh the continuous route-choice study, distinguish fixed-stance constraints from the actual advertised pace/route options, and inspect failures before changing geometry or slowing Joe. Do not rerun the same unchanged soak to replace passing numbers. All 44 review items remain in scope; human tension/comprehension/listening and physical-device validation remain distinct from this engineering evidence.
