# Sustained collision-feedback emphasis polish — 2026-08-04

## Goal

Keep collision guidance authoritative during sustained wall scraping without leaving the complete orange impact treatment at maximum intensity indefinitely.

## Implementation

- Fresh collision contact retains full visual emphasis for 180 milliseconds.
- A continuously refreshed contact settles over the following 420 milliseconds to 66% emphasis.
- The grounded footprint, blocker name, tether, escape instruction, and movement chevron remain visible throughout.
- A new obstacle ID or a nearly expired re-contact resets the contact age and restores full impact emphasis.
- Releasing contact uses the existing feedback timer fade, capped by the current scrape strength so the overlay never brightens on release.
- Reduced Camera Motion switches from full impact to the steady state without interpolating opacity.
- Text diagnostics expose `fresh_impact`, `impact_settle`, `steady_scrape`, `settled_release_hold`, and `release_fade` modes plus emphasis, age, progress, refresh, and target strength.

## Preserved behavior

Player collision, stepped movement, obstacle identity and geometry, escape-direction calculation, feedback duration, collision audio cooldown, wake and pursuit warnings, Joe dialogue and AI, detection, scoring, map, subtitle settings, and generated art are unchanged.

## Validation

- `node --check web/game.js`
- `node --check output/validate-route-pressure-visual.mjs`
- `node output/validate-route-pressure.mjs` — 18/18 checks passed with no browser errors.
- `node output/validate-route-pressure-visual.mjs` — 348/348 checks passed across:
  - 2560x1600 high resolution
  - 1280x720 standard
  - 844x390 compact
  - 1280x720 Reduced Camera Motion
- The visual matrix captures fresh impact, midpoint settlement, steady scrape, and release fade before continuing through repeated-contact dialogue and all prior route, interaction, and cover checks.
- Direct screenshot inspection confirmed the contact card and escape direction stay readable at 66% while the course art regains visual priority. Reduced Camera Motion keeps the state distinction without tweening.
- Official uninstrumented browser smoke:
  - screenshot/state: `output/collision-feedback-emphasis-official-2026-08-04`
  - average canvas render: 6.08ms
  - final canvas render: 1.80ms
  - rendered frames: 103
  - browser-error artifact: none

## Human follow-up

Test rapid transfers between adjacent obstacles during pursuit. If the steady state feels too strong or too faint, tune only its 66% emphasis; retain full strength for genuinely new contact and preserve the existing escape guidance.
