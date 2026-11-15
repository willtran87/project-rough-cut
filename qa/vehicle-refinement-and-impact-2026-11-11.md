# Vehicle detail, progressive damage and heavier rams

## Implemented

Joe's industrial mower has heavier lamp guards, serrated deck edges, pulley/belt hardware, hydraulic lines, welded patches, reinforced cage braces, heat shielding and a second exhaust. The cart has seat piping/buttons, suspension details, hinges, fasteners, battery cells/cables and rear trim. Existing pixel maps, shading and collision dimensions remain in use. Joe remains visible through the cage.

Cart visuals now expose seven health states: intact (100), scuffed (83–99), dented (66–82), buckled (46–65), battered (26–45), critical (1–25), wrecked (0). Geometry deforms continuously within these ranges; roof creases/lean, hood and bumper displacement, exposed scrape marks, loose hatch and wheel camber accumulate. The existing five collapse assemblies, settling, ejection and repair restoration remain. Three tiny prebuilt wear layers appear progressively; geometry is only rewritten when health changes.

Damaging rams reduce current cart speed by 26.4–40%, depending on closing strength. They apply a 0.35–0.64 m shove away from the contact over 0.24 seconds. Six-centimetre maximum substeps test the full oriented cart hull against boundaries, box landmarks, round obstacles/posts and Joe; blocked shoves stop without accumulating residual force. No steering lock, extra damage, increased health cost or speed boost. Fatal impacts yield to ejection and the five-second runner protection. Protected bumps do not apply the new impulse.

An immediate bounded camera pitch/roll jolt fades into a 0.72-second rattle, with directional body rocking and suspension compression. It uses analytic transforms, follows the same frozen impact age on pause and contributes zero movement under Reduced Motion or during on-foot/death presentation. Existing impact voices now deliver a lower, longer bass thump and two fading loose-metal pulses after the crunch. No new audio nodes, shaders, lights or textures.

## Verification and evidence

- `verify-heavy-impact.mjs`: four shove directions at weak/strong force; full-footprint stopping at boundary, thin post, cistern and garage wall; bounded/decaying feedback; pause, Reduced Motion and protected contacts.
- `verify-heavy-impact-browser.cjs`, hardware and SwiftShader: actual ram, speed loss (10.67 to 6.49 m/s fixture), 0.639 m shove, backoff, responsive steer/accelerate escape, paused effects, reduced-motion hit and 2560x1600 / 1280x720 / 844x390 captures. Same 17/22 programs, 34 textures, nine voices, no new bufferData allocations during play, no browser errors.
- `verify-vehicle-refinement-browser.cjs`: seven damage stages, collapse progression, settled debris above the road, repair restoration, no steady-health geometry uploads; seven actual repeated rams reach wreck/ejection. Hardware/software passed before impact changes; hardware rerun after integration.
- `verify-vehicle-refinement-art.cjs`: before/after detail captures and render samples. Intact mesh/draw counts unchanged; cart triangles 4644→6072, mower including Joe 25390→27334. Damaged cart adds at most three wear draws. High-resolution and smaller driving views inspected.
- Existing vehicle contact, five ram-recovery/escape fixtures, cart health/three on-foot routes and all six driving completion routes passed with heavier impacts. An initial 55% speed loss caused one route's cart to fail early; final maximum is 40%, preserving route completion while retaining a substantial hit.
- Impact and cart-damage offline audio tests passed: nine voices, mute/pause behavior intact, sampled peaks under 0.45 (no clipping).
- Installed standard Playwright client via `verify-presented-client.mjs`: driving bursts, state and screenshots checked.

Evidence: `output/vehicle-refinement/` and `output/heavy-impact/`. Source snapshots are in their `baseline-source/` directories. Software rendering still has existing frame spikes: sampled wet-view p95 was 50.5 ms before vehicle detail and 54.1 ms after, while median remained ~40 ms. These short samples do not establish a general performance improvement or regression; resource budgets are bounded but extra geometry is not free.

## Deferred human checks

Drive at speed and compare rear/side impacts, using Q to inspect the mower. Check impact weight and camera comfort with normal/Reduced Motion settings; confirm successive damage stages remain legible in motion. Intentionally take cover by a trailer/cistern and reverse after contact. Repeat hits through cart failure, then run to the garage. Use repairs to confirm clear recovery of the visible damage. Human playtesting was deferred by the user.
