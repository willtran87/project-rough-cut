# Cart ejection animation — 2026-11-09

- Cart failure records the driver's seat transform, selected safe exit, heading and exit side. It adds presentation metadata only; safe placement, controls, collision, Joe's pathing and five-second ejection protection remain unchanged.
- Existing runner replaces the seated driver at the seat, with folded legs and reaching arms. A 0.48-second outward fall leads to a brief sideways brace, then blends back to the normal running pose by 1.15 seconds. Direction follows the chosen exit side; rotated cart seats remain correctly anchored.
- Input affects movement immediately throughout. No animation lock or ragdoll physics. Pause freezes the absolute-time fall, death takes priority, retry clears the actor, and Reduced Motion shows the standing escape pose immediately. Existing wider breakdown framing and damage audio remain.
- Reuses prepared runner geometry/materials. No new shaders, textures, audio voices or first-use geometry uploads.

Verification:

- `verify-cart-ejection.cjs` in hardware and software: seven fall/recovery stages, opposite exits, three additional cart headings, ground clearance, pause, movement during fall, protection, Reduced Motion and resource stability. Same 17 hardware/22 software programs,34 textures,9 voices; no browser errors. Minimum sampled model height 0.0265 m; bracing soles approximately 0.087 m above ground.
- `verify-cart-health.mjs`: real terminal hit, safe spawn, wreck collision, navigation, repairs and all three live-Joe on-foot routes win unchanged at 123.38/80.70/37.90 seconds.
- Software `verify-cart-health-browser.cjs`: real ram-to-breakdown, keyboard/touch/gamepad running, rear view, pause, relays, garage win and retry.
- Software `verify-chase-runover-browser.cjs`: death overrides ejection, body settles correctly, camera/audio/pause/Reduced Motion/retry regression passes.
- Installed standard gameplay client via `verify-presented-client.mjs`: two successful driving bursts; screenshots inspected. Ejection captures inspected at 2560×1600 and 844×390; suite also captures 1280×720.

Evidence and task-start snapshots: `output/cart-ejection/`. Resource reuse is verified, not a broad frame-rate improvement claim. Deferred human playtest: readability of the fall during a moving crash, feel of immediate movement during recovery, and comfort with Reduced Motion.
