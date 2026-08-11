# Loud-station pressure-transition stability polish

Date: 2026-08-09

## Finding

The native golf-ball diversion replay repeatedly moved Joe across the 78-meter watch/high boundary while the player remained inside the Audit Bell footprint. The underlying samples were correct, but a presentation derived independently every frame could change the outline, translucent fill, pulse profile, label, and action frame for only a few frames before changing back. That is technically responsive but visually noisy and difficult to trust.

## Resolution

- Added run-local pressure-transition memory owned only by the currently ready loud station.
- A newly reached station snapshots current pressure immediately.
- Sustained non-critical escalation confirms after 0.18 seconds.
- Improving pressure confirms after 0.38 seconds.
- A raw tier returning to the visible tier cancels the pending transition.
- Leaving, changing, or completing the interaction clears the memory.
- `CRITICAL` bypasses stabilization immediately.
- The stable tier owns outline, fill, pulse, label, and frame while live distance, mode, sightline, and alert remain current.
- No Joe AI, detection, speed, route, signal, interaction, scoring, survival, audio, or objective behavior changed.

## Native boundary evidence

The pressure state was sampled every two frames while the player crouched inside the Audit Bell footprint after a real golf-ball throw.

1. Joe entered long-range investigation at 119 meters and the station snapped to `WATCH JOE` when it regained interaction ownership.
2. At 78 meters, raw pressure touched `high` for approximately 0.13 seconds. The visible tier remained `watch`, the pending transition cleared when raw pressure returned to watch, and the change count remained zero.
3. Patrol recovery produced raw `low`; the visible watch tier held for the 0.38-second confirmation and then settled to low once.
4. A fresh search produced raw `watch`; low promoted after the 0.18-second escalation confirmation.
5. A later sustained approach produced raw `high`; watch promoted after 0.18 seconds and remained stable at 75 meters.
6. At 23 meters, raw and visible tiers became `critical` in the same sampled frame.

## Commitment regression

A second native branch stopped at stable `HIGH RISK` with Joe searching at 72 meters and pressed Enter.

- Field checks advanced from 0/3 to 1/3.
- The active source remained Audit Bell.
- The existing signal reported 6.2 seconds remaining.
- The Hedge Tunnel breakaway remained active.
- Completed-station pressure memory reset to an empty owner.
- Browser errors: none.

## Verification

- `node --check web/game.js`: pass
- `node --check tools/verify-release.mjs`: pass
- `node tools/verify-release.mjs`: pass
- Product readiness: 46/46
- Deterministic browser scenarios: 86
- Referenced runtime assets: 48
- Unreferenced runtime images: 0
- Source-only runtime masters: 0
- Official client: 1,284 rendered frames, 60 estimated FPS
- Official render performance: 3.17 ms average, 4.0 ms p95, 31.2 ms observed max
- Official browser errors: none
- Visual inspection: 800x600, 1280x720, and 2560x1600

The frame-by-frame diagnostic sampler intentionally advances and serializes state far more aggressively than ordinary play, so performance acceptance comes from the required official client rather than that diagnostic harness. No ImageGen asset was needed because this pass stabilizes the presentation of the existing dedicated generated station family.
