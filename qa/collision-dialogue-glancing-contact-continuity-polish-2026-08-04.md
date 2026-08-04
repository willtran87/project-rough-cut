# Collision-dialogue glancing-contact continuity polish — 2026-08-04

## Goal

Keep collision correction visually authoritative across repeated glancing impacts without discarding readable Joe dialogue or extending its lifetime.

## Implementation

- A deferred bark now requires 120 milliseconds of uninterrupted collision clearance before it can return.
- Any new impact during that interval restarts the stable-clearance check.
- The bark timer continues counting down during contact and clearance; no reading time is added.
- Remaining time is checked again before release. Dialogue below 0.72 seconds retires without replay, replacement, or a brief flash.
- Standard presentation retains the 160-millisecond resume fade after stable clearance.
- Reduced Camera Motion keeps the clearance check but skips the opacity animation.
- A newly selected bark clears stale settle and resume state.
- Text diagnostics distinguish active `collision_contact` from `collision_settle` and report settle progress, duration, resume progress, relevance threshold, and policy.

## Preserved behavior

Collision duration, obstacle identity and footprint, escape calculation, collision card, wake and pursuit warnings, Joe dialogue selection, Joe AI, movement, stealth and detection, scoring, audio, map, subtitle preferences, and generated art remain unchanged.

## Validation

- `node --check web/game.js`
- `node --check output/validate-route-pressure-visual.mjs`
- `node output/validate-route-pressure.mjs` — 18/18 checks passed with no browser errors.
- `node output/validate-route-pressure-visual.mjs` — 340/340 checks passed across:
  - 2560x1600 high resolution
  - 1280x720 standard
  - 844x390 compact
  - 1280x720 Reduced Camera Motion
- The visual matrix stages an initial contact release, a partial clear gap, a second contact, the restarted clearance interval, resume start, fade midpoint, settled dialogue, and stale-line retirement.
- Direct inspection confirmed no subtitle appears between the two grounded pine contact presentations. Once the physical lane stays clear, one subtitle returns without overlapping the collision card.
- Official uninstrumented browser smoke:
  - screenshot/state: `output/collision-bark-glance-continuity-official-2026-08-04`
  - average canvas render: 5.72ms
  - final canvas render: 1.80ms
  - rendered frames: 110
  - browser-error artifact: none

## Human follow-up

Test sustained wall scraping and fast transfers between two nearby obstacles during a natural chase. If the handoff still feels too eager, tune only the 120-millisecond clearance duration; keep the bark countdown uninterrupted and collision correction authoritative.
