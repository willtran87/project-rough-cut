# Visual upgrade pass 1 — materials, root profiles, vaults and fixtures

Full goal remains active: implement all 53 items in design/under-green-visual-upgrade-plan-2026-11-13.md. This pass is not a completion claim for the whole plan. Per-item status is in design/under-green-visual-upgrade-ledger.json.

Implemented eight illustrated material surfaces, independently authored wetness masks, world-anchored broad color variation and darkened masonry bases. Generated two native 1254x1254 atlases via built-in image_gen, retained masters/prompts in assets/environment/under-green, and copied runtime assets into web/assets/under-green. Each quadrant is sampled into a native 627x627 repeating texture. Albedo is never used as relief/gloss. Structural relief is geometry. A first procedural brick candidate looked too regular in actual gameplay and was replaced with the illustrated material art; the discarded generator is not retained in production.

Roots now use varying fluted cross-sections, local knot swelling, finer geometry and physically scaled bark UVs. Mud banks have five rounded cross-section rows and smoother broad deposit variation within the existing wall-clearance envelope. Three shallow gallery vaults replace portions of the flat roof silhouette without crossing the maintenance-shaft opening. Practical lamps have cages, gaskets, rivets, hoods and ceramic bases. Signals have inset lens rings, hoods, fasteners and a reusable textured lens; state/shape/color behavior is unchanged.

Verification:

- tools/verify-under-green-visual-upgrade.cjs: 12 views at 2560x1600, 1280x720, 390x844 and 844x390; actual native GPU target 2560x1600 on RTX3090 D3D11. Includes six wide/close/district views, W movement, Q rear glance and frozen pause. Zero page/console/shader errors.
- Same harness --software: 12 views, actual 960x600 target at the high-resolution viewport, SwiftShader. Same controls/assertions and zero errors. Inspected final hardware gallery, close bark/masonry, keeper, bunker, mobile and landscape views, and software gallery capture.
- tools/verify-under-green-moving-clearance.cjs --dry after final fixtures: 1,379 rendered route frames, 106 actual geometry audits, zero scenery intersections. Foot/hand/camera checks pass; max foot error 2.5e-7m.
- Installed web_game_playwright_client.js: four bursts through the intro and into movement; final player y12.68, playing mode, actual screenshot/state inspected, no error artifacts.
- Current hardware view draw counts: roots253, close109, bunker283, pump77, range147, keeper59. Root view triangles587460, textures51 growing to57 after additional district visibility, programs26. These are resource observations, not a frame-time performance acceptance. Root geometry cost and new texture decode/memory need the planned matched before/after profiling gate.

Known remaining work includes authored material variants/seam review, less regular wall/root distribution, contact detail and fine growth, district overhead composition, pump/sluice/prop overhaul, moving shadows/local humidity, water/flood contact effects, actor/scythe/ghost polish, UI/story consistency and full performance/accessibility gates. Do not mark the 53-item goal complete from this pass.

Evidence: output/under-green/visual-upgrade/{hardware,software,clearance,client}. Initial source snapshots before this pass: output/under-green/visual-upgrade/baseline/. The review-day capture directory retains pre-upgrade images; the attempted first recapture failed before writing. Subsequent captures use visual-upgrade/materials instead.

All verification jobs terminal. Server4187 retained. No commit/deploy; other chapters' working changes preserved.
