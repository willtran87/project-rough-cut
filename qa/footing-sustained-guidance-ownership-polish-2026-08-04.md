# Sustained footing-guidance ownership polish — 2026-08-04

## Intent

Keep the escape decision readable for the entire time the player is physically slowed, including when a more urgent contact-noise warning enters the same view.

## Change

- Added `footingHazardSignalOwner()` to distinguish the opening consequence from sustained local guidance.
- The active hazard remains the signal owner until the shared rotated-ellipse terrain test reports that the player has cleared it.
- Ambient context plaques and the objective caption remain deferred; route geometry, the map, target bearing, hazard art, collision feedback, and movement mechanics remain active.
- Added `footingHazardPlaqueDeferralOwner()` so an untriggered noise hazard within eight meters temporarily replaces the amber escape plaque with the higher-priority safety warning.
- The entry message, hazard contact, and nearest-noise systems supply all state; no additional timer or gameplay state was introduced.

## Validation

- `node --check web/game.js` — pass.
- `node output/validate-route-pressure.mjs` — 18/18 pass.
- `node output/validate-route-pressure-visual.mjs` — 80/80 pass.
- Entry, sustained crossing, imminent-noise overlap, and recovery captures inspected at 2560×1600, 1280×720, 844×390, and 1280×720 Reduced Camera Motion.
- Sustained crossings reported `footing_hazard_guidance`, a visible amber plaque, hidden objective caption, and visible objective geometry.
- The authored Audit Thatch/Maintenance Tools overlap reported a seven-meter noise cue, `imminent_noise_hazard` plaque deferral, hidden objective caption, and both route geometries still visible.
- Recovery restored ordinary route-caption ownership.
- Official web-game client completed the opening first-person smoke with no browser-error artifact; canvas work averaged 6.95ms and ended at 2.00ms across 101 frames.
- Local test page returned HTTP 200 at `http://127.0.0.1:4173/`.

## Guardrails retained

- No terrain multiplier, noise floor, hazard radius, interaction radius, Joe behavior, collision, objective route, pathfinding, map, or timing changed.
- Noise safety warnings remain above tactical route advice.
- Objective and bypass geometries remain visibly distinct and physically occluded.
