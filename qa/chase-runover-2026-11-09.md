# Repeated rams and on-foot run-over — 2026-11-09

## Behavior

- A 100-health cart now takes 8–16 damage per normal contact, allowing 7–13 impacts without repairs. Existing crumpling, collapse, crunch/rattle/failure sounds and repair rewards remain.
- Joe carries speed into distant moving windups, follows through on contact, and does not declare an attack missed while still closing. Early pursuit prioritizes a real hit before optional passing encounters. Fixed lane targets account for warning-time travel; stale commitments release to pursuit.
- Close boundary approach and exposed-side routing around the wreck prevent two observed pursuit stalls. Recovery slows before its endpoint; blocked retreats have a bounded fallback. Physical backoff and the stationary 1.8-second warning remain.
- Lethal on-foot contact starts a 2.4-second death sequence: the player falls, the mower rolls across and beyond the defeated actor, and a side camera shows the fallen body before retry. Wrecks, scenery and the garage barrier remain solid. The five-second safe-ejection window remains.
- Pause freezes the sequence; Enter cannot revive it; retry resets it. Reduced Motion shows the fallen pose directly. Existing meshes/materials and audio voices are reused.

## Automated evidence

Passed `verify-chase-runover.mjs`, hardware and software `verify-chase-runover-browser.cjs`, `verify-cart-health.mjs`, `verify-back-nine.mjs`, `verify-vehicle-contact.mjs`, `verify-mower-ram.mjs`, `verify-chase-decisions.mjs`, `verify-chase-rhythm.mjs`, `verify-back-nine-hunt.mjs`, and `verify-ram-windup.mjs`. Existing scenario assumptions were updated for the new durability, death duration, first-contact priority and lane/pass ordering.

- Stationary fixture: seven separate strong hits, each with physical backoff, approximately 3.43 seconds apart. Joe then approaches the ejected runner around the wreck and triggers death.
- Moving exposed driver: two actual rams at 11.48 and 20.58 seconds; cart remains drivable. This is a scenario result, not a guaranteed collision schedule.
- Rear/front/side foot contacts animate before defeat. On an open road Joe travels 7.59 m during the sequence. Near a wreck his travel stops at the solid obstacle.
- All six driving routes win (23.40–69.18 seconds); main and two branch runs sustain two contacts. All three on-foot checkpoint routes still win (123.38/80.70/37.90 seconds).
- Software health browser regression passes keyboard/gamepad/touch controls, pause, objectives, garage win and retry. Installed standard gameplay client completes without error artifacts.
- Inspected captures at 2560×1600, 1280×720 and 844×390. Fallen body stays above the road (minimum world Y 0.01158 m), and is visible after the mower passes.
- No new first-death buffer uploads, textures, shader programs or audio voices. Hardware retains 17 programs, software 22, both 34 textures and 9 voices. This confirms bounded resource reuse; it does not establish a general frame-rate improvement or resolve earlier software-rendering limitations.

Evidence: `output/chase-runover/` contains simulation, browser and winning-route JSON, full-size captures and standard-client output. Task-start source snapshots are in `output/chase-runover/baseline-source/`.

## Later human playtest

1. Drive an exposed lane, then use a shortcut or alarm: assess whether repeated hits feel frightening while the recovery window remains readable and escapable.
2. Compare strong and glancing contacts; verify the cart lasts long enough for a dramatic damage progression without making repair choices irrelevant.
3. Let the cart fail beside scenery, then escape around the wreck: confirm ejection protection is understandable and Joe's route feels fair.
4. Allow an on-foot collision from several directions; assess death-camera readability, impact timing and Reduced Motion comfort.

Human playtesting remains deferred as requested; subjective panic/fairness approval is not claimed.
