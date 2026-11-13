# Under the Green — November 11, 2026

## Playable scope

Added the drain branch of Level 2 as `web/under-green.html`. A successful Level 1 drain result now offers ENTER THE DRAIN; the shed still launches The Back Nine. Main-menu chapter links allow direct entry, including for players with older drain victories. New drain victories start a fresh chapter checkpoint without modifying Back Nine's save.

The chapter contains a protected root-gallery crossing, Joe's hatch/ladder entrance, spillway and bunker detours, a pump-house bypass, alternating range outlets and the final keeper's sluice. Six cyclic crossings and two bypass-controlled channels share one authoritative water state across simulation, pressure gauges, captions, sound and rendering. The bypass drains forward flow and warns for two seconds before activating its return discharge. The return channel forces Joe to wait or use the connected pump-house route.

Joe uses the existing textured skinned actor with a newly modeled hedge trimmer. He walks, navigates real floor geometry, observes line of sight, investigates evidence, waits for water and performs a warned committed sweep. An active blade hit causes defeat; ordinary proximity is not an instant loss. Solid cover blocks sight and the strike. Water penalties produce a swept displacement and short recovery, not drowning or repeated damage each frame.

Three checkpoints, collected evidence, selected pressure and completion persist in the chapter's versioned save. Defeat returns to a coherent checkpoint entry state. Restart/replay retains the recovered groundskeeper record. Corrupt saves fall back safely. A sluice cannot complete while Joe is inside the room, and the final gate's visible closure supplies its physical block.

Keyboard/mouse, arrow keys, touch movement/dragging and gamepad movement/look/use are supported. Pause freezes simulation; sensitivity, reduced camera motion, sound mute and Joe pressure are available. Mobile panels scroll and controls stay reachable. The game exposes concise `render_game_to_text` and deterministic `advanceTime`; state-placement helpers are restricted to `?test`.

## Verification

- `node tools/verify-under-green.mjs`: water phase boundaries, valid spawns, pause, recoverable water contact, physical defeat, ordinary dodge, solid cover, Joe's water response, actual navigation/capture of an idle player, warned bypass return, invalid gate completion, malformed-save recovery and seven complete live-Joe route/checkpoint runs. These runs use ordinary movement and Use in simulation, not teleported completion. Tests also require meaningful enemy travel, preventing an immobile Joe from falsely passing route completion.
- `node tools/verify-under-green-browser.cjs`, hardware and `--software`: loaded real assets, keyboard movement/turning, pause/resume, actual water contact, bypass Use, checkpoint reload, trimmer defeat/retry, gate completion/reload, mute, reduced motion, touch movement/drag look, gamepad controls and responsive panels. No page or console errors in the recorded passes.
- `node tools/verify-under-green-transition.cjs` (also invoked by the updated `verify-back-nine-transition.cjs`): actual Level 1 drain result -> loaded Under the Green -> player movement; preserved Back Nine checkpoint on drain victory; fresh shed result -> reset Back Nine checkpoint -> loaded Back Nine. Level 1 victory is fixture-triggered to isolate the transition; it is not a claim of a new human Level 1 playthrough.
- Installed standard `web_game_playwright_client.js`: real movement bursts through the tutorial and into Joe's entrance; screenshots and JSON state inspected. The standard client's images contain the canvas; the dedicated browser pass captures the complete DOM HUD and menus.
- Existing `node tools/verify-release.mjs`: 90 action fixtures, 67 referenced runtime images / approximately 26 MiB, no release warnings or missing assets in the recorded run. New chapter behavior is covered by its dedicated tests, not implied by those historical fixture counts.
- JavaScript syntax checks and tracked whitespace checks pass.

Visual inspection includes 2560x1600, 1280x720, 844x390 and 390x844. Reviewed entry/briefing, pressure water, Joe and trimmer close-up, pump, range, pause/settings, defeat and completion. Changes from inspection include vaulted roofs, restrained physical signs, moving pixel-water surfaces and pooled spray. Hardware was NVIDIA RTX 3090 / D3D11; the separate functional software pass used SwiftShader. These checks do not establish a worst-case frame-rate guarantee.

