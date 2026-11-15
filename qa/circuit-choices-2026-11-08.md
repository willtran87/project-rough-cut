# Circuit choices and unobserved environmental changes

## Player experience

Two optional physical circuit switches serve the pond floodlight and the three range floodlights. Use the existing remappable interaction button to cut a circuit for 16 seconds, once per switch per run. The prompt describes the duration and loud operation before committing. An eligible nearby patrolling Joe investigates the audible switch through the existing navigation system. An active chase, player lure or protected commitment is never replaced; sight/hearing or pursuit permanently cancels that investigation.

Switches affect the same power function used by visible lenses, floor pools, light shafts and player exposure. A two-second smooth recovery prevents an abrupt flash. A nearby return warning is suppressed during important information or danger. HUD context reports the remaining time, while ordinary lit-ground advice clarifies that increased visibility still requires Joe's clear view. Existing earned blackout charges are preserved while the local cut already reduces exposure. Circuits are optional in the 3D presentation; required checks and exits are unchanged.

The existing altered paperwork/tracks at completed stations now wait for .65 seconds outside the player's central view and beyond close interaction range. The pending alteration has its own bounded queue, so an expired or already-played audio reply cannot prevent the later visual change. Each alteration persists and occurs only once; it never moves colliders, objectives or either Joe.

## Rendering and controls

The two weathered boxes, lever states, indicator, screws, rain lip and conduit reuse the existing instanced original-features material, grain texture and 112/176 software/hardware instance limits. Raised the controls into a comfortable viewing position after inspecting initial close captures. No new texture download, light, shader program, render target or rendering pass. Essential panels remain visible with decorative density zero and Reduced Motion. The new HUD advice reuses the simulation's cached environment result.

## Verification

- `verify-course-circuits.mjs`: independent circuits, 20/60/144Hz duration and warning count, bounded smooth restoration, pause and observed/unobserved gating.
- `verify-course-circuits.cjs`: real E activation of both switches, reachable approaches, one-use/repeat guard, matching exposure/lens/pool power, pause, expiry, spent state, preservation of earned rewards and existing lures/chases, pursuit cancellation, remapped G interaction, comfort visibility and one-time persistent changes after looking away. Hardware and software checks retain program/texture counts and existing instancing caps.
- Existing encounter/timer/filing and floodlight synchronization suites pass. Release inventory remains 56 runtime images / 20.8 MB, with 90 action scenarios and no warnings.
- Six controlled course-variant/exit cases reach victory, including zero-ball and filing-retry checks. The presented standard client completes two iterations, moves 14 units and reaches ready first-hole state without error artifacts; final full-page screenshot inspected. These controlled exit cases are not human playthroughs.
- High-resolution 2560×1600, 1280×720 and 844×390 views inspected. Evidence: `output/circuit-choices-20261108/`. This is engineering verification; human preference and suspense ratings remain deferred.

Revision: `20261108-circuit-choices`. Existing software-renderer frame spikes and startup limits are not declared solved by this change.
