# Delivery Toast Sightline Polish — 2026-08-02

## Outcome

Repeatable Delivery awards no longer cover the crosshair, nearby cover silhouette, or the obstacle/route geometry the player is actively reading. The existing 284×58 score toast now occupies the open upper-center sky lane while the persistent objective, Joe Attention panel, course map, world labels, and bottom consequence rail retain their established positions.

The Change Request pickup instruction was also shortened to `CR-017 SECURED — BANK +650 AT AN EXIT, OR USE NEAR JOE TO FORCE REVIEW.` so the complete bank-versus-appeal decision remains readable without dropping to the bottom rail's smallest text size.

No score rules, award timing, Delivery chains, pickup radii, Joe behavior, collision geometry, navigation, or accessibility settings changed.

## Focused validation

The focused browser replay exercised four exact post-interaction states:

- Change Request secured
- ordinary golf-ball recovery
- golf-ball recovery with Joe 13 meters away
- Change Request secured with Reduced Camera Motion enabled

All four reported `delivery_award` as the presentation focus, `deliveryVisible: true`, `joeStateVisible: false`, zero permitted threat-caption cards, and no console/page errors. Visual review confirmed the crosshair and central obstacle/cover read remained unobstructed in normal and reduced-motion frames. The dangerous recovery correctly allowed the more urgent `JOE IS LOOKING` bottom warning to replace the routine pickup explanation while preserving the `PRESSURE RECOVERY +140` toast.

Evidence:

- `output/repeatable-pickup-feedback-validation/01-change-request.png`
- `output/repeatable-pickup-feedback-validation/02-safe-ball.png`
- `output/repeatable-pickup-feedback-validation/03-dangerous-ball.png`
- `output/repeatable-pickup-feedback-validation/04-change-request-reduced.png`
- `output/repeatable-pickup-feedback-validation/audit-report.json`

## Required official client

The official `web_game_playwright_client.js` completed the existing golf aim/landing/settle route in `first_hole` with no browser error artifact. The settled state returned to `joe_dialogue` focus after the shot handoff and sampled 2.06 ms average / 2.40 ms last canvas render work.

Evidence:

- `output/delivery-toast-placement-official-2026-08-02/shot-0.png`
- `output/delivery-toast-placement-official-2026-08-02/state-0.json`

## Cleanup

Every focused and official browser context closed after capture. A final process audit found zero matching test browser processes. The user-requested local server remains healthy at `http://127.0.0.1:4173/` with HTTP 200.
