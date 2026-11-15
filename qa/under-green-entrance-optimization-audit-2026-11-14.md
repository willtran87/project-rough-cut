# Under the Green: Joe entrance optimization audit

Audit started November 14 and completed November 15, 2026. The user reports one brief freeze when Joe enters, followed by normal play. This audit measures individual frames around the first entrance and a repeated entrance, rather than relying on the previous 30-second FPS windows. Production gameplay code was not changed; prewarming and preparation omissions below are diagnostic browser variants only.

## Confirmed entrance hitch

At simulation time 9.35 seconds, just after the three-second entrance animation, Joe first requests a route. `courseGraph()` lazily constructs the grid and crossing edges on the main thread. `cellsFor(.8)` also builds its walkable-cell cache on demand.

| Same transition | Frame CPU work | Navigation graph construction |
| --- | ---: | ---: |
| First hardware entrance | 41.5 ms | 29.8 ms |
| Repeated hardware entrance | 8.3 ms | 0 ms |
| First hardware entrance, graph prepared before play | 11.1 ms | 0 ms |

The diagnostic prewarming took 41.1 ms outside play. Timing varies with execution state and instrumentation; this shows where the work moves, not that its total cost disappears. The measured hardware hitch is tens of milliseconds, not a reproduced multi-second hardware freeze.

Highest-priority fix for the reported one-time hitch: prepare the immutable navigation graph and walkable grid during loading, before play is enabled. Preserve the same nodes, costs, stable queue ordering, crossing rules and observed-player evidence. Retain it across retries. Do not reduce Joe's aggression or delay his first response to hide the stall.

## Other optimization targets

1. **Software startup presentation and first-use actor resources:** the forced-software diagnostic continued simulation but recorded no new scene-render submission in its first 20-second attempt. The first recorded submission arrived about 39.1 seconds into the two-attempt diagnostic. The debris preparation added in the preceding fix performs a whole-scene render merely to prepare one particle pool, and loading readiness does not await GPU completion. Omitting that call reduced the initial presentation stall to 21.4 seconds; it did not eliminate it. This identifies the whole-scene call as a contributor, not the sole cause. Review the remaining queued loading work, including the baked shadow atlas, separately. Prepare only the real particle buffers with zero indices in an isolated pass, budget other warmup work in small batches and ensure GPU completion before enabling gameplay. Simply deleting preparation would reintroduce the first-impact allocation.

   In the software variant without that preparation, the first actually rendered Joe reveal (second simulation attempt, age 0.30 seconds) took 87.2 ms of frame CPU work: 79.3 ms in renderer submission, including 26.2 ms in program-info reflection and 19.6 ms in texture updates. It issued 100 buffer allocations, 11 texture-storage calls and 417 uniform-location queries. Targeted preparation must cover Joe's real skinned buffers, bone/appearance textures and shader reflection as well as debris. These forced-software figures are instrumented diagnostic observations and do not describe the user's unidentified rendering backend or a native multi-second freeze.
2. **Pursuit replanning and collision queries:** even after graph caching, simulation spikes around subsequent replanning reach approximately 7–9 ms on hardware. The route solver creates fresh search storage, scans nodes for nearest endpoints, smooths routes with repeated line tests, and performs many `solid()`/`onFloor()` checks. Profile those operations separately, cache immutable spatial data, reuse search storage and preserve deterministic route decisions. These are follow-up targets, not all individually measured causes.
3. **Scene submission and material updates:** the entrance corridor's renderer CPU p95 is approximately 8–10 ms. Uniform updates, material/program selection and draw submission are prominent in the CPU profile. Improve batching and conservative visibility/light bounds while retaining artwork, shadows, solid walls and the requested resolution. Check actor culling on native rendering; it currently uses the conservative actor envelope only on software.
4. **Water presentation CPU work:** spray evaluation and water updates remain prominent application samples. Reuse temporary data and precompute invariant spray terms; keep density, timing and the appearance of splashes. This is sustained rendering work, not the observed first-route graph stall.
5. **Absent-actor and HUD work:** Joe's full animation update still runs while he is absent, typically about 0.5 ms at p95. HUD state updates also run every draw. Avoid redundant work where state is unchanged, while maintaining required actor initialization and footstep/contact history. Lower priority than navigation and rendering.
6. **Performance acceptance coverage:** add a first-entrance transition check with per-frame CPU duration, maximum frame gap, render-submission progress and an explicit first-versus-repeat comparison. The existing warmed FPS/heap soak remains useful, but can average away a short hitch or miss a frozen presentation while simulation advances.

## Evidence against other suspected causes

During the measured native entrance/first-pursuit interval, Joe's animation update p95 was about 0.5 ms; no new shader links or texture storage/image allocations occurred, and program count stayed at 218. These measurements do not support simplifying his model or swing animation as the first response. Ordinary bone texture updates still occur; absence of allocation is not absence of GPU work.

## Method and artifacts

`tools/profile-under-green-entrance.cjs` replays the first 20 simulation seconds of an ordinary, verified pilot route twice through the production RAF/update/audio/render loop, at 2560x1600 and FOV 85. It instruments stage CPU durations and WebGL calls, captures a CDP CPU profile and observes long tasks. No forced GC, manual simulation advancement or actor-position playback is used during measurement. Instrumentation adds overhead; these diagnostics are not a replacement for the uninstrumented performance soak or physical-device testing.

Artifacts: `output/under-green/entrance-audit/hardware/`, `prewarmed/`, `software/` and `software-without-preparation/`, each with raw per-frame reports and CPU profiles. All four completed without page/console errors; all owned diagnostic jobs ended and the existing server was preserved.

Reproduction:

```powershell
node tools/profile-under-green-entrance.cjs
node tools/profile-under-green-entrance.cjs --prewarm-navigation --output=output/under-green/entrance-audit/prewarmed
node tools/profile-under-green-entrance.cjs --software --output=output/under-green/entrance-audit/software
node tools/profile-under-green-entrance.cjs --software --skip-debris-preparation --output=output/under-green/entrance-audit/software-without-preparation
```

Implementation order: navigation readiness first for the reported one-time native hitch; targeted GPU preparation/readiness urgently for the fallback path; then replanning/collision and rendering cost. Validate individual entrance frames and first actual presentation in addition to the existing full-route stability test. The broader visual-upgrade goal remains paused.
