# Back Nine: lost sight, interception and garage finale

Implemented 2026-11-09. Scope is the shed-route cart chase.

## Player experience

- Three opaque windbreaks create genuine occlusion and offer conditional interception opportunities. They reuse existing pixel foliage and timber materials and have matching physical obstacles.
- Joe lifts his decks and signals a direction for 1.5 seconds before committing to a flank and interception point on the last lane he observed. These targets stay fixed behind cover. Players can change lanes or escape while he guesses wrong. No teleporting or added speed boost; existing bounded navigation and swept vehicle contacts remain active.
- Hidden mower audio is muffled, and the cutting sound drops while the decks are raised. Interceptions do not stack with the existing surge sequence. Checkpoint grace and collision recovery interrupt them.
- The garage requires both checkpoints, the whole cart inside, speed below 3 m/s and a 1.2-second parking hold. The cart parks and the camera faces the entrance during a 4.8-second shutter/latch sequence. Visible bollards admit the cart while the extended mower footprint stops outside. Completion leaves the engine audible for eight seconds, then fades it out.
- Driving bindings remain unchanged. Pause/resume retains the closing sequence; holding drive or brake cannot restart it. Hidden/blurred windows mute sound. The completed screen stops rendering while its finite audio tail runs.

## Verification

- `verify-back-nine.mjs`: six main/checkpoint/alternative routes complete, with no damage on the scripted routes. Full routes include warned surge or interception events. Joe's maximum measured per-step displacement remains bounded by normal driving speed.
- `verify-back-nine-hunt.mjs`: all three occluders block sight; warning duration, fixed predictions, hidden steering and protection checks pass. Actual input-driven opening loses sight for 3.10 seconds and reacquires it. Whole-cart entry, pause, monotonically closing shutter, mower footprint exclusion and a single completion event pass.
- `verify-vehicle-contact.mjs`: all nine collision groups pass. `verify-back-nine-tension.mjs` also passes.
- `verify-back-nine-hunt-browser.cjs`: opening signal/occlusion/reacquisition, parked finale, Escape/button resume, input handling, saved victory, one latch and bounded audio tail pass. Actual audio graph: peak 0.187, post-win engine RMS 0.0453, silence after the tail, nine sources. No browser errors or shader/texture growth.
- `verify-back-nine-browser.cjs`: hardware and SwiftShader runs pass keyboard, touch, gamepad, pause, checkpoints, reload, finish, retry and resource checks.
- Installed standard gameplay client: two opening input sequences, screenshots and text state captured and inspected. Presentation inspected at 2560×1600, 1280×720 and 844×390. Evidence is in `output/back-nine-hunt/`.
- Release audit: 90 action scenarios, no warnings/failures. Whitespace check passes.

## Performance and remaining limits

Still 16 shader programs, 34 textures, two local lights and nine persistent audio sources. Shutter details merge into two material groups. No new image downloads, shadows, postprocessing or per-event audio nodes.

Hardware hunt/finale sample: 10.04 ms average / 11.20 ms p95. Software controls/wet/rear sample: 47.49 / 57.20 ms at 960×540, ready in 3.65 seconds. Standard software opening sample: 36.49 / 47.70 ms. These are short, different workloads, not proof of performance parity or a 60 FPS guarantee. Existing software slowdowns remain.

Interception opportunities depend on Joe seeing the player within range. Fast players can leave him behind; three opportunities do not guarantee three encounters or a mower directly at the finale entrance. Suspense, sound balance and player comprehension still need the deferred human playtest.
