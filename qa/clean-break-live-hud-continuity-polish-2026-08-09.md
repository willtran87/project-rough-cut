# Clean Break live-HUD continuity polish

Date: 2026-08-09

## Finding

Clean Breaks had immediate reward feedback and complete victory/capture continuity, but their count disappeared after the reward rail expired. Because the course is long and each station consequence remains dangerous, the player could spend several minutes without seeing whether the risky signal-mask tactic had advanced a run goal.

## Resolution

- `cleanBreakHudPresentation()` maps the shared authoritative run ledger into visibility, `CLEAN n/3` copy, earned/perfect tone, and hierarchy metadata.
- The badge is absent at `0/3`, mint after one or two masks, and gold at `3/3`.
- Compact and expanded HUDs place it on the right side of the existing objective row. The objective uses fitted text only while the badge exists and retains the larger instruction lane.
- No row, permanent meter, control hint, or additional card was introduced.
- `fieldChecks.signalBreakawayRecord.liveHud` exposes exact completed IDs, count, requirement, field-only Delivery bonus, visibility, copy, tone, placement, and instruction-priority policy.
- `clean_break_live_hud_continuity` validates perfect and empty states. The static release verifier requires the same placement and readiness markers.

## Native interaction evidence

The official authored action first filed Audit Bell but did not complete the named-cover hold. Its final state correctly reported `CLEAN 0/3`, `visible: false`, and no completed breakaway even though the mandatory field-check count had advanced to one.

A live-waypoint keyboard route then exercised the complete positive chain:

- Filed Audit Bell through the normal Interact path.
- Followed the authoritative collision-aware breakaway waypoints.
- Used sprint for the long retreat, then returned to ordinary movement early enough for noise to decay.
- Reached 3.06m from the target behind exact blocker `audit-arch-right`.
- Held still and quiet for 0.90/0.90 seconds.
- Recorded `signal_masked_under_named_cover` and `audit-bell` in completed breakaways.
- Waited until the 2.65-second reward had expired.
- Retained `CLEAN 1/3` while Field Log was again the active objective and Joe remained live at 90m.

The native completion finished at 60 estimated FPS with 6.1ms render p95, 32.8ms observed max, 24/24 readiness, and no browser errors. Its adaptive driver changed no game state directly.

## Visual inspection

- 2560x1600: document 2560x1600; canvas 2508x1403.75.
- 1280x720: document 1280x720; canvas 1209.38x673.27.
- 800x600: document 800x600; canvas 769.62x428.02.
- A separate manual-H capture verified the expanded 1280x720 dossier.
- Compact and expanded objective copy remained legible beside the badge, with no overlap against Change Request state, course art, Joe Attention, map, route feedback, or the bottom tactical rail.

## Release evidence

- `node --check web/game.js`: passed.
- `node tools/verify-release.mjs`: passed with 48 referenced runtime images, 60.75MB, 79 valid action scenarios, zero warnings, and zero failures.
- Final fixture-free official replay: `first_hole`, 24/24 readiness, 60 estimated FPS, 3.6ms render p95, 29.4ms observed max, and no browser errors.
- `clean_break_live_hud_continuity`: passed for empty suppression, perfect copy/tone, placement, and objective priority.

## Remaining physical gates

Keyboard/mouse, standard controller, touch hardware, and a sustained 10–15 minute mid-tier device session remain human release gates. The software-side interaction path, HUD composition, input methods, diagnostics, readiness contract, and responsive states are implemented.
