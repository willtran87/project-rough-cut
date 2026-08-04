# Route pressure and vertical-wake pursuit polish - 2026-08-04

## Scope

This pass adds avoidable movement pressure and a fair response when the player runs vertically past Joe. It preserves both escape routes, every physical obstacle, existing sight and sound detection, golf-ball distractions, cover, crouch, Listening Focus, scoring, and input mappings.

## Observed issue

Open fairway allowed a player to hold sprint and pass Joe with too little route judgment. Existing solid obstacles and one-shot noise props created decisions at individual landmarks, but there was not enough persistent terrain friction across the longer hole. Joe also returned to ordinary behavior too quickly when the player crossed his mowing line outside immediate sight or hearing.

## Implemented

- Added seven avoidable slow-footing zones distributed across alternating lanes: three thatch windrows, two mud beds, and two exposed-root mats.
- Thatch limits pace to 66%, mud to 54%, and roots to 70%. Each material supplies an authored noise floor while still allowing crouch and Listening Focus to soften the crossing.
- The rendered patch, edge stakes, warning distance, map ellipse, active highlight, and contact test consume the same rotated-ellipse geometry. The player can cross every center and can find a nearby full-speed bypass around every zone.
- A pre-contact field plaque names the material and exact speed percentage. Contact supplies a material cue, concise route advice, and `FOOTING DRAG` threat language; briefing, settings, keyboard, gamepad, touch, and text state use the same decision rule.
- Added Vertical Pass pressure. An exposed forward crossing builds a bounded awareness wake based on sprinting, forward lead, lateral separation, cover, crouch, and Listening Focus.
- Joe pursues the last exposed wake position rather than receiving omniscient live tracking. He physically creeps toward it, accelerates as awareness rises, and can carry the response beyond the original crossing window.
- Breaking laterally, reducing exposure, crouching, waiting for Joe's sweep, or remaining under hard cover drains the wake. Waiting under hard cover can fully resolve it as `waited_out_under_cover`.
- `render_game_to_text` now exposes all footing zones, exact multipliers, active contact, entries, contact seconds, approach distance, Joe's wake target, awareness, lead, separation, warnings, creep duration, outcome, and counterplay.

## Validation

- Focused route-pressure validation passed 11/11 checks: exact 66% contact speed, full-speed bypass, measured 8m versus 12m half-second travel, vertical-wake warning/acquisition, Joe investigation, physical distance closure, hard-cover decay, cue/label coexistence, seven traversable centers, seven viable bypasses, and zero browser errors.
- Visual validation passed 24/24 checks at 2560x1600, 1280x720, 844x390, and 1280x720 with Reduced Camera Motion. The briefing, approach plaque, hazard art, persistent map, wake warning, and state contract remained readable and truthful.
- The required uninstrumented official-client approach reached Audit Thatch at 3.05m from contact with 15.02m obstacle clearance. The approach plaque and Joe label occupied separate readable lanes, and canvas rendering averaged 2.34ms with a 2.60ms final sample across 461 rendered frames.
- Existing official first-hole and vertical-chase routes completed without browser errors. Their physical obstacle, cover, objective, map, and Joe navigation presentation remained intact.

## Evidence

- `output/route-pressure-validation/01-active-thatch.png`
- `output/route-pressure-validation/02-vertical-pass-wake.png`
- `output/route-pressure-validation/03-approach-cue-lanes.png`
- `output/route-pressure-visual-validation/01-high-resolution-briefing.png`
- `output/route-pressure-visual-validation/01-high-resolution-approach.png`
- `output/route-pressure-visual-validation/03-compact-briefing.png`
- `output/route-pressure-visual-validation/03-compact-wake.png`
- `output/footing-hazard-official-final/shot-0.png`
- `output/web-game/shot-2.png`
- `output/route-pressure-regression-vertical/shot-0.png`

## Suggested playtest tuning

Run one full human playtest through each escape route. If a decision feels too automatic, tune only the individual zone speed multiplier, noise floor, or Vertical Pass acquisition/decay thresholds. Preserve exact visual/contact parity, an open bypass around every zone, approximate rather than omniscient wake tracking, and hard-cover waiting as viable counterplay.
