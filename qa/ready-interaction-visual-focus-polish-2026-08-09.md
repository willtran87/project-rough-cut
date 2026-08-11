# Ready-interaction visual-focus polish

Date: 2026-08-09

## Finding

A native Audit Bell approach had a correct action owner and correct pressure read, but the frame still carried three unrelated navigation elements: a distant Shed Key marker card, the non-active Audit Thatch bypass card, and its amber ground route. After activation, the mandatory Hedge Tunnel breakaway became authoritative but the optional thatch advice returned. Nothing was mechanically wrong, yet the player had to visually arbitrate several directions during the core wait-or-commit and run-for-cover beats.

## Resolution

- Added one pure ready-interaction focus presentation shared by world-marker cards and diagnostics.
- A ready Interact owner keeps its generated art, use footprint, local pressure, and action rail while distant navigation cards yield.
- A second reachable action is never hidden; it remains visible and uses the existing ownership copy.
- Optional footing advice now yields as one visual unit: both its plaque and its ground route defer.
- The same optional advice remains deferred when an immediate collision, footing, or mandatory breakaway route owns navigation.
- A footing hazard the player is actually inside always remains visible and authoritative.
- Physical object and hazard art, collision footprints, the persistent course map, interaction availability, movement, Joe, signal timing, scoring, detection, and survival behavior are unchanged.

## Native interaction evidence

At the Audit Bell decision point:

- Audit Bell owned `ENTER — RING AUDIT BELL` at 11 meters.
- Joe remained on patrol at 102 meters and the existing `LOW PRESSURE` surface remained coherent.
- The Shed Key marker card was deferred.
- The Audit Thatch plaque and optional bypass ground route were deferred by `ready_interaction:audit-bell`.
- The generated bell, planted base, pressure ring, bottom consequence rail, environment, and persistent map remained visible.

After pressing Enter:

- Field checks advanced from 0/3 to 1/3.
- Audit Bell began its existing signal with 6.3 seconds remaining.
- The 59-meter Hedge Tunnel breakaway became the immediate navigation owner.
- The optional thatch plaque and route remained deferred by `mandatory_noise_breakaway:field-signal-break-audit-bell`.
- No browser errors occurred.

## Responsive and performance evidence

- True browser viewports inspected: 2560x1600, 1280x720, and 800x600.
- At 2560x1600 the centered stage measured 2508x1403.75 CSS pixels with a 26-pixel horizontal gutter.
- At 1280x720 the stage measured 1209.38x673.27 CSS pixels and remained centered.
- At 800x600 the contained stage measured 769.63x428.02 CSS pixels with no HUD, map, pressure, or action-rail overlap.
- Official pre-commit replay: 60 estimated FPS, 3.32 ms average render work, 4.9 ms p95, 29.8 ms observed max, one long frame.
- Official breakaway replay: 60 estimated FPS, 3.13 ms average render work, 3.6 ms p95, 32.4 ms observed max.
- Product readiness: 47/47.
- Deterministic browser scenarios: 87.
- Referenced runtime assets: 48.
- Unreferenced runtime images: 0.
- Release verifier warnings and failures: none.
- Browser errors: none.

No ImageGen asset was needed because this pass protects the legibility of the existing generated station, hazard, landmark, and environment art rather than introducing a new visual object.
