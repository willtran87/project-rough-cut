# The Final Cut — grandstand structure and water contact

The empty championship now has 145 supported chairs across five stone tiers, two open stair aisles with 30 treads and contrasting nosings, sloping handrails, rear/end rails and a pitched canopy with rafters, columns, piers and braces. Chamfered seat pans and tilted backs replace the former floating slabs. The tournament title faces the course and sits in front of its supporting columns. This advances FC03 and FC57; the full environment and dramatic chapter remain incomplete.

The stand remains beyond the playable course fence. Its stairs and rear view are architectural detail, not a new accessible player route. The inspection fixtures include positions outside the normal player bounds so the rear and aisle construction can be reviewed.

## Irrigation integration

Shared chair, tier and canopy dimensions govern the authored rupture jets. Full pressure lands on three actual seat pans, whose smaller wet overlays fit within the chamfered edges. Falling pressure now searches for the first solid chair, tier, pier, column or ground contact. Water passes through empty space below a seat rather than treating its entire footprint as solid. Ground endpoints use the actual shared grass/paving heights.

The contact search is bounded to 256 samples plus 25 refinements and cached once per jet/pressure. It is an authored effect, not a general fluid or continuous scene collision solver. Droplets remain bounded decorative particles. The independent mesh check covers the three authored trajectories and the stand/ground surfaces; it does not certify arbitrary trajectories or all scenery. No simulation, damage, trap, victory or movement rules changed.

## Evidence

- `verify-final-cut-grandstand.cjs`, D3D11 and SwiftShader: 5,890 ray probes against actual chair/tier/tread meshes; maximum height discrepancy 0.0000001652 m. Three jets at 81 pressure values each produce 243 checked trajectories, no premature mesh intersections and no missed endpoint contacts; maximum endpoint discrepancy 0.0000007079 m. Eight captures per renderer; no browser errors.
- `verify-final-cut-irrigation-layout.mjs`: 24,543 finite arc samples clear the pitched canopy, with minimum sampled underside clearance 0.24813 m. All three full-pressure endpoints meet their intended seat tops.
- `verify-final-cut-irrigation.cjs`, both renderers: five groups and 22 captures each, including real pump Use, both physical rig approaches, preparation, pixel-identical pause, saved collapse reload, reduced motion and stable resources. Fixed a test-clock race by enabling deterministic stepping before clicking Resume after reload; no production persistence change was needed.
- `verify-final-cut-reveal-browser.cjs`: actual terrace Use, marker/beam timing, widening from 5.21076 to 10.5 m, pause/reload, four sizes and twelve captures pass. The grandstand title no longer masks the folded lamps. The machine still visibly reads as one machine in ambient light; FC06 remains partial.
- `verify-final-cut-arrival-browser.cjs --replay=0 --overlook-start --out=output/final-cut/grandstand/route`: one uninterrupted original-plan bank route through ordinary Gamepad API handlers, 131.5616 simulated seconds, zero captures/throws/browser errors, nine captures. A completed-result fixture unlocks Replay; no live route placement is used. This is a map-aware scripted chapter run, not a fresh full campaign or human pacing result.
- Installed develop-web-game client: two ordinary movement iterations; latest screenshot and state inspected. Final-client evidence is in `output/final-cut/grandstand/client-final/`. Rig remains waiting, water dry, and the player reaches the access rail at about 6.5 seconds. No error artifacts.

Visually inspected 2560×1600, 1280×720, 844×390 and 390×844 views, plus gable, rear, aisle, rupture, ordinary movement and the opening reveal. The title clears the column, chairs have visible support, stair treads remain separated, and spray reaches the stand below the canopy. Close portrait views naturally crop the large structure; free look remains available. The intermediate `layout-prototype.png` is not a pre-change baseline.

## Cost and limits

The chair uses 56 triangles and joins the existing seat-material batch. Supports, stairs, rails and roof use the existing material batches and sign atlas. No new material or texture is required by the stand. The sampled warmed scene remains at 47 geometries / 20 textures through pause and twenty seconds of aftermath.

A Node-only CPU microbenchmark sampled 600 changing-pressure frames, three jets and forty points per jet. Before avoiding repeated ground-height work it measured median/p95 1.267/1.941 ms; the final sample measured 0.339/0.496 ms. These sequential local measurements are diagnostic, not controlled renderer timings or certified frame rates. Full-scene software performance and sustained target-device acceptance remain open.

Iteration caught and fixed missing tier dimensions, a column obscuring the title, two premature water contacts in empty space, and spray penetrating a new chair back/pier. Final geometry and contact runs pass in both renderers after the contact-cache optimization.

Remaining: complete landmark/dogleg composition, stronger two-vehicle misreading, additional environment/rig/actor detail, natural dramatic pacing, human comprehension/listening/fun/terror playtests, physical devices, full campaign and sustained performance qualification. The 72-item implementation goal stays active and incomplete.
