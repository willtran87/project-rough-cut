# Under the Green: physical course fold

The long linear course has been replaced with a physical loop around the maintenance junction. `web/under-green-layout.js` owns floor rectangles, obstacles, outlet positions/orientations, interaction targets, checkpoint poses and the authored main route. Collision, rendering, navigation, water, audio and diagnostics consume these positions. This is a simulation-space change, not a rendering-only fold.

The northern spillway leads west into the bunker, then south to the pump. A shorter service passage joins the pump to Joe's entrance and the root gallery. Both actors can use it. The pump drains the eastern outlet; that outlet physically blocks every route into the range until operated. The range now returns south, with two alternating crossings, a middle landing connected to the dry perimeter, and the keeper room at its end. The long loop is the clearly marked approach; the service passage offers an earlier confrontation and a shorter route.

The course footprint is approximately 57 by 80 metres, compared with the old 224-metre longitudinal spine. See `output/under-green/folded/physical-plan.svg` for the actual floor and tested dry-route plan.

## Rules and persistence

- Water now has a world position and optional east/west axis. Guidance, physical barriers, entry-bank recovery, audio and rendering agree on this transform. Crossings remain ordinary walking decisions at the unchanged Level 1 speeds.
- Joe's water recovery now clears the full navigation exclusion margin. Previously he could stop outside the visible discharge but inside the path-blocking margin and remain stuck.
- Pump operation creates audible evidence at the physical lever when within its authored hearing range. Lost-sight searches proceed through authored inspection points based on the last evidence location. No hidden player position, teleport or speed increase is used.
- Checkpoint 1 follows the first spillway; checkpoint 2 is recorded immediately when the pump is operated; checkpoint 3 is on the range's middle landing. Taking the entire dry range perimeter need not visit checkpoint 3.
- Save version 3 preserves the current IDs. Version 1/2 checkpoint 3 represented the old pre-range position, so it migrates to the solved-pump checkpoint rather than skipping the new range. Existing bypass, evidence and completion facts remain retained. Old checkpoint 1 restores at the new first landing. Sibling save namespaces are unchanged.
- Gate collision and occupancy now use its actual position and protected side. A Joe or player in the adjacent root gallery cannot satisfy the keeper-room condition. Checkpoint notifications yield to the active mechanism/danger message.
- Nearby water advice requires a clear structural sightline. District labels and telemetry use physical regions rather than assuming that increasing y always means forward progress.

## Measured outcome

These runs use ordinary simulation movement with an informed route planner. They are reproducible engineering probes, not unfamiliar-player completion times or proof of enjoyment.

| Scenario | Completion time | Minimum Joe gap | Time within 10 m | Final gap |
| --- | ---: | ---: | ---: | ---: |
| Standard, dry loop, walking | 75.92 s | 5.35 m | 4.62 s | 33.06 m |
| Standard, dry loop, sprinting | 51.18 s | 8.27 m | 0.58 s | 37.48 m |
| Standard, timed wet crossings | 76.30 s | 1.54 m | 10.87 s | 48.89 m |
| Standard, three-second observation pauses at decisions | 87.92 s | 1.00 m | 13.95 s | 22.71 m |

The previous standard walking probe finished roughly 130 m ahead of Joe. The new physical layout reduces that separation considerably and supports legitimate re-encounters near the junction. It does **not** yet prove sustained final-range tension: several informed routes still earn a large late lead, and checkpoint 1's route has no time within 10 m. The shortcut probe walks directly into Joe after the pump and is caught; skilled evasion on that route has not yet been certified. Do not silently make that losing script an unavoidable authored outcome.

## Verification

- Simulation/design/rules suites cover water phases, pressure barriers, committed strikes and dodges, cover, valid spawns, saves, complete routes across pressure settings and checkpoint starts, and gate cancellation/clearance/occupancy.
- New `verify-under-green-folded.mjs` covers both-direction walking through every cyclic outlet, the horizontal outlet's red barrier and entry-bank recovery, the mandatory pump route, Joe's bank recovery, local gate occupancy, save migration, wet/dry/sprint/observation/evidence/checkpoint routes.
- The first spillway still passes 24 route comparisons: six paired wet-route wins and six dry-route wins; waiting too close to Joe can cause defeat.
- `verify-under-green-folded-browser.cjs` exercises actual pump input, immediate checkpoint, eastward movement across the drained outlet, range checkpoint, gate aftermath/result, and 2560×1600, 1280×720, 844×390, 390×844 views. Its static structural check covers 1,240 standing/crouching camera positions. A separate layout suite checks 896 positions and the actual dry spillway walk.
- Controls, general browser, shared-preference browser, audio/aftermath and chapter-transition checks are retained with fixtures moved to the actual new locations. Existing test assertions were preserved; fixture yaw is now explicit where checkpoint headings changed. The range advice remains APPROACH when there is still approach distance.
- Required standard web-game client completed two input bursts. Its state and screenshot were inspected. High-resolution bunker/pump and phone-range screenshots were also inspected; the rendering remains a working architectural pass, with sign/HUD/art issues still visible.

Evidence: `output/under-green/folded/`, current `output/under-green/simulation.json`, `output/under-green/encounters/comparisons.json`, and existing browser/control reports. No human listening, unfamiliar-player or physical mobile/controller ergonomics session is claimed.

## Remaining work

Tune the shared-junction and range encounters from route/phase evidence, including the shortcut's dodge space and late-game pressure. Complete Joe's trimmer hand/turn/strike animation, architectural and golf silhouettes, water flow and stable lighting, sign hierarchy, pump-state presentation, optional record reward, mobile HUD and two-thumb ergonomics, controller menus, shared adapters, and measured device performance. Keep all 44 items in the implementation ledger active until their actual completion criteria are proven.
