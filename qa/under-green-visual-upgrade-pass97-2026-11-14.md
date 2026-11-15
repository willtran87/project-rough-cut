# Under the Green pass 97: range ceiling composition

The existing failed range lining now extends into the main landing view. Its asymmetric folded silhouette interrupts the repeated frontal bays. Physical UV coordinates retain the original material density as the width grows 2.15 times; original underside heights, closed topology and structural roof remain intact. Retaining seams, purlins, trapped earth and two roots follow the enlarged span. The main root is thicker.

The unchanged lamp now has a fitted collar, two bolts and a plate aligned to the actual underside triangle. This avoids a horizontal bracket cutting through the sloping sheet. The work uses existing materials, textures and lights. No navigation, pursuit, controls or flood rules change.

## Verification

- Final native 2560x1600 and software 960x600 passes each contain 33 views, 1920 camera-clearance poses and 96 paired signal sight probes. No new signal obstructions or camera intersections. No page/console errors. Additional viewports: 1280x720, 390x844 and 844x390.
- Real Q, C, pause and Reduced Motion checks pass. Camera-return pixels are exact. Gallery and keeper control images are byte-identical before/after on both renderers.
- Pure geometry test verifies identical sheet topology, original heights and depth coordinates, physical UV scale, finite attributes and all 22 parts above 3.5m. Minimum underside height is 3.5256m. The actual emitted mounting plate fits its source triangle within 2.65e-9m plane error.
- 80 actual Joe mesh/weapon poses beneath the changed span cover four positions, four headings and walk/windup/two sweep/recovery samples. No structure intersections or page errors.
- Native approach, side and portrait, software approach and all six fresh district review views were inspected. The panel is visible in travel views and warning signals remain clear. Its broad angular surface and surrounding repeated bays still need broader material/composition acceptance.

## Scope

Advances V10/V11/V12 and review items 6/7/33. No whole requirement or gate is promoted. The full 53 requirements, 48 refinements and seven whole-level gates remain in scope. This local range improvement does not establish full Level 1 parity, motion/accessibility acceptance or performance qualification.

Runtime: web/under-green-range-lining.js. Evidence: output/under-green/visual-pass97/. The final-source-manifest.json records the lining, scene and enclosure source hashes. Baselines remain in source/.

## Local cost

Six warm pairs and 24 alternating GPU-fenced samples per view, with turning enabled, on the shared host. Native and software runs were sequential. These are local diagnostics rather than ordinary-input frame pacing qualification.

| Renderer | View | Median ms before → after | p95 ms before → after |
|---|---|---|---|
| hardware | range-approach | 22.6 → 22.5 | 25.4 → 25.5 |
| hardware | lining | 9.6 → 9.4 | 11.4 → 11.4 |
| hardware | range-flood | 13.9 → 13.6 | 15.4 → 15.4 |
| software | range-approach | 172.7 → 172.1 | 184.0 → 183.6 |
| software | lining | 63.1 → 63.3 | 66.7 → 65.1 |
| software | range-flood | 180.5 → 181.0 | 192.9 → 205.6 |

Draws, texture counts and program counts are unchanged in every paired view. Native submitted triangles increase by 160; software changes are +172/+88/0 depending on culling. The thicker root crosses the existing tessellation threshold. Native cost is essentially unchanged; software medians are similar, but flooded p95 worsens. Absolute software cost is unacceptable and remains an open whole-level limitation. No performance speedup or parity claim.

## Final gameplay client

Installed develop-web-game client completed 12 bursts, terminal exit 0. Initial click timed out while Preparing; later Enter bursts started the ready game. Final state is under_green_playing at (0,13.192), elapsed2.533, entrance checkpoint0, actual [960, 540]. No error artifacts. Final shot11 inspected. All three final source hashes rechecked unchanged after verification. Both cost runs, actor verifier, pure geometry verifier and installed client are terminal.
