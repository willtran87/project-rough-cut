# Current Level 1 visual survey

The comprehensive upgrade remains open. `tools/survey-course-visuals.cjs` captured 14 legal gameplay viewpoints at 2560×1600: opening, audit row, water approach/crossing, clubhouse, service building/maze, dead green, night range, release, drain, woodland, and two verge distances. `output/level-one-visual-survey/current` is the original survey; `rounded-verge` is the later plant-lighting comparison. These are static survey views, not full-playthrough acceptance.

## Findings that changed the implementation order

1. Small verge plants used unlit materials and stayed blue-green in dark areas. Corrected with actual source response and rounded clump shading; exact planting and movement contact preserved. A plain flat-normal Lambert attempt was rejected because lit plants became black cutouts.
2. Ponds had smooth green oval rims, large regular strokes and black reed cards. The current pond-bank pass adds irregular physical banks, matched water cuts, darker shallow detail and rounded reed shading. See the separate verge/pond QA for accepted captures and remaining limits.
3. Service-building timber and warm practical light form a useful close-environment benchmark. Keep that local detail/material quality when improving other structures, rather than adding uniform ambient fill.
4. Large black hedge/vegetation masses obscure some spatial layers. Upcoming composition work should use silhouettes, framing, selective local light and gaps; the user's low-ambient direction remains fixed.
5. Important props and structures have uneven construction/detail. Floodlight and workshop passes improve selected objects, but the normal-distance comparison across all props is still missing.
6. Joe/player close inspection and encounter motion are not covered by these 14 views. Capture actual front/quarter/side encounters next before accepting character or machinery requirements. Existing character source or old QA alone is not current artistic acceptance.

## Next broad review

Continue V04 composition and V12/V13 actor/mower review alongside the remaining V15 water work. Then audit V01 pixel density/material ramps across matched near/mid/far views. The full subitem list in `design/level-one-comprehensive-visual-upgrade.md` is authoritative; this survey does not remove or close any requirement.
