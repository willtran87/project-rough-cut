# Faster, more persistent cart pursuit — 2026-11-09

- Cart pursuit base speed: path24, rough22.5, wet21, sand9.3 m/s; physical cap25.5 m/s. Previous bases18.1/18/15.3/7.8, cap18.3. Acceleration response3.8 (4.8 when armed) versus2.5/3.5; turning1.32 versus1.02 radians/s.
- Moving windups retain98% of a moving cart's speed up to15 m/s when more than10m away, instead of88% capped12 beyond14m. Stationary windup remains1.8s, physical backoff minimum1.1s and8.5m separation unchanged.
- Within32m, favor another physical pursuit over optional passing displays. Authored sightbreak interceptions remain; hidden steering cannot retarget them. Brake before tight nearby route corners to avoid repeated scenery contact at increased speeds; this fixed a long stall near the first checkpoint.
- On-foot base speeds, acceleration, turning and speed caps remain unchanged. Cart durability, damage formula, five-second safe ejection, pressure openings, controls, solid hulls and artwork unchanged. No rendering/audio edits or added resources.

## Measured behavior

Same exposed24-second drive: old hits11.48/20.58s; new8.42/13.62/18.47s. Peak18.22→23.98m/s (about32% higher). Repeat intervals9.10→5.20/4.85s. Three contacts instead of two;79 health after the relay repair. This is fixture behavior, not forced timed damage.

Stationary strong contacts repeat3.30s apart, each with physical backoff. All five rear/head-on/side/boundary/blocked-reverse escape fixtures move more than8m; a second attack is permitted only after2.8s and more than8m of escape movement. Higher speed legitimately allows a second ram in one former no-second-hit fixture.

All six driving routes win, with3/1/2 contacts for the full main route and checkpoint starts, and1/4/4 on branches. Cover/alternate lanes can still evade. All three on-foot routes win with unchanged123.38/80.70/37.90s completion times.

## Verification

Passed `verify-joe-aggression.mjs` baseline comparison; `verify-back-nine.mjs`; `verify-cart-health.mjs`; `verify-mower-ram.mjs`; `verify-vehicle-contact.mjs`; `verify-ram-windup.mjs`; `verify-chase-decisions.mjs`; `verify-chase-rhythm.mjs`; `verify-back-nine-hunt.mjs`; `verify-chase-runover.mjs`.

Updated physical speed assertions to25.5m/s and included ram launches among warned pursuit beats. Sightbreak live-drive fixture now uses full throttle to exercise loss/reacquisition under faster pursuit (9.28s occluded); fixed hidden predictions remain tested separately.

Hardware/software `verify-mower-ram-browser.cjs` passes impact/backoff/windup/pause/driving escape and resource checks. Same17/22 programs,34 textures,nine voices; no browser errors. Installed standard gameplay client completed two drive bursts with no error artifacts. Inspected2560x1600 impact and1280x720 gameplay; browser suite also captures844x390.

Evidence/baselines: `output/joe-aggression/`. No frame-rate improvement claimed; software driver/frame-tail limitations remain. Deferred human playtest should assess whether roughly five-second exposed-lane rams deliver the intended panic while shortcuts, alarms and recoveries remain legible.
