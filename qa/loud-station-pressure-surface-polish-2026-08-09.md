# Loud-station pressure-surface polish

Date: 2026-08-09

## Findings

The official Audit Bell frame showed a mint low-pressure outline surrounding the generic amber in-reach fill. The words were correct, but the physical decision surface communicated two states at once.

A native golf-ball diversion exposed a semantic issue in the same model. Joe entered `investigate` at 119 meters and the station immediately reported `HIGH RISK`, even though the player had spent a limited resource to redirect him successfully. The mode alone outweighed meaningful physical separation.

When Joe later closed to 78 meters, his active bark subtitle occupied the generated bell, its planted base, and the center of the use footprint. The flavor line remained readable but hid the object and consequence the player needed to evaluate.

## Resolution

- Added tier-specific ground-ring profiles for fill, stroke alpha, line weight, pulse rate, pulse amount, and motion identity.
- Kept all non-station interaction rings on their established generic presentation.
- Made long-range investigation and search `WATCH JOE`; active sweeps escalate to `HIGH RISK` at 78 meters, ordinary proximity escalates at 54 meters, and high alert can escalate within 90 meters.
- Preserved `CRITICAL` for chase, line of sight, or 24-meter proximity.
- Kept Reduced Camera Motion static while retaining the same tier, color, line weight, and fill.
- Relocated a visible Joe bark to a protected top-center baseline while any ready world object owns Interact.
- Preserved the bark text and timer rather than suppressing or replacing Joe's characterization.

## Native gameplay evidence

### Low pressure

- Target: Audit Bell
- Joe mode: patrol
- Joe distance: 101.97 meters
- Local read: `LOW PRESSURE // JOE 102m`
- Ring: mint outline, mint translucent fill, steady profile

### Deliberate golf-ball diversion

- Joe mode at long range: investigate
- Joe distance: 119 meters
- Expected and verified tier: `WATCH JOE`
- Counterplay value: preserved; no false high-risk warning

### Closing sweep

- Joe mode: search
- Joe distance: 78 meters
- Local read: `HIGH RISK // JOE 78m`
- Ring: amber outline, amber translucent fill, urgent profile
- Joe subtitle: relocated above the station decision lane
- Interact blocking: false
- Gameplay effect: none

### Commitment

- Enter remained available during high pressure.
- Audit Bell advanced field checks to 1/3.
- The existing Audit Bell verification signal remained active at 6.2 seconds.
- The existing Hedge Tunnel breakaway remained unchanged.

## Verification

- `node --check web/game.js`: pass
- `node --check tools/verify-release.mjs`: pass
- `node tools/verify-release.mjs`: pass
- Product readiness: 45/45
- Deterministic browser scenarios: 86
- Referenced runtime assets: 48
- Unreferenced runtime images: 0
- Source-only runtime masters: 0
- Official client: 2,510 rendered frames, 60 estimated FPS
- Official render performance: 2.74 ms average, 3.8 ms p95, 35.5 ms observed max
- Browser errors: none
- Visual inspection: 800x600, 1280x720, and 2560x1600

No ImageGen asset was required. The pass makes the existing dedicated generated Night Order art more coherent, preserves smart counterplay, and keeps Joe's dialogue flavor without allowing optional presentation to conceal the player's immediate action.
