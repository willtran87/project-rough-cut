# Back Nine experience pass 38 — terrain cost and cooperative construction

Previous goal turn made progress on terrain-aware running. This pass makes further progress on rendering/startup items 1 and 35; neither is complete. Full scope remains 38 items: 23 implemented/technically verified, 14 in progress, one human-playtest package prepared. User preference remains whole-level death restart from the shed. No human test sessions, commit or deployment.

## Retained changes

`course-terrain.js` avoids redundant one-metre clipping only for horizontal sheets conservatively outside all authored terrain ellipses. Hills and raised border geometry retain the original tessellation. Height sampling, terrain forms, foundations, collision and navigation data are unchanged. An initial broader candidate changed border normals and was rejected; its artifacts are retained under `unrestricted-flat`.

`back-nine-landscape.js` shares generator-based construction between synchronous tooling and asynchronous scene builders. Fairway strips, route quads and estate sections provide scheduling boundaries. The scene also yields after each 24-metre base tile instead of every fourth tile. An eight-millisecond check requests the existing cooperative scheduler between pieces; it cannot preempt an individual geometry operation. Build order, geometry, materials and return values remain identical for the scheduling change. Back Nine import-map versions were refreshed for the three changed modules.

No gameplay, pursuit, controls, lights, textures, sound layers or authored routes were removed. Shared concurrent course/encounter additions are preserved. The current concurrent retry implementation creates a fresh variation seed; the old test assertion requiring the previous seed was updated to verify a valid different seed. Whole-level reset behavior was already present and was retained.

## Verification

Artifacts: `output/back-nine-experience/terrain-cost/`.

- Geometry proof: 147,380 sampled triangle-interior points agree with the shared height field; 77,545 height queries exactly match the previous sampler. Projected surface coverage stays within numerical tolerance. Raised-border position/normal/UV arrays match exactly. Fixture triangles fall from 79,729 to 40,213. Baked navigation signature remains 1799212627.
- Builder equivalence: 1,743 emitted pieces, geometry attributes/indices, transforms, material keys, order and return values have identical SHA-256 hashes before, after synchronously, and after asynchronously. A deterministic construction clock exercises 500 scheduling boundaries. Course data/navigation remain unchanged.
- Existing construction scheduler checks pass ordinary-task deadlines, independent scene clocks, fallback, cancellation and hidden-tab pause/resume.
- Frozen-world hardware/software comparisons isolate ground topology in the same scene. Images are **not pixel-identical**: software comparisons change 238–6,256 RGBA channels out of 2,073,600, with mean absolute differences of 0.00030–0.01727/255. Differences are sparse surface/interpolation edges. Inspected before/after images preserve composition and detailed art. No extra buffer uploads after warm-up.
- Installed standard gameplay client: two movement/turn/stop bursts at 2560×1600 with live Joe and no invulnerability. Runner moves from y371 to y379.66, remains alive and retains 14 audio voices. Latest screenshot/state inspected; no console-error artifacts. Software dynamic rendering falls to 640×360 and reports 101.5ms completion p95 in this unpaired capture, so substantial performance work remains.
- Twelve actual death/retry cases across hardware and software: R, Enter and button at both later regions return to (0,14), health 100, offline relays, fresh repair reserves, reset gates/destruction, cleared held controls and working fresh input. No repeated intro, asset requests, decoded-image/texture/program/buffer growth, scene reconstruction or additional audio context. Six software action intervals 74–234ms; six hardware intervals 20–59ms. These include the test's advance call, not isolated input-latency benchmarks. Current retry views inspected at 2560×1600, 1280×720 and 390×844.

## Measured cost and limits

Four fresh software browsers in baseline/candidate/candidate/baseline order disable network cache and shader disk cache. Baseline uses saved pre-change terrain and pre-yield scene/landscape; all other current modules are shared. The scene snapshot was checked against current source: differences are only this pass's scheduling calls. Two observations per variant are indicative local measurements, not a hardware guarantee; other chats also use this workstation.

| Measure | Before, two runs | After, two runs |
|---|---|---|
| Ready time | 12.878 / 13.757 s | 10.985 / 11.047 s |
| Maximum 16ms timer gap | 915 / 1,080 ms | 360 / 441 ms |
| Maximum observed long task | 908 / 931 ms | 125 / 117 ms |
| Buffer upload bytes | 39,016,306 | 31,600,982 |
| Largest geometry preparation batch | 4,551,512 bytes | 2,238,206 bytes |

This saves 7,415,324 bytes of geometry uploads. Both variants retain 2,132 uploads, 29 software programs, 46 textures and ten baked surfaces. Resource totals include concurrent detail additions and must not be compared directly with older passes. Terrain-only loading measurements before the scheduling change are preserved separately in `software-loading-terrain-only.json`.

Six moving-view paired probes use 960×540 rendering, live presentation/effects and deterministic camera/actor movement. They are **not** complete physical driving playthroughs. Median/p95 milliseconds before → after:

| View | Median | p95 |
|---|---|---|
| Wet foliage | 65.0 → 62.9 | 79.1 → 79.0 |
| Close mower | 46.1 → 42.1 | 52.0 → 48.0 |
| Range on foot | 59.0 → 59.1 | 71.0 → 66.0 |
| Reservoir | 55.9 → 50.0 | 64.0 → 55.9 |
| Clubhouse | 50.9 → 48.0 | 56.0 → 58.9 |
| Opening | 44.0 → 42.0 | 47.9 → 50.8 |

Static software results likewise improve several views but include regressions. Hardware timings are mixed near 7–8ms; no hardware FPS improvement is claimed. Persistent startup timer gaps and gameplay p95 spikes keep items 1/35 open. Next work: remaining atomic construction/render costs and whole-course pacing, route tradeoffs, barrier/lighting readability and encounter acceptance. Human playtests stay prepared for later. All owned jobs are terminal; server 4187 retained.
