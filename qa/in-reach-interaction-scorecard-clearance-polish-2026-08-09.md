# In-Reach Interaction Scorecard-Clearance Polish — 2026-08-09

## Finding

A real-input route continued beyond Audit Bell through trail pressure, the Water Hazard, and Clubhouse Crossing to the generated Field Log kiosk. At 9.73 meters the correct action and 5.6-second loud-signal consequence were readable, but a newly banked `CONTACT BROKEN // RISK PREMIUM +166` scorecard occupied the same center-world lane. It covered the kiosk body, planted base, and much of the mint interaction ring at the exact commitment point.

## Resolution

- Added one authoritative `riskPremiumAwardPresentation` model.
- Risk Premium keeps its dramatic center lane when no ready world interaction owns the scene.
- While any in-reach object owns Interact, the scorecard moves to the open top-center lane.
- The earned amount, tier, timer, score, Risk Premium logic, Joe state, interaction radius, objective route, and survival mechanics are unchanged.
- Text diagnostics expose the card bounds, relocation state, protected target, no-gameplay-effect contract, and presentation rule.
- Added the `in_reach_interaction_scorecard_clearance` readiness contract and static verifier markers.

## Runtime verification

- The real route reached Field Log at `(-93, 411)`, 9.73 meters from the station.
- Interaction owner: Field Log, ready, `ENTER — STAMP FIELD LOG`.
- Consequence: `LOUD SIGNAL 5.6s // JOE WILL VERIFY // BREAK TO SERVICE CART`.
- Risk Premium remained visible with `+166` and 1.68 seconds remaining.
- Its protected presentation moved from center Y 434 to center Y 224 with card bounds 494–786 by 174–256.
- The Field Log art, contact shadow, use ring, prompt, consequence, map, and scorecard were simultaneously readable.
- Enter advanced field checks from 1/3 to 2/3, created `FIELD LOG SIGNAL // 5.5s`, and preserved the Service Cart breakaway route.
- Browser errors: none.

## Static, performance, and visual verification

- `node --check web/game.js`
- `node --check tools/verify-release.mjs`
- `node tools/verify-release.mjs`: passed with 48 referenced runtime assets, 60.75 MB, no unreferenced images, no source masters, and all 85 deterministic action scenarios.
- Official browser replay: 43/43 readiness, 60 estimated FPS, 3.11 ms average render, 4.2 ms p95, and 27.6 ms observed maximum.
- Direct visual inspection passed at 800x600, 1280x720, and 2560x1600. The scorecard remains contained and readable without covering the generated station or protected HUD/map regions.

No ImageGen asset was needed. The change protects and reveals the existing generated Field Log artwork rather than replacing it.
