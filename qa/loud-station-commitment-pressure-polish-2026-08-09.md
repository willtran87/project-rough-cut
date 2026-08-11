# Loud-station commitment-pressure polish

Date: 2026-08-09

## Finding

A real-input route through Audit Bell, Water Hazard, Clubhouse Crossing, and Field Log reached the second mandatory station while Joe was already searching nearby. The existing commitment rail truthfully named the loud signal, Joe verification, and escape cover, but the in-world station looked as safe as it did when Joe was far away. The player could act, yet lacked a local read for the intended wait-or-commit decision.

## Resolution

- Added four presentation-only tiers: `LOW PRESSURE`, `WATCH JOE`, `HIGH RISK`, and `CRITICAL`.
- Derived the tier from Joe's current mode, distance, line of sight, and alert without forecasting or changing his behavior.
- Applied the shared tier accent to the generated station ground ring, a compact label directly above the station art, and the existing bottom action frame.
- Preserved the exact signal duration, named cover, action binding, interaction availability, and post-commitment route.
- Declared the contract explicitly as non-blocking with no gameplay effect.

## Runtime evidence

### Low-pressure Audit Bell

- Joe mode: `patrol`
- Joe distance: 101.97 meters
- Station read: `LOW PRESSURE // JOE 102m`
- Interaction blocking: false
- Gameplay effect: none
- Browser errors: none

### High-pressure Field Log

- Player-to-station distance: 9.73 meters
- Joe mode: `search`
- Joe distance: 45 meters
- Joe alert: 0.88
- Station read: `HIGH RISK // JOE 45m`
- Existing consequence: `LOUD SIGNAL 5.6s // JOE WILL VERIFY // BREAK TO SERVICE CART`
- Enter result: field checks advanced to 2/3
- Active signal after commitment: Field Log, 5.5 seconds remaining
- Service Cart breakaway distance: 50.05 meters
- Browser errors: none

The pressure label and pre-commitment ring retire immediately after activation. The existing station signal, Joe Attention state, course-map signal, and breakaway presentation then own the consequence.

## Verification

- `node --check web/game.js`: pass
- `node --check tools/verify-release.mjs`: pass
- `node tools/verify-release.mjs`: pass
- Product readiness: 44/44
- Deterministic browser scenarios: 85
- Referenced runtime assets: 48
- Unreferenced runtime images: 0
- Source-only runtime masters: 0
- Official client performance: 60 estimated FPS, 3.93 ms average, 5.3 ms p95, 30.2 ms observed max
- Visual inspection: 800x600, 1280x720, and 2560x1600

The compact, standard, and high-resolution frames keep the pressure label above the physical station, retain the full interaction footprint, avoid the persistent map and HUD, and preserve the complete consequence line. No ImageGen asset was needed because this pass improves decision communication around the existing dedicated generated Night Order station atlas.
