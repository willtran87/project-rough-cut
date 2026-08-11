# Collision-feedback identity ownership polish

Date: 2026-08-09

## Finding

The official opening-route replay reached the grounds cart while the South Gate set-piece timer was still active. The cart's grounded contact card correctly named the physical blocker, but the larger top banner simultaneously said `SOUTH GATE // SOMETHING KNOCKS BACK`. Suppressing only that banner caused its matching directional threat caption to fall into the center caption lane, so the contradiction had two presentation paths.

## Resolution

- Added one collision-to-banner relationship shared by rendering, diagnostics, and release readiness.
- Active physical rejection and the bounded collision-release echo now give the actual blocker sole ownership of immediate contact identity.
- Unrelated state banners retain their authored timer but do not draw during that ownership window.
- A threat caption matching the deferred banner yields as the same representation instead of resurfacing in the center lane.
- Other unrelated urgent threat captions retain the existing severity-and-recency selection behavior.
- Once the grounded collision presentation clears, still-relevant atmospheric state may resume normally.
- Movement, slide behavior, escape direction, collision geometry, Joe awareness, set-piece scheduling, and caption timers are unchanged.

## Acceptance evidence

The official `release-hardening-gameplay.json` replay ended on the real `service-cart` collision-release echo:

- Collision owner: `service-cart`
- Ownership phase: `release_echo`
- Rule: `one_physical_contact_one_visible_identity`
- South Gate banner: `visible: false`
- Banner deferral: `collision_release_echo`
- Matching caption visibility: `false`
- Visible threat-caption cards: `0`
- Readiness: `27/27`
- Estimated frame rate: `60 FPS`
- Average render: `2.49 ms`
- Render p95: `5.2 ms`
- Observed render maximum: `28.5 ms`
- Asset failures: `0`
- Browser errors: `0`
- Release verification: `48` runtime assets and `80` deterministic action scenarios, with no warnings or failures

## Visual evidence

The same collision ownership was inspected at:

- `2560x1600` — document `2560x1600`, centered canvas `2508x1403.75`
- `1280x720` — document `1280x720`, centered canvas `1209.375x673.265625`
- `800x600` — document `800x600`, centered canvas `769.625x428.015625`

Across all three viewports, the large generated grounds cart retained its physical scale and grounding, HUD and map remained contained, and neither the top banner nor center caption mislabeled the cart contact as a South Gate event.