Evidence is in `output/under-green/`: `simulation.json`, `hardware-browser.json`, `software-browser.json`, `transition.json`, named screenshots, and `standard-client-final/`.

## Limits and follow-up

This is a local playable implementation. It has not been published or evaluated by unfamiliar human players. The Final Cut remains a design proposal; the completion screen says so rather than linking to a missing chapter.

Deterministic direct-route fresh runs take approximately 75 seconds, or 83 seconds with evidence. They are fast scripted routes, not measured first-player completion times. The proposal's provisional 6-9-minute duration is not established by this build. Human testing should judge actual pacing, whether a dry loop dominates, whether Joe remains threatening after strong play, audio intelligibility and whether the water reversals feel satisfying. The implementation deliberately allows skilled players to earn a large lead without hidden catch-up.

The art reuses the shipped pixel materials and Joe rig, with new procedural structural geometry, trimmer parts and water presentation. No claim is made that a full new illustrated cutscene package, campaign finale, arbitrary fluid simulation or new combat system has been delivered.

## Movement consistency follow-up

Under the Green now follows Level 1 movement: WASD/arrows move, Shift runs, C crouches, Q slows to listen, R glances behind without steering and E interacts. Vertical mouse look is non-inverted. Walk/run/crouch speeds, normalized diagonal movement, immediate stop, mouse smoothing, crouch height, rear-glance transition and controller deadzone match Level 1. Saved movement bindings, sensitivity, FOV and movement comfort options carry across. Touch includes Run.

`node tools/verify-under-green-controls.cjs` checks speeds against the Level 1 foundation/quality contracts, actual pointer-lock vertical direction, rear-glance movement and release, crouch height, stick response, controller/touch run and preference carryover. All pass with no browser errors. Full chapter simulation and browser regression also pass. Visuals inspected at 2560x1600, 1280x720, 844x390 and 390x844, with the new Run button clear of phone captions. Evidence: `output/under-green/controls.json` and `controls-*.png`.

## Clipping and challenge revision

The revised course renders its floors and perimeter walls from the exact collision footprint. Overhead structures clear the camera; side corridors are open; solid console/record props have collision; surface dressing sits outside the paths. The keeper gate seals the full room. Physical signs read correctly from either approach, and continuous amber markings identify the dry loops.

Water is now a timed barrier. The main crossings span 8 metres, with 3 seconds of green and 1.5 seconds of amber warning before discharge. The protected lesson retains a longer opening. High-pressure jets block all swept movement, including sprint and crouch; recovery immunity cannot bypass the barrier. A mistimed crossing returns the player to their entry bank and costs distance to Joe. Red/amber/green lamps, striped banks, a crossing-window readout and stronger cross-jets show the rule. Every crossing remains passable at normal walking speed when started early.

Joe approaches the reachable bank when the onward route closes, takes connected dry routes where available, and respects the same active water. Attempting to force a closed crossing can result in his warned trimmer attack catching the player. No hidden catch-up or speed increase was added.

Additional checks:

- `node tools/verify-under-green-design.mjs`: sustained sprint cannot cross red water; late crossings return to the original bank; early walking succeeds; reckless bank waiting leads to capture; Joe approaches closed crossings; gate covers all room lanes; floor/wall geometry matches collision; every opening is walkable.
- `node tools/verify-under-green-layout.cjs`: actual rendered structural geometry clears standing and crouched cameras at 1,230 sampled floor positions; ordinary keyboard movement traverses the dry side route; forcing red water produces defeat. Includes high-resolution encounter, pump, bunker, range, keeper and phone captures.
- Existing simulation, controls, hardware/software browser regression and installed standard Playwright client pass. Seven full simulation routes still complete. No browser errors were recorded.

Evidence: `output/under-green/encounter-design.json`, `layout-redesign.json`, `redesign-*.png`, and `redesign-client/`. These automated checks verify mechanics and sampled geometry; they do not replace a new human pacing playtest.
