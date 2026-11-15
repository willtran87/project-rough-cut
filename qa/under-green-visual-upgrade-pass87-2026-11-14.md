# Under the Green pass 87 — practical-light enclosure shadows

The development build now bakes the opaque enclosure around all 17 fixed practical lights. Walls, vaults, soil banks, major roots and timber supports interrupt their light, improving the depth and physical connection of those forms. The original 53 requirements, 48 review refinements and seven release gates remain the scope. This pass does not establish whole-level completion or performance acceptance.

The preceding goal turn repeated the visual plan and inspected existing images; it did not complete an implementation requirement. This turn resumes the existing shadow prototype, corrects transform handling, tests actual GPU sampling, and gathers visual, interaction and timing evidence.

## Retained implementation

- `web/under-green-practical-shadows.js` bakes six perspective depth faces per lamp into a single atlas. It uses the real selected opaque geometry, including the keeper's carved wall shape, rather than full collision boxes that would close visible recesses.
- Source world transforms are updated before capture. This matters when baking before the first ordinary scene render.
- The atlas has 102 faces at 128 square pixels, arranged into 768x2176 pixels. Estimated color/depth attachment storage is 8,355,840 bytes (about 7.97 MiB). The initial observed bake submission wall times were 123.5 ms native and 130.5 ms software; these are not isolated GPU completion or total loading measurements.
- `web/under-green-practical-lighting.js` applies the depth comparison to the existing direct diffuse/specular contribution. Skinned, morphing and instanced receivers derive their world position after deformation. Existing light positions, independent flicker, colors and source strengths remain intact.
- `web/under-green-scene.js` awaits the bake before preparing the light materials and disposes its render target with the scene. No shadow views are redrawn during ordinary gameplay.
- Moving doors, actors, transparent effects, small hardware and lamp housings are not baked as occluders. This is enclosure occlusion, not a full dynamic shadow system. Joe's existing projected floor shadow remains a separate effect.

No artwork, geometry, collision, pursuit, input, checkpoint, flood timing or narrative behavior changed. The final runtime source snapshots and SHA-256 hashes are in `output/under-green/visual-pass87/final-source-manifest.json`.

## Sampling and visual evidence

- `tools/verify-under-green-practical-shadow-sampling.cjs`: 47 actual GPU readback checks on each renderer. Tests cover all six axes, near/open/blocked receivers, cube-face seams, two translated light rows, transformed blockers before their first render, and disabled comparisons. Both pass without browser or shader errors.
- `tools/verify-under-green-practical-shadow-views.cjs`: 31 paired states per renderer. The comparison disables only the shadow contribution, preserving light sources and gameplay. All seven district/interaction viewpoints show an actual shadow difference. Player and interaction states match between the pair.
- These paired states cover pressure cycles, rising/high/receding flood samples, E pump operation, E sluice release through gate=1 and aftermath, Q, crouch, frozen pause time, reduced motion, 2560x1600, 1280x720, 390x844 and 844x390 viewports. Native desktop rendering is actually 2560x1600; software desktop rendering is actually 960x600.
- `tools/verify-under-green-dark-readability.cjs`: 96 views and 380 rendered attack frames per renderer. All authored water phase signals retain the correct active material. Five district attack sequences retain hand/foot tolerances and blade-to-simulation agreement. Native and software passes have no browser/shader errors. Low-light times are selected by an attenuation heuristic, not proven absolute pixel minima.
- Inspected images include the native gallery, crossing, pump, range, bunker, keeper and portrait pump; the software high flood and pump attack; and native gallery/bunker attacks. The range retains its clear hazard sequence and the pump retains readable controls. Water remains dark. This pass does not approve every broader composition or material-art requirement.

Ghost fade and installed-client completion are recorded in the final verification addendum below.

## Timing and rejected experiments

`tools/verify-under-green-practical-shadow-budget.cjs --turning` compares the pass-86 source snapshots with the current unguarded shadow implementation. Each view uses six warm pairs followed by 24 alternating GPU-fenced samples while changing yaw. These are local shared-machine observations, not a full-route benchmark.

| Renderer / view | Before median / P95 (ms) | Shadows median / P95 (ms) |
| --- | ---: | ---: |
| Native gallery | 19.8 / 23.4 | 20.5 / 23.8 |
| Native crossing | 18.1 / 21.5 | 17.9 / 21.5 |
| Native flooded pump | 15.5 / 17.2 | 14.8 / 16.9 |
| Software gallery | 200.7 / 258.0 | 242.0 / 385.2 |
| Software crossing | 161.8 / 260.7 | 193.8 / 223.5 |
| Software flooded pump | 208.7 / 234.1 | 255.6 / 312.7 |

Submitted gameplay draws, triangles and shader-program counts match the baseline in these views. Two render-target textures are added. Native costs are close to baseline; software median costs increase approximately 20–22%, and frame times at the tested 960x600 render target remain unacceptable. This is not a new measurement of the live adaptive-resolution floor. The performance gate is explicitly still open.

A lit-side/visible-source guard first failed shader compilation because an unrolled local variable was redeclared. That result is invalid and excluded. After fixing the generated variable names, the guard still gave no useful software improvement and was removed. A separate 256-pixel nearest-filtered candidate still added roughly 15–20% software cost while quadrupling atlas storage, so it was also rejected. Neither experiment is in the retained runtime.

Final-budget software results describe the rejected guard experiment; the retained runtime's applicable timings are in `budget/hardware/report.json` and `budget/software/report.json`. The source manifest disambiguates the final implementation.

## Remaining work

Keep the enclosure-shadow improvement while addressing software rendering cost as development work. Full matched Level 1 comparison, deliberate material clusters, broader district composition, remaining water refinement and all seven whole-level gates remain unproven. No item status is promoted by this pass. No new clearance qualification is claimed: this pass changes shading only and retains the previous geometry.

## Final verification addendum

- `tools/verify-under-green-practical-shadow-ghosts.cjs` passes seven fade/movement samples on each renderer, with no browser/shader errors. The ghost continues from x=-0.575 at alpha=0.46 to x=1 at alpha=0.034 before disappearing. Native and software visible-ghost screenshots were inspected; the figure remains dark and integrated with the corridor.
- The installed `web_game_playwright_client.js` completed 12 input bursts and exited successfully. Its initial click timed out while the existing Preparing button was disabled; subsequent Enter actions advanced the opening and reached gameplay. Final state: ready, playing, position (0,13.192), elapsed 2.533 seconds, checkpoint 0, actual target 960x540. No error artifact was produced. Final gameplay screenshot `client/shot-11.png` was opened and inspected.
- Final runtime hashes were checked against the source manifest. Syntax checks pass for all three changed runtime modules. The source diff contains only shadow creation, shader integration, transform handling, statistics and disposal.
- The source/sampling, paired-view, low-light, ghost and client processes are terminal. No agent, CUA, image generation, commit or deployment was used. Ledger counts remain 32 implemented, 20 in progress, one pending, with all seven gates pending.
