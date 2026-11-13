Under the Green: clearance, pursuit decisions, pump and lighting

This is an implementation and verification pass within the full 44-item objective. The chapter is not finished. The previous goal turn made progress by refining the build prompt; this turn changes runtime behavior and adds direct evidence.

Joe now turns before advancing, raises the whole trimmer near tight geometry, and recovers when solid cover interrupts a strike. Movement, rendered pose and damage use the same weapon pose. The gate safety clutch also checks the tool across its threshold. The rendered audit initially found five teeth grazing the inner wall face: the simulation omitted the wall's 0.11 m inner thickness. The weapon envelope now includes that margin.

Clearance evidence:

- `tools/verify-under-green-clearance.mjs`: 1,416 floor/heading placements, continuous close-wall turns, interrupted attack, blade-only gate obstruction and 11,152 observed live pursuit frames across successful routes. Walking displacement follows Joe's heading.
- `tools/verify-under-green-clearance-browser.cjs`: nine poses, each comparing 14,697 deformed body/tool vertices against actual structural triangles. Includes wall carry/preparation, corner, bunker, pump, and open/half/low/closed gate fixtures. No sampled intersections; grip errors below 0.000001 m. Corrected the fixture camera so screenshots actually face Joe.
- Viewed the wall-preparation and low-gate captures at 2560×1600, plus the live service encounter. This sampled coverage is not a certificate for every possible animation/geometry combination. The original static clearance harness remains a separate check.

Navigation now plans complete bank-to-bank crossings, including travel time, bounded turning and the next safe opening. Joe compares waiting with physical dry paths. A safe entrance no longer makes him repeatedly walk into a discharge he cannot clear. His speed remains 1.65/2.1/2.35 m/s by the existing pressure setting; no hidden catch-up is added. The spillway's authored low phase is now four seconds plus the existing 1.5-second warning, allowing standard Joe to clear the ten-metre bank-to-bank path. Steady Joe cannot clear that window and can select a detour. Other cyclic outlets keep their existing timings.

The navigation tests cover 48 phase/channel combinations with no foreseeable surge recovery and no movement over 2.1/60 metres per simulation step. They also verify event-controlled outlets do not invent future safe windows. Regression tests found a recovery/navigation margin mismatch; Joe now backs fully out of the navigation exclusion region before planning again. The old recovery fixture also needed time for his newly bounded 180-degree turn before asserting resumed forward travel.

Joe can inspect the bunker loop's known service exit only after seeing actual westward movement into that loop and then losing the trail for 3.5 seconds. A stationary player standing in the region does not trigger this response. The destination is authored and reached by normal walking. Tests move the unseen player to two different hidden destinations and prove Joe's inspection target and movement are identical. Fresh sight or audible movement can still supersede that inspection.

The service-exit encounter now has counterplay. The original route pilot that ignores Joe's preparation gets caught. An explicit QA pilot responds to the visible windup with normal lateral movement, then walks past. This behavior exists only in the test pilot; gameplay has no automatic dodge. The browser test restores a snapshot recorded during a real full-route simulation and checks both outcomes through keyboard input: W into the sweep loses; A for 0.4 seconds then W for 1.05 seconds evades it. Rear glance remains usable. Successful route tests now name that evasion explicitly rather than assuming a player may walk through Joe's body.

Current deterministic route observations:

| Scenario | Result | Closest gap | Time within 10 m | Final gap |
| --- | --- | --- | --- | --- |
| Standard dry route, ignores attack | Caught at service exit | 0.70 m | 4.70 s | — |
| Standard dry route, one sidestep | Complete | 1.45 m | 6.88 s | 34.38 m |
| Sprint route, two sidesteps | Complete | 1.44 m | 4.22 s | 37.01 m |
| Timed wet route | Complete | 0.99 m | 15.78 s | 28.89 m |
| Three-second observation pauses | Complete | 1.00 m | 8.93 s | 30.01 m |
| Checkpoint 3 retry | Complete | 4.72 m | 10.42 s | 9.62 m |

These pilots know the map and water phases. They demonstrate reachability, danger and counterplay, not first-time fun or pacing. Late full-route pressure remains weak, and checkpoint 1 still provides no close exposure in its scripted route. Do not mark sustained pursuit or the climax complete.

The pump lever now moves through a short deterministic transition. Connected pipework carries three staged valve movements and positioned mechanism knocks at the junction, outlet and return. Their fixed world positions supply legitimate sound evidence; no event reads the hidden player's position. Pause freezes the sequence, restoring durable progress does not replay it, and browser verification counts each sound event once. The pump's wider sightline composition and visible payoff with Joe still need improvement. Sound quality has not been assessed by human listening.

Lighting uses two actual lamp positions with continuous selection weights. A departing or arriving source reaches zero weight at the selection boundary, removing the old nearest-lamp position jump. The browser sweep through 201 positions found a maximum source-weight change of 0.06581 per 0.1 m, and captures cover 2560×1600, 1280×720, 844×390 and 390×844. This does not establish a device performance budget; the added light still needs representative hardware profiling.

Passing current verification includes navigation, dynamic clearance, core simulation, design, rules, folded-course rules/browser, encounter comparisons, controls, audio/aftermath, pump/lighting and the service encounter. The required standard web-game client completed two input bursts; its latest screenshot and state were opened and inspected. Browser reports for the exercised scenes recorded no runtime errors.

Evidence is under `output/under-green/clearance`, `output/under-green/navigation`, `output/under-green/folded`, and `output/under-green/encounters`. Existing scripts and reports retain the specific scenario coverage; a passing label should not be generalized beyond it.

Still required: late range pacing, checkpoint 1 experience, clearer pump/evidence staging, district architecture/golf silhouettes, physical water flow, sign hierarchy, phone HUD/two-thumb ergonomics, complete controller menus and global adapters, measured performance, and unfamiliar-player/device/listening validation. All 44 items remain tracked in the implementation ledger.
