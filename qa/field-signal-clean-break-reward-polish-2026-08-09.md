# Field-signal Clean Break reward polish

Date: 2026-08-09

## Finding

The mandatory field-check breakaway correctly redirected the player behind named cover, but `HOLD QUIET` was only a presentation state. Reaching the safe point produced no mechanical confirmation, score consequence, or durable outcome evidence. Native retreat testing also showed that the original Audit Bell signal could expire just before a conservative backpedaling player reached the authored target, leaving no time for a truthful quiet hold.

## Resolution

- `activeFieldActionBreakaway()` now distinguishes proximity, exact sight-blocker confirmation, quiet progress, and a completed mask.
- Quiet progress builds only while the player is motionless, below the movement-noise threshold, behind the authored cover, and outside pursuit. It reaches completion at 0.9 seconds.
- Signal expiry records one of four inspectable outcomes: masked under named cover, left cover, movement/noise at expiry, or incomplete hold.
- A successful outcome awards a 130-point base `SIGNAL BREAKAWAY` Delivery beat. The field family is capped at three, matching the three mandatory stations; survival and objective progression never depend on scoring the reward.
- The reward owns `CLEAN BREAK — Joe verified the station, not your route.` for 2.65 seconds. Joe's state and turf-evidence search remain live in the Attention panel without replacing the earned confirmation.
- A dedicated amber-to-mint world effect visualizes the station signal collapsing into cover protection.
- Signal windows are 6.4 seconds at Audit Bell, 5.6 seconds at Field Log, and 5.0 seconds at Release Review. Readiness requires each window to cover its authored route at a conservative 14m/s retreat speed, the full quiet hold, and a 0.55-second settling margin.

## Native completion evidence

A clean career run used ordinary keyboard input through the opening route, filed Audit Bell, followed the live collision-aware breakaway waypoints, and crouched without moving at the destination.

- Safe-point distance at expiry: 6.71m inside the 8m radius.
- Exact sight blocker: `audit-arch-right` / Hedge Tunnel.
- Quiet hold: 0.90 / 0.90 seconds.
- Outcome: `signal_masked_under_named_cover`.
- Reward record: Audit Bell added to completed breakaways and Delivery advanced.
- Joe after resolution: search at 63m; sprint turf evidence remained actionable.
- Objective handoff: `field-log / current_is_nearest`, seven obstacle-aware waypoints.
- Browser errors: none.

The accelerated native audit intentionally batches virtual frames and is not used for performance acceptance. The official per-frame replay remained the authoritative frame-budget result.

## Release evidence

- `node --check web/game.js`: passed.
- `node tools/verify-release.mjs`: passed with 48 referenced runtime images, 60.75MB, 79 valid action scenarios, zero warnings, and zero failures.
- Official release client: 21/21 readiness, 60 estimated FPS, 3.6ms render p95, 29.2ms observed max, and no browser errors.
- Official activation state: `field_signal_breakaway_override`, two route waypoints, 6.3 seconds remaining, exact named target and 0.9-second hold contract exposed.

## Visual inspection

- 2560x1600: document 2560x1600; canvas 2508x1403.75.
- 1280x720: document 1280x720; canvas 1209.38x673.27.
- Coarse-touch 390x844: document 390x844; canvas 375.22x208.67; rotation prompt visible.
- All three sizes completed Audit Bell's Clean Break, retained the full course/map/HUD composition, kept the reward rail fitted, and produced no browser errors or page overflow.

## Remaining physical gates

Keyboard/mouse, standard controller, touch hardware, and a sustained 10–15 minute mid-tier device session remain human release gates. The software-side input paths, visual states, readiness contract, and diagnostics are implemented.
