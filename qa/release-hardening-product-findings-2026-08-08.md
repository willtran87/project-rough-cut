# Release hardening and product-findings closure

Date: 2026-08-08

## Outcome

The comprehensive product audit was converted into concrete runtime, accessibility, navigation, payload, and verification changes. The current pass deliberately refines the existing vertical slice rather than expanding its scope.

## Implemented findings

- Replaced eager image decoding with boot, course, and result phases. Four concurrent requests are allowed, every image decodes before it is marked ready, progress remains visible, and failed art falls back without deadlocking the menu.
- Prewarmed the first course render behind the transition and separated startup samples from controllable gameplay telemetry. Text state now reports average, p95, p99, maximum, long-frame counts, presentation timing, and adaptive-tier changes.
- Reduced the deployed art payload from approximately 98.2 MB to 60.75 MB. Twenty-nine source-only, superseded, or unreferenced images and prompt records now live in `assets/source-atlases/`; no referenced runtime art was removed.
- Added persisted Atmosphere Density and High-Contrast Routes controls. The latter strengthens the obstacle-aware ground thread, bypass underlay, dash cadence, and reflector clarity while leaving gameplay geometry unchanged.
- Added a polite live status region and concise hidden control instructions for assistive technology. The canvas references both, retains visible keyboard focus, and the document now carries canonical, Open Graph, and Twitter metadata.
- Added `tools/verify-release.mjs` to enforce the asset, source-master, PNG, syntax, metadata, accessibility, and deterministic action-file contracts. An optional `--url` adds a deployed-site smoke test.
- Added deterministic settings and gameplay hardening scenarios. Existing menu, briefing, settings, collision, and movement routes remain available under `web/test-actions/`.

## Measured evidence

- Runtime asset contract: 48 referenced images, 60.75 MB total, 2.45 MB largest file, zero source masters, zero unreferenced runtime images, and zero load failures in the verified course run.
- After the one-time course prewarm, a representative gameplay run measured 2.89 ms average canvas render time, 4.0 ms p95, 4.8 ms maximum, zero long render frames, and an estimated 60 FPS.
- The 2560x1600 browser capture centered a 2508x1403.75 canvas with zero body overflow. The 390x844 portrait capture kept the complete 16:9 canvas visible with zero overflow; real coarse-pointer portrait devices receive the rotation hint.
- The settings capture retained all seven presentation controls, the maximum-size caption preview, one-pixel bottom padding, six-pixel footer clearance, and no overlap.

## Human validation still required

Automation cannot replace feel testing on a range of physical devices. Before a tagged public release, perform one keyboard-and-mouse run, one controller run, one touch-device run, and a 10-15 minute mid-tier laptop session. Use the new telemetry to record any repeatable stall or readability issue; do not tune collision, Joe awareness, or suspense cadence from a single anecdotal run.
