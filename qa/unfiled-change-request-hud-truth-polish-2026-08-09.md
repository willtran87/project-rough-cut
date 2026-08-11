# Unfiled Change Request HUD-truth polish

Date: 2026-08-09

Scope: refine the existing Change Request pickup and risk/reward communication without changing placement, interaction radius, score, Emergency Appeal timing, Joe behavior, route geometry, or level content.

## Finding

A full native-input replay completed Audit Bell, navigated around the solid Black-Water Reeds footprint, and secured `CR-017` at seven meters. The generated clipboard, paper burst, threat caption, Joe bark, Field Log handoff, and bottom message all correctly explained the choice: bank +650 at an exit or sacrifice the document near Joe to force review.

After that temporary message yields, the persistent token previously read `CR ✓ +650`. The checkmark rendered correctly, but the copy could imply that the bonus was already awarded even though the exported state correctly reported `filesOnEscape: true` and `filedForThisOrder: false`.

## Resolution

- Centralized the compact Change Request label in `changeRequestHudStatus()` so rendering and release validation share one source.
- Changed the secured but unfiled state to `CR ✓ BANK +650`.
- Preserved the existing available `CR ◇ +650`, close-chase `CR ! APPEAL READY`, and consumed `CR X APPEALED` states.
- Preserved the pickup message, state banner, score calculation, one-use Emergency Appeal, 10–26 meter chase window, 3.6-second review, Joe alert/noise reaction, and generated art.
- Added `unfiled_change_request_hud_truth`; settled readiness is now 53/53.

## Native interaction evidence

The post-change official browser replay used only the public per-frame action client and ordinary mouse, movement, and Interact input. It reported:

- `CR-017` collected at seven meters, still unfiled, with a +650 escape bonus.
- `CR ✓ BANK +650` in the persistent upper-left HUD.
- `CR-017 SECURED — BANK +650 AT AN EXIT, OR USE NEAR JOE TO FORCE REVIEW.` in the temporary bottom rail.
- Emergency Appeal correctly blocked by `joe_not_chasing` while Joe searched 165 meters away with no line of sight.
- Field Log retained the primary objective and world/map route.
- 53/53 readiness, 60 estimated FPS, 2.59 ms average render work, 3.7 ms p95, 30 ms observed maximum, one long frame, and no browser errors.

## Responsive visual verification

- Inspected the same earned secured state at 2560x1600, 1280x720, and 800x600.
- The longer token stayed right-aligned inside the upper-left HUD, cleared the Hole title and Clean Break badge, and retained a readable checked glyph at every size.
- Objective, terrain row, Joe Attention, course map, route thread, pickup particles, fog, moon, layered background, and bottom decision rail remained contained and legible.
- Each document matched its viewport with no horizontal overflow or browser errors.

## Release verification

- `node --check web/game.js`: passed.
- `node --check tools/verify-release.mjs`: passed.
- `node tools/verify-release.mjs`: 48 referenced runtime assets, zero unreferenced images, 87 deterministic action scenarios, zero warnings, and zero failures.
- `git diff --check`: passed apart from existing line-ending conversion notices.

## Asset decision

No ImageGen asset was needed. Direct inspection confirmed the existing generated clipboard, paper fragments, planted course props, and layered course environment already support the interaction; the verified gap was persistent HUD semantics rather than missing world art.
